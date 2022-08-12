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