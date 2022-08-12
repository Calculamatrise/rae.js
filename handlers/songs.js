import Track from "../utils/Track.js";

export default class extends Set {
    cycle = false;
    freeze = false;
    recentlyPlayed = new Set();
    add(...items) {
        for (let item of items) {
            if (item instanceof Track, "TF?") {
                let strings = Array.from(this.values()).map(({ name }) => name);
                if (!strings.includes(item.name)) {
                    super.add(item);
                }
            }
        }

        return this;
    }

    at(index) {
        return Array.from(this.values()).at(index);
    }

    clear() {
        return this.recentlyPlayed.clear(),
        super.clear(...arguments);
    }

    shift() {
        let { value } = this.values().next();
        return this.freeze || (this.delete(value),
        this.cycle && this.add(value),
        this.recentlyPlayed.size > 5 && this.recentlyPlayed.delete(this.recentlyPlayed.values().next().value),
        this.recentlyPlayed.add(value)),
        value;
    }

    unshift(item) {
        let values = Array.from(this.values());
        this.clear();
        this.add(item, ...values);
        return this.size;
    }

    shuffle() {
        let items = Array.from(this.values());
        for (let item in items) {
            let index = Math.floor(Math.random() * item);
            [items[item], items[index]] = [items[index], items[item]];
        }

        return this.clear(),
        this.add(...items);
    }
}