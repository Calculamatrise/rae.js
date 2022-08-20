import { createAudioResource, StreamType } from "@discordjs/voice";
import spdl from "spdl-core";
import ytdl from "ytdl-core";

export default class {
    #engine = null;
    #stream = null;
    #streamType = StreamType.Arbitrary;

    name = null;
    url = null;
    playing = false;
    options = {
        seek: 0
    }

    get engine() {
        if (this.#engine === null) {
            this.#engine = new URL(this.url).hostname.split(".").at(-2);
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
                case 'name':
                case 'title': {
                    this.name = options[key];
                    break;
                }

                case 'url': {
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
                }
            }
        }
    }

    async createAudioResource() {
        if (this.#stream === null) {
            if (this.engine == "spotify") {
                this.#stream = await spdl(this.url, {
                    seek: this.options.seek / 1000,
                    filter: "audioonly",
                    format: "mp3",
                    highWaterMark: 1 << 25,
                    quality: "highestaudio"
                });
                this.#streamType = StreamType.Raw;
            } else if (this.engine == "youtube") {
                this.#stream = ytdl(this.url, {
                    begin: this.options.seek,
                    filter: "audioonly",
                    format: "ogg",
                    highWaterMark: 1 << 25,
                    quality: "highestaudio"
                });
                this.#streamType = StreamType.Arbitrary;
            }
        }

        console.log(this.#stream.type, this.#stream.encoder)

        this.playing = true;
        return this.resource;
    }
}