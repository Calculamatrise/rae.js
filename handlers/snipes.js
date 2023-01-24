export default class {
    edits = new Map();
    messages = new Map();
    reactions = new Map();
    get(type, id, user) {
        if (!this.hasOwnProperty(type + 's')) {
            throw new TypeError(type + " is not a type.");
        }

        const channel = this[type + 's'].get(id);
        if (!channel) {
            return null;
        }

        if (user != void 0) {
            return channel.filter(function(snipe) {
                return snipe.message.author.id == user;
            })[0];
        }

        return channel.slice(-1)[0];
    }

    set(type, id, data) {
        if (!this.hasOwnProperty(type + 's')) {
            throw new TypeError(type + " is not a type.");
        }

        const cache = this[type + 's'];
        if (!cache.has(id)) {
            cache.set(id, []);
        }

        const channel = cache.get(id);
        channel.push(data);
        return data;
    }
}