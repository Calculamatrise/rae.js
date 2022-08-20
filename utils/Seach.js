import fetch from "node-fetch";
import spoof from "spotify-url-info";

const { getData, getTracks } = spoof(fetch);

import spdl from "spdl-core";
import ytdl from "ytdl-core";
import ytpl from "ytpl";
import ytsr from "ytsr";

import Playlist from "./Playlist.js";
import Track from "./Track.js";

export default class {
    /**
     * Search for a song or playlist
     * @param {String} query
     * @param {Object} options
     * @param {Function} callback
     * @returns {(Playlist|Track)}
     */
    static async query(query, options = {}) {
        if (spdl.validateURL(query)) {
            return new Track(await spdl.getInfo(query));
        } else if (ytdl.validateURL(query)) {
            return new Track(await ytdl.getInfo(query));
        }

        const data = await this.playlist(query).catch(() => this.video(query, options));
        const callback = Array.from(arguments).at(-1);
        if (typeof callback == 'function') {
            callback(data);
        }

        return data;
    }

    static async playlist(query) {
        if (/(https?:\/\/)?((www|m|music)\.)?youtu\.?be(\.com)?\/playlist\?list=[^&]*/i.test(query)) {
            return new Playlist(await ytpl(query));
        }

        return new Playlist(await getData(query));
    }

    static async video(query, { limit = 1 } = {}) {
        if (spdl.validateURL(query)) {
            return new Track(await spdl.getInfo(query));
        } else if (ytdl.validateURL(query)) {
            return new Track(await ytdl.getInfo(query));
        }

        return ytsr(query.replace(/.*(?<=v=)|(?=&).*/g, ''), { limit }).then(function({ items }) {
            if (limit == 1) return new Track(items[0]);
            return items.map(function(track) {
                return new Track(track);
            });
        });
    }
}