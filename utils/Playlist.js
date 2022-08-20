import Track from "./Track.js";

export default class {
    author = null;
    name = null;
    url = null;
    entries = [];

    constructor(options = {}) {
        for (const key in options) {
            switch(key) {
                case 'author': {
                    this.author = options[key].name;
                    break;
                }

                case 'owner': {
                    this.author = options[key].display_name ?? null;
                    break;
                }

                case 'name':
                case 'title': {
                    this.name = options[key] ?? null;
                    break;
                }

                case 'url': {
                    this.url = options[key] ?? null;
                    break;
                }

                case 'external_urls': {
                    this.url = options[key].spotify ?? null;
                    break;
                }

                case 'items': {
                    this.entries = options[key].map(function(item) {
                        return new Track(item);
                    });
                    break;
                }

                case 'tracks': {
                    if (typeof options[key] == 'object') {
                        return new this.constructor({ ...options, ...options[key] });
                    }
                }
            }
        }
    }
}