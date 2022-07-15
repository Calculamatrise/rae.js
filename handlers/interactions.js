export default class {
    #events = new Map();
    get length() {
        return this.#events.size;
    }

    on(event, structure) {
        if (event === void 0 ||typeof event !== "string") {
            throw TypeError("INVALID_LISTENER");
        }

        return this.#events.set(event, structure);
    }

    emit(event, ...args) {
        if (typeof event != "string") {
            throw new Error("INVALID_EVENT");
        }

        let structure = this.get(event);
        if (typeof structure.execute != "function") {
            return false;
        }

        return structure.execute(...args);
    }

    each(callback = event => event) {
        this.#events.forEach(callback);
    }

    keys() {
        return this.#events.keys();
    }

    values() {
        return this.#events.values();
    }

    get(event) {
        for (const item of this.values()) {
            if (!item.data) {
                continue;
            }

            if (item.data instanceof Array) {
                for (const metadata of item.data) {
                    if (metadata.name == event) {
                        return item;
                    }
                }
            }

            if (item.data.name == event) {
                return item;
            }
        }

        return this.#events.get(event);
    }

    has(event, meta = false) {
        if (meta) {
            for (const item of this.values()) {
                if (item.data instanceof Array) {
                    for (const metadata of item.data) {
                        if (metadata.name == event) {
                            return true;
                        }
                    }
                }
            }

            return false;
        }

        return this.#events.has(event);
    }
}