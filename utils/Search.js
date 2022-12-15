import spoof from "spotify-url-info";

const { getData, getTracks } = spoof(fetch);

import ytdl from "ytdl-core";
import ytpl from "ytpl";
import ytsr from "ytsr";

import Playlist from "./Playlist.js";
import Track from "./Track.js";

export default class {
    static expressions = {
        spotify: {
            album: /^(https?:\/\/)?(?:open|play)\.spotify\.com\/album\/[\w\d]+$/i,
            playlist: /^(https?:\/\/)?(?:open|play)\.spotify\.com\/playlist\/[\w\d]+$/i,
            track: /^(https?:\/\/)?(?:open|play)\.spotify\.com\/track\/[\w\d]+$/i,
        },
        youtube: {
            playlist: /^(https?:\/\/)?((www|m|music)\.)?youtu\.?be(\.com)?\/playlist\?list=[^&]*/i
        }
    }

    static validateSpotifyURL(url, type = 'track') {
        if (this.expressions.spotify[type] instanceof RegExp) {
            return this.expressions.spotify[type].test(url.replace(/\?.*/, ''));
        }

        return false;
    }

    /**
     * Search for a song or playlist
     * @param {String} query
     * @param {Object} options
     * @param {Function} callback
     * @returns {(Playlist|Track)}
     */
    static async query(query, options = {}) {
        if (query.length > 0 && (this.validateSpotifyURL(query) || ytdl.validateURL(query))) {
            return this.video(query);
        }

        const data = await this.playlist(query).catch(() => this.video(query, options));
        const callback = Array.from(arguments).at(-1);
        if (typeof callback == 'function') {
            callback(data);
        }

        return data;
    }

    static async playlist(query) {
        if (this.expressions.youtube.playlist.test(query)) {
            return new Playlist(await ytpl(query));
        }

        return new Playlist(await getData(query));
    }

    static async video(query, { limit = 1 } = {}) {
        if (this.validateSpotifyURL(query)) {
            return new Track(await getData(query));
        } else if (ytdl.validateURL(query)) {
            return new Track(await ytdl.getBasicInfo(query).then(({ videoDetails }) => videoDetails));
        }

        return ytsr(query.replace(/.*(?<=v=)|(?=&).*/g, ''), { limit }).then(function({ items }) {
            if (limit == 1) return new Track(items[0]);
            return items.map(function(track) {
                return new Track(track);
            });
        });
    }
}