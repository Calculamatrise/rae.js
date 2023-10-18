export default class {
	#events = new Map();
	on(event, listener) {
		if (typeof event != 'string') {
			throw TypeError("INVALID_LISTENER");
		}

		return this.#events.set(event, listener);
	}

	emit(event, ...args) {
		if (typeof event != 'string') {
			throw new TypeError("INVALID_EVENT");
		}

		let structure = this.get(event);
		if (typeof structure.execute == 'function') {
			return structure.execute(...args);
		}

		return false;
	}

	keys() {
		return this.#events.keys();
	}

	values() {
		return this.#events.values();
	}

	get(event) {
		for (const item of this.#events.values()) {
			for (const menu in item.menus) {
				if (item.menus[menu].name == event) {
					return item;
				}
			}
		}

		return this.#events.get(event);
	}

	has(event, meta = false) {
		if (meta) {
			for (const item of this.#events.values()) {
				for (const menu in item.menus) {
					if (item.menus[menu].name == event) {
						return true;
					}
				}
			}

			return false;
		}

		return this.#events.has(event);
	}
}