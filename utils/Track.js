import { createAudioResource, StreamType } from "@discordjs/voice";
import spdl from "spdl-core";
import ytdl from "ytdl-core";

export default class {
    constructor({ name, url, engine, options = {}} = {}) {
        this.name = name;
        this.url = url;
        this.engine = engine;
        this.options = {
            ...this.options,
            ...options
        }
    }
    name = null;
    url = null;
    engine = null;
    resource = null;
    looping = false;
    playing = false;
    options = {
        seek: 0
    }
    async createAudioResource() {
        this.playing = true;
        if (this.stream ?? true) {
            if (this.engine == "spotify") {
                this.stream = await spdl(this.url, {
                    seek: this.options.seek / 1000,
                    filter: "audioonly",
                    fmt: "ogg",
                    quality: "highestaudio"
                });
            } else if (this.engine == "youtube") {
                this.stream = ytdl(this.url, {
                    begin: this.options.seek,
                    filter: "audioonly",
                    format: "ogg",
                    highWaterMark: 1 << 25,
                    quality: "highestaudio"
                });
            }
        }

        this.resource = createAudioResource(this.stream, {
            inlineVolume: true,
            inputType: StreamType.Arbitrary,
            metadata: this
        });

		return this.resource;
	}
}