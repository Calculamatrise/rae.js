import { AudioPlayerStatus, createAudioPlayer, joinVoiceChannel } from "@discordjs/voice";
import { BaseGuildVoiceChannel } from "discord.js";
import ytsr from "ytsr";
import ytpl from "ytpl";
import fetch from "node-fetch";
import spoof from "spotify-url-info";

const { getData } = spoof(fetch);

import Track from "./Track.js";

export default class {
    constructor(interaction) {
        this.interaction = interaction;
        this.connection = interaction.member.voice.channel.join();

        this.player = createAudioPlayer();
        this.player.on(AudioPlayerStatus.Idle, async () => {
            let first = this.songs[0];
            if (first) {
                if (first.options.exit) {
                    first.options.exit = false;
                } else {
                    first.options = {
                        seek: 0
                    }
                }
            }

            let song = this.stopped ? first : this.shift();
            if (song == void 0) {
                this.stopped = true;
                return;
            }

            await this.play(song);
            this.interaction.editReply({
                content: `**Now playing**\n[${song.name}](<${song.url}>)`
            }).catch(function(error) {
                console.error(`Player: ${error.message}`);
            });
        });

		this.player.on("error", (error) => {
            if (error.resource && error.resource.metadata && error.resource.playbackDuration) {
                error.resource.metadata.options.seek += error.resource.playbackDuration;
                error.resource.metadata.options.exit = true;
            }

            console.error("Player: " + error.message);
		});

        this.songs = [];
        this.volume = 100;
        this.stopped = true;
        this.repeatQueue = false;
        this.page = 1;

        this.recentlyPlayed = [];
        this.recentlyPlayed.push = function() {
            if (this.length > 5) {
                this.shift();
            }

            return Array.prototype.push.apply(this, arguments);
        }
    }

    get repeatOne() {
        return this.songs.length > 0 && this.songs[0].looping;
    }

    back() {
        let currentSong = this.songs[0];
        if (this.recentlyPlayed.length > 0)
            this.songs.unshift(this.recentlyPlayed.pop());

        this.stopped = true;
        this.play(this.songs[0]);

        return currentSong;
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

        if (this.songs.length > 0 && this.songs[0].looping) {
            this.setQueueLoop(true);
            return;
        }

        this.setLoop(true);
    }

    pause() {
        this.player.pause();
        this.stopped = true;
        return this.songs[0];
    }

    resume() {
        this.player.unpause();
        this.stopped = false;
        return this.songs[0];
    }

    setLoop(enabled) {
        if (this.songs.length > 0) {
            this.songs[0].looping = enabled;
            if (this.songs[0].looping)
                this.repeatQueue = false;

            return this.songs[0].looping;
        }

        return false;
    }

    setQueueLoop(enabled) {
        this.repeatQueue = enabled;
        if (this.repeatQueue && this.songs.length > 0)
            this.songs[0].looping = false;

        return this.repeatQueue;
    }

    shift() {
        if (this.songs.length > 0 && this.songs[0].looping)
            return this.songs[0];

        if (this.repeatQueue)
            this.songs.push(this.songs[0]);

        this.recentlyPlayed.push(this.songs.shift());
        if (this.songs.length < 1) {
            return null;
        }

        return this.songs[0];
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
        let currentSong = this.songs[0];
        return this.player.stop(), currentSong;
    }

    stop() {
        this.connection.destroy();
        if (this.interaction.replied) {
            this.interaction.editReply({
                components: []
            }).catch(() => {});
        }

        return this.interaction.client.queues.cache.delete(this.interaction.guildId);
    }


    toggleLoop() {
        return this.setLoop(this.songs.length > 0 && !this.songs[0].looping);
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

        if (!this.stopped && (this.songs[0].playing && !song.playing)) {
            return song;
        }

        song = this.songs[0];
        if (this.connection.subscription) {
            this.connection.subscription.unsubscribe();
        }

        this.player.play(await song.createAudioResource());
        this.connection.subscription = this.connection.subscribe(this.player);

        this.stopped = false;

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