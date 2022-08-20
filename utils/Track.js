import { createAudioResource, StreamType } from "@discordjs/voice";
import spdl from "spdl-core";
import ytdl from "ytdl-core";

export default class {
    constructor(options = {}) {
        // console.log(options);
        for (const key in options) {
            switch(key) {
                case 'name':
                case 'title': {
                    this.name = options[key];
                    break;
                }

                case 'url': {
                    this.engine = 'youtube';
                    this.url = options[key];
                    break;
                }

                case 'external_urls': {
                    this.engine = 'spotify';
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
    name = null;
    url = null;
    engine = null;
    resource = null;
    playing = false;
    stream = null;
    streamType = StreamType.Arbitrary;
    options = {
        seek: 0
    }
    async createAudioResource() {
        if (this.stream ?? true) {
            if (this.engine == "spotify") {
                this.stream = await spdl(this.url, {
                    seek: this.options.seek / 1000,
                    filter: "audioonly",
                    format: "mp3",
                    highWaterMark: 1 << 25,
                    quality: "highestaudio"
                });
                this.streamType = StreamType.Raw;
            } else if (this.engine == "youtube") {
                this.stream = ytdl(this.url, {
                    begin: this.options.seek,
                    filter: "audioonly",
                    format: "ogg",
                    highWaterMark: 1 << 25,
                    quality: "highestaudio"
                });
                this.streamType = StreamType.Arbitrary;
            }
        }

        this.playing = true;
        this.resource = createAudioResource(this.stream, {
            inlineVolume: true,
            inputType: this.streamType,
            metadata: this
        });

		return this.resource;
	}
}