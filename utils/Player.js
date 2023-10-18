import { AudioPlayer, AudioPlayerStatus, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import { BaseGuildVoiceChannel } from "discord.js";

import Playlist from "./Playlist.js";
import Search from "./Search.js";

export default class Player extends AudioPlayer {
	connection = null;
	interaction = null;
	queue = [];
	constructor() {
		super({
			behaviors: {
				noSubscriber: NoSubscriberBehavior.Play
			}
		});

		this.queue.cache = [];
		this.queue.cycle = false;
		this.queue.freeze = false;
		this.on(AudioPlayerStatus.Playing, ({ resource }) => {
			if (resource.metadata) {
				resource.metadata.playing = true;
				this.interaction !== null && this.interaction.editReply({
					content: `**Now playing**\n[${resource.metadata.name}](<${resource.metadata.url}>)`
				}).catch(console.error);
			}
		});

		this.on(AudioPlayerStatus.Idle, async () => {
			this.currentTrack && (this.currentTrack.playing = false);
			if (!this.queue.freeze) {
				let track = this.queue.shift();
				if (this.queue.cycle) {
					this.queue.push(track);
				}
			}

			if (this.queue.length > 0) {
				this.play();
			} else if (this.interaction !== null && this.interaction.replied) {
				this.interaction.editReply({ components: [] }).catch(e => { });
				this.interaction = null;
			}
		});

		this.on('error', error => {
			if (/403$/.test(error.message)) {
				super.play(error.resource.metadata.resource);
				return;
			}

			console.error('Player:', error.message);
		});
	}

	get currentTrack() {
		return this.queue[0] || null;
	}

	get stopped() {
		return this.state.status != 'playing';
	}

	init(interaction) {
		this.interaction = interaction;
		this.connection = interaction.member.voice.channel.join();
		this.connection.subscription = this.connection.subscribe(this);
	}

	back() {
		let currentSong = this.queue[0];
		if (this.queue.cache.length > 0) {
			this.queue.unshift(this.queue.cache.shift());
		}

		super.stop();
		return currentSong;
	}

	loop(state = true) {
		if (state == false || this.queue.cycle) {
			this.setQueueLoop(false);
			this.setLoop(false);
			return;
		} else if (this.queue.freeze) {
			this.setQueueLoop(true);
			return;
		}

		this.setLoop(true);
	}

	setLoop(enabled) {
		this.queue.cycle = false;
		return this.queue.freeze = enabled;
	}

	setQueueLoop(enabled) {
		this.queue.freeze = false;
		return this.queue.cycle = enabled;
	}

	shuffle() {
		for (let item in this.queue) {
			let index = Math.floor(Math.random() * item);
			[this.queue[item], this.queue[index]] = [this.queue[index], this.queue[item]];
		}

		return this.queue;
	}

	skip() {
		let currentSong = this.queue[0];
		return super.stop(), currentSong;
	}

	stop() {
		if (this.connection !== null) {
			if (this.connection.subscription !== null) {
				this.connection.subscription.unsubscribe();
				this.connection.subscription = null;
			}

			this.connection.destroy();
			this.connection = null;
		}

		if (this.interaction !== null && this.interaction.replied) {
			this.interaction.editReply({ components: [] }).catch(e => { });
			this.interaction = null;
		}

		this.queue.splice(0, this.queue.length);
		this.loop(false);
		this.stopped || super.stop();
	}

	async search(query) {
		const data = await Search.query(query);
		if (data instanceof Playlist) {
			for (const track of data.entries) {
				this.queue.push(track);
			}
		} else {
			this.queue.push(data);
		}

		return this.queue.at(-1);
	}

	async play() {
		if (this.queue.length < 1) {
			throw new Error("No tracks in queue!");
		}

		const song = this.queue[0];
		if (!this.stopped && song.playing) {
			return song;
		}

		song.playing = true;
		super.play(song.resource);
		return song;
	}
}

BaseGuildVoiceChannel.prototype.join = function (deaf = true) {
	return joinVoiceChannel({
		channelId: this.id,
		guildId: this.guildId,
		adapterCreator: this.guild.voiceAdapterCreator,
		selfDeaf: deaf
	});
}

process.env['YTDL_NO_UPDATE'] = true;