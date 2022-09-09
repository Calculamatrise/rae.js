import { createAudioResource, StreamType } from "@discordjs/voice";
import ytdl from "ytdl-core";

import fetch from "node-fetch";

import { Readable } from "stream";
import { createReadStream } from "fs";

import http from "http";
import https from "https";
import Search from "./Search.js";

export default class {
    #engine = null;
    #stream = null;
    #streamType = StreamType.Arbitrary;

    artist = null;
    name = null;
    url = null;
    playing = false;
    options = {
        seek: 0
    }

    get engine() {
        if (this.#engine === null) {
            try {
                this.#engine = new URL(this.url).hostname.split(".").at(-2);
            } catch {}
        }

        return this.#engine;
    }

    get resource() {
        return createAudioResource(this.#stream, {
            inlineVolume: true,
            inputType: this.#streamType,
            metadata: this
        });
    }

    constructor(options = {}) {
        for (const key in options) {
            switch(key) {
                case 'artists': {
                    if (options[key] instanceof Array) {
                        for (const artist of options[key]) {
                            if (typeof artist == 'object' && (artist.type == 'artist' || options[key].length == 1)) {
                                this.artist = artist.name;
                                break;
                            }
                        }
                    }
                    break;
                }

                case 'name':
                case 'title': {
                    this.name = options[key];
                    break;
                }

                case 'url':
                case 'video_url': {
                    this.url = options[key];
                    break;
                }

                case 'external_urls': {
                    this.url = options[key].spotify;
                    break;
                }

                case 'options': {
                    const config = options[key];
                    for (const key in config) {
                        switch(key) {
                            case 'seek': {
                                this.options.seek = config[key];
                                break;
                            }
                        }
                    }
                    break;
                }

                case 'track': {
                    if (typeof options[key] == 'object') {
                        return new this.constructor(options[key]);
                    }
                    break;
                }
            }
        }
    }

    async createAudioResource() {
        if (this.#stream === null || true) {
            switch(this.engine) {
                case 'spotify': {
                    const video = await Search.video(this.name + ' by ' + this.artist);
                    this.#stream = ytdl(video.url, {
                        begin: this.options.seek,
                        filter: "audioonly",
                        highWaterMark: 1 << 25,
                        quality: "highestaudio"
                    });
                    this.#streamType = StreamType.Arbitrary;
                    break;
                }

                case 'youtube': {
                    this.#stream = ytdl(this.url, {
                        begin: this.options.seek,
                        filter: "audioonly",
                        highWaterMark: 1 << 25,
                        quality: "highestaudio"
                    });
                    this.#streamType = StreamType.Arbitrary;
                    break;
                }

                default: {
                    // const stream = new Readable();
                    // https.get(this.url, (stream) => {
                    //     console.log(Readable.from(stream))
                    //     // stream.pipe(stream);
                    // });

                    this.#stream = this.url;
                    this.#streamType = StreamType.Raw;
                }
            }
        }

        this.playing = true;
        return this.resource;
    }
}