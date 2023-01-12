export default class {
    types = ['message', 'edit', 'reaction'];
    constructor() {
        for (const e of this.types) {
            this[e] = new Map();
        }
    }

    get(type, id, user) {
        if (!this.types.includes(type)) {
            throw new TypeError(type + " is not a type.");
        }

        const channel = this[type].get(id);
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
        if (!this.types.includes(type)) {
            throw new TypeError(type + " is not a type.");
        } else if (!this[type].has(id)) {
            this[type].set(id, []);
        }

        const channel = this[type].get(id);
        return channel.push(data),
        data;
    }
}