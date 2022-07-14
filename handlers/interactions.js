export default class {
    #events = new Map();
    get length() {
        return this.#events.size;
    }

    on(event, func = function() {}) {
        if (event === void 0 ||typeof event !== "string") {
            throw TypeError("INVALID_LISTENER");
        }

        return this.#events.set(event, func);
    }

    emit(event, interaction, ...args) {
        if (!event || typeof event !== "string") {
            throw new Error("INVALID_EVENT");
        }

        event = this.get(event);
        if (!event && typeof event !== "function") {
            throw new Error("INVALID_FUNCTION");
        }

        let method = interaction.isButton() ? "click" : interaction.isSelectMenu() ? "select" : "execute";
        if (typeof event[method] !== "function") {
            return false;
        }

        return event[method](interaction, ...args);
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