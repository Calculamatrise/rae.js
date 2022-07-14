export default class {
    constructor() {
        for (const e of this.types) {
            this[e] = new Map();
        }
    }
    types = ["message", "edit", "reaction"];
    get(type, id, user) {
        if (!this.types.includes(type)) {
            throw new Error(type + " is not a type.");
        }

        if (user != void 0) {
            const channel = this[type].get(id);
            if (!channel) {
                return null;
            }

            return channel.filter(function(snipe) {
                return snipe.author.id == user;
            })[0];
        }

        const channel = this[type].get(id);
        if (!channel) {
            return null;
        }

        return channel.slice(-1)[0];
    }

    set(type, id, data) {
        if (!this.types.includes(type)) {
            throw new Error(type + " is not a type.");
        }

        if (!this[type].has(id)) {
            this[type].set(id, []);
        }

        const channel = this[type].get(id);
        channel.push(data);
        return data;
    }
}