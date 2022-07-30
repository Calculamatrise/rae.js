import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { BaseGuildVoiceChannel } from "discord.js";
import ytsr from "ytsr";
import ytpl from "ytpl";
import fetch from "node-fetch";
import spoof from "spotify-url-info";

const { getData } = spoof(fetch);

import Track from "./Track.js";

export default class {
    constructor() {
        this.player.on(AudioPlayerStatus.Idle, async () => {
            let song = this.shift();
            if (song == void 0) return;

            await this.play(song);
            this.interaction.editReply({
                content: `**Now playing**\n[${song.name}](<${song.url}>)`
            }).catch(function(error) {
                console.error(`Player: ${error.message}`);
            });
        });

		this.player.on("error", (error) => {
            console.error("Player:", error.message);
		});
    }
    connection = null;
    interaction = null;
    page = 1;
    player = createAudioPlayer();
    repeatQueue = false;
    recentlyPlayed = new (class extends Array {
        unshift() {
            this.length > 5 && this.pop();
            return super.unshift.apply(this, arguments);
        }
    })();
    songs = [];
    volume = 100;
    get currentTrack() {
        return this.songs[0] || null;
    }

    get stopped() {
        return this.player.state.status != "playing";
    }

    init(interaction) {
        this.interaction = interaction;
        this.connection = interaction.member.voice.channel.join();
    }

    back() {
        let currentSong = this.currentTrack;
        if (this.recentlyPlayed.length > 1) {
            this.songs.splice(1, 0, this.recentlyPlayed.shift());
        }

        return this.player.stop(), currentSong;
    }

    clear() {
        this.songs = [];
        return this.songs;
    }

    loop(state = true) {
        if (state == false || this.repeatQueue) {
            this.setQueueLoop(false);
            this.setLoop(false);
            return;
        }

        if (this.currentTrack?.looping) {
            this.setQueueLoop(true);
            return;
        }

        this.setLoop(true);
    }

    pause() {
        this.player.pause();
        return this.currentTrack;
    }

    resume() {
        this.player.unpause();
        return this.currentTrack;
    }

    setLoop(enabled) {
        if (this.songs.length > 0) {
            this.currentTrack.looping = enabled;
            if (this.currentTrack.looping)
                this.repeatQueue = false;

            return this.currentTrack.looping;
        }

        return false;
    }

    setQueueLoop(enabled) {
        this.repeatQueue = enabled;
        if (this.repeatQueue && this.songs.length > 0)
            this.currentTrack.looping = false;

        return this.repeatQueue;
    }

    shift() {
        if (this.currentTrack?.looping) {
            return this.currentTrack;
        }

        this.repeatQueue && this.songs.push(this.currentTrack);
        return this.recentlyPlayed.unshift(this.songs.shift()), this.currentTrack || null;
    }

    shuffle() {
        for (const track in this.songs) {
            if (this.songs.hasOwnProperty(track)) {
                let index = Math.floor(Math.random() * track);
                [
                    this.songs[track],
                    this.songs[index]
                ] = [
                    this.songs[index],
                    this.songs[track]
                ];
            }
        }

        return this.songs;
    }

    skip() {
        let currentSong = this.currentTrack;
        return this.player.stop(), currentSong;
    }

    stop() {
        if (this.connection !== null) {
            this.connection.destroy();
            this.connection = null;
        }

        if (this.interaction !== null && this.interaction.replied) {
            this.interaction.editReply({
                components: []
            }).catch(() => {});
            this.interaction = null;
        }

        this.clear();
        this.setLoop(false);
    }


    toggleLoop() {
        return this.setLoop(!this.currentTrack?.looping);
    }

    toggleQueueLoop() {
        return this.setQueueLoop(!this.repeatQueue);
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
                            return new Error("Live videos aren't supported!");
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
            if (search instanceof Error) {
                throw search;
            }

            search instanceof Array ? this.songs.push(...search) : this.songs.push(search);
            song = this.songs.at(-1);
        }

        if (!this.stopped && (this.currentTrack.playing && !song.playing)) {
            return song;
        }

        song = this.currentTrack;
        if (this.connection.subscription) {
            this.connection.subscription.unsubscribe();
        }

        let resource = await song.createAudioResource();
        resource.volume.setVolumeLogarithmic(this.volume / 100);
        this.player.play(resource);
        this.connection.subscription = this.connection.subscribe(this.player);

        return song;
    }

    static getVideo(video, { limit = 1 } = {}) {
        return ytsr(video.replace(/.*(?<=v=)|(?=&).*/g, ""), { limit }).then(function({ items }) {
            if (limit == 1) {
                return items[0];
            }

            return items;
        });
    }

    static getPlaylist(playlist, callback = (response) => response) {
        return ytpl(playlist).then(callback);
    }
}

Array.prototype.replicate = function() {
    return this.push(this.shift()), this.at(-1);
}

BaseGuildVoiceChannel.prototype.join = function(deaf = true) {
    return joinVoiceChannel({
        channelId: this.id,
        guildId: this.guildId,
        adapterCreator: this.guild.voiceAdapterCreator,
        selfDeaf: deaf
    });
}