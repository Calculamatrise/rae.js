import Track from "../utils/Track.js";

export default class extends Set {
    recentlyPlayed = new Set();
    add(...items) {
        for (let item of items) {
            if (item instanceof Track) {
                let strings = Array.from(this.values()).map(({ name }) => name);
                if (!strings.includes(item.name)) {
                    super.add.call(this, item);
                }
            }
        }

        return this;
    }

    shift() {
        let { value } = this.values().next();
        return this.delete(value),
        value;
    }

    unshift(item) {
        let values = Array.from(this.values());
        this.clear();
        this.add(item);
        values.forEach(this.add);
        return this.size;
    }

    shuffle() {
        let items = Array.from(this.values());
        for (let item in items) {
            let index = Math.floor(Math.random() * item);
            [
                items[item],
                items[index]
            ] = [
                items[index],
                items[item]
            ];
        }

        return this.clear(),
        this.add(...items);
    }
}