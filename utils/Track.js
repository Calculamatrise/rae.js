import { createAudioResource, StreamType } from "@discordjs/voice";
import ytdl from "ytdl-core";

export default class {
    #stream = null;
    name = null;
    url = null;
    playing = false;
    options = {
        seek: 0
    }

    get resource() {
        return createAudioResource(this.stream, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary,
            metadata: this
        });
    }

    get stream() {
        // if (this.#stream === null) {
            this.#stream = ytdl(this.url, {
                begin: this.options.seek,
                filter: 'audioonly',
                highWaterMark: 1 << 25,
                quality: 'highestaudio'
            });
        // }

        return this.#stream;
    }

    constructor(options = {}) {
        for (const key in options) {
            switch(key) {
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
}