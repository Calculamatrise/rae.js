import { AudioPlayer, AudioPlayerStatus, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import { BaseGuildVoiceChannel } from "discord.js";

import Playlist from "./Playlist.js";
import Queue from "./Queue.js";
import Search from "./Search.js";
import Track from "./Track.js";

export default class Player extends AudioPlayer {
    constructor() {
        super({
            behaviors: {
                noSubscriber: NoSubscriberBehavior.Play
            }
        });

        this.once(AudioPlayerStatus.Playing, () => {
            let song = this.currentTrack;
            if (this.interaction !== null && song) {
                this.interaction.editReply({
                    content: `**Now playing**\n[${song.name}](<${song.url}>)`
                }).catch(console.error);
            }
        });

        this.on(AudioPlayerStatus.Idle, async () => {
            this.currentTrack.playing = false;
            this.unshift && (this.unshift = false, true) || this.queue.shift();
            if (this.currentTrack !== null) {
                this.play(this.currentTrack);
            }
        });

		this.on("error", error => {
            console.error("Player:", error.message);
            if (this.interaction !== null) {
                this.interaction.editReply({
                    content: `One of my libraries decided to be a pain in the ass: ${error.message}`,
                    components: []
                }).catch(console.error);
            }
		});
    }
    connection = null;
    interaction = null;
    queue = new Queue();
    unshift = false;
    volume = 100;
    get currentTrack() {
        return this.queue.at(0) || null;
    }

    get stopped() {
        return this.state.status != "playing";
    }

    init(interaction) {
        this.interaction = interaction;
        this.connection = interaction.member.voice.channel.join();
        this.connection.subscription = this.connection.subscribe(this);
    }

    back() {
        let currentSong = this.currentTrack;
        if (this.queue.recentlyPlayed.size > 0) {
            let { value } = this.queue.recentlyPlayed.values().next();
            this.queue.recentlyPlayed.delete(value);
            this.queue.unshift(value);
            this.unshift = true;
        }

        return super.stop(), currentSong;
    }

    loop(state = true) {
        if (state == false || this.queue.cycle) {
            this.setQueueLoop(false);
            this.setLoop(false);
            return;
        }

        if (this.queue.freeze) {
            this.setQueueLoop(true);
            return;
        }

        this.setLoop(true);
    }

    setLoop(enabled) {
        return this.queue.freeze = enabled && (this.queue.cycle = false, true);
    }

    setQueueLoop(enabled) {
        return this.queue.cycle = enabled && (this.queue.freeze = false, true);
    }

    skip() {
        let currentSong = this.currentTrack;
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
            this.interaction.editReply({ components: [] }).catch(console.error);
            this.interaction = null;
        }

        this.queue.clear();
        this.loop(false);
        super.stop();
    }

    toggleLoop() {
        return this.setLoop(!this.queue.freeze);
    }

    toggleQueueLoop() {
        return this.setQueueLoop(!this.queue.cycle);
    }

	async search(query) {
        const data = await Search.query(query);
        if (data instanceof Playlist) {
            for (const track of data.entries) {
                this.queue.add(track);
            }
        } else {
            this.queue.add(data);
        }

        return this.queue.at(-1);
	}

    async play(song) {
        if (song !== void 0 && !(song instanceof Track)) {
            let search = await this.search(song);
            search instanceof Array ? this.queue.add(...search) : this.queue.add(search);
            song = this.queue.at(-1);
        }

        if (!this.stopped && (this.currentTrack.playing && !song.playing)) {
            return song;
        }

        song = this.currentTrack;

        let resource = await song.createAudioResource();
        resource.volume.setVolumeLogarithmic(this.volume / 100);
        super.play(resource);
        // await new Promise((resolve, reject) => {
        //     let playing = () => {
        //         this.off('error', errored);
        //         resolve(song);
        //     }

        //     let errored = err => {
        //         this.off(AudioPlayerStatus.Playing, playing);
        //         reject(err.message);
        //     }

        //     this.once(AudioPlayerStatus.Playing, playing);
        //     this.once('error', errored);
        //     super.play(resource);
        // });

        return song;
    }
}

BaseGuildVoiceChannel.prototype.join = function(deaf = true) {
    return joinVoiceChannel({
        channelId: this.id,
        guildId: this.guildId,
        adapterCreator: this.guild.voiceAdapterCreator,
        selfDeaf: deaf
    });
}

process.env['YTDL_NO_UPDATE'] = true;