import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel, NoSubscriberBehavior } from "@discordjs/voice";
import { BaseGuildVoiceChannel } from "discord.js";
import ytsr from "ytsr";
import ytpl from "ytpl";
import fetch from "node-fetch";
import spoof from "spotify-url-info";

const { getData } = spoof(fetch);

import SongHandler from "../handlers/songs.js";
import Track from "./Track.js";

process.env.YTDL_NO_UPDATE = true;

export default class {
    constructor() {
        this.player.on(AudioPlayerStatus.Idle, async () => {
            this.unshift && (this.unshift = false, true) || this.songs.shift();
            if (this.currentTrack !== null) {
                let song = await this.play(this.currentTrack);
                if (this.interaction !== null && song) {
                    this.interaction.editReply({
                        content: `**Now playing**\n[${song.name}](<${song.url}>)`
                    }).catch(console.error);
                }
            }
        });

		this.player.on("error", error => {
            console.error("Player:", error.message);
		});
    }
    connection = null;
    interaction = null;
    player = createAudioPlayer({
        behaviors: {
            noSubscriber: NoSubscriberBehavior.Play
        }
    });
    songs = new SongHandler();
    unshift = false;
    volume = 100;
    get currentTrack() {
        return this.songs.at(0) || null;
    }

    get stopped() {
        return this.player.state.status != "playing";
    }

    init(interaction) {
        this.interaction = interaction;
        this.connection = interaction.member.voice.channel.join();
        this.connection.subscription = this.connection.subscribe(this.player);
    }

    back() {
        let currentSong = this.currentTrack;
        if (this.songs.recentlyPlayed.size > 0) {
            let { value } = this.songs.recentlyPlayed.values().next();
            this.songs.recentlyPlayed.delete(value);
            this.songs.unshift(value);
            this.unshift = true;
        }

        return this.player.stop(), currentSong;
    }

    loop(state = true) {
        if (state == false || this.songs.cycle) {
            this.setQueueLoop(false);
            this.setLoop(false);
            return;
        }

        if (this.songs.freeze) {
            this.setQueueLoop(true);
            return;
        }

        this.setLoop(true);
    }

    setLoop(enabled) {
        return this.songs.freeze = enabled && (this.songs.cycle = false, true);
    }

    setQueueLoop(enabled) {
        return this.songs.cycle = enabled && (this.songs.freeze = false, true);
    }

    skip() {
        let currentSong = this.currentTrack;
        return this.player.stop(), currentSong;
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

        this.songs.clear();
        this.loop(false);
    }

    toggleLoop() {
        return this.setLoop(!this.songs.freeze);
    }

    toggleQueueLoop() {
        return this.setQueueLoop(!this.songs.cycle);
    }

	search(query) {
        return getData(query).then(data => {
            switch(data.type) {
                case "track":
                    return new Track({
                        name: data.name,
                        url: data.external_urls.spotify,
                        engine: "spotify"
                    });

                default:
                    return data.tracks.items.filter(({ track }) => track?.external_urls?.spotify).map(function({ track }) {
                        return new Track({
                            name: track.name,
                            url: track.external_urls.spotify,
                            engine: "spotify"
                        });
                    });
            }
        }).catch(async () => {
            return this.constructor["get" + (query.match(/(https?:\/\/)?((www|m|music)\.)?youtu\.?be(\.com)?\/playlist\?list=[^&]*/gi) ? "Playlist" : "Video")](query).then(data => {
                switch(data.type) {
                    case "video":
                        if (data.isLive || data.badges?.includes("LIVE")) {
                            throw new Error("Live videos aren't supported!");
                        }
        
                        return new Track({
                            name: data.title,
                            url: data.url,
                            engine: "youtube"
                        });
        
                    default:
                        return data.items.filter(({ isLive }) => !isLive).map((video) => {
                            return new Track({
                                name: video.title,
                                url: video.url,
                                engine: "youtube"
                            });
                        });
                }
            });
        });
	}

    async play(song) {
        if (!(song instanceof Track)) {
            let search = await this.search(song);
            search instanceof Array ? this.songs.add(...search) : this.songs.add(search);
            song = this.songs.at(-1);
        }

        if (!this.stopped && (this.currentTrack.playing && !song.playing)) {
            return song;
        }

        song = this.currentTrack;

        let resource = await song.createAudioResource();
        resource.volume.setVolumeLogarithmic(this.volume / 100);
        this.player.play(resource);
        // await new Promise((resolve, reject) => {
        //     this.player.play(resource);
        //     this.player.once(AudioPlayerStatus.Playing, resolve);
        //     this.player.once("error", reject);
        // });

        return song;
    }

    static getVideo(video, { limit = 1 } = {}) {
        return ytsr(video.replace(/.*(?<=v=)|(?=&).*/g, ""), { limit }).then(function({ items }) {
            if (limit == 1) return items[0];
            return items;
        });
    }

    static getPlaylist(playlist, callback = (response) => response) {
        return ytpl(playlist).then(callback);
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