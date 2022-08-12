export default class {
    #events = new Map();
    #metadata = new Map();
    get events() {
        return this.#events.keys();
    }

    /**
     * 
     * @async
     * @param {String} event 
     * @param  {...any} [args] 
     * @returns {Promise}
     */
    async emit(event, ...args) {
        let listeners = Array.from(this.#events.get(event) || []);
        if (typeof this["on" + event] == "function") {
            listeners.push(this["on" + event]);
        }

        let unique = this.#events.get(event + "_once");
        if (unique !== void 0) {
            listeners.push(...unique);
            this.#events.delete(event + "_once");
        }

        let callback = args.at(-1);
        typeof callback == "function" && args.splice(-1, 1);
        return Promise.all(Array.from(new Set(listeners)).map(async listener => {
            let data = { ...this.get(event), response: await listener.apply(this, args) };
            return typeof callback == "function" && callback(data), data;
        }));
    }

    /**
     * 
     * @param {String} event 
     * @param {Function} data 
     * @returns {Number}
     */
    on(event, data) {
        if (typeof event != "string") {
            throw new TypeError("Event must be of type: String");
        }

        let listener = data.execute || data.listener;
        if (typeof listener != "function") {
            throw new TypeError("Listener must be defined as 'execute' or 'listener'");
        }

        if (!this.#metadata.has(event)) {
            this.#metadata.set(event, {
                blacklist: new Set(),
                description: "No description provided.",
                name: event,
                options: null,
                whitelist: new Set()
            });
        }

        let metadata = this.#metadata.get(event);
        metadata.blacklist = data.blacklist ?? metadata.blacklist;
        metadata.description = data.description ?? metadata.description;
        metadata.options = data.options ?? metadata.options;
        metadata.whitelist = data.whitelist ?? metadata.whitelist;

        if (!this.#events.has(event)) {
            this.#events.set(event, new Set());
        }

        let events = this.#events.get(event);
		return events.add(listener),
        events.length;
	}

    get(event) {
        return this.#metadata.get(event) ?? null;
    }
}