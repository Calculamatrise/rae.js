export default class {
	#channel = null;
	#clientId = null;
	#defaults = null;
	#defaultMessageId = null;
	cache = null;
	constructor(channel, clientId, defaults) {
		this.#channel = channel;
		this.#clientId = clientId;
		this.#createDefaults(defaults);
	}
	async #createDefaults(defaults) {
		let channel = this.#channel;
		let filter = message => message.author.id === this.#clientId;
		let messages = channel.messages.cache.filter(filter);
		if (messages.size < 1) {
			messages = await channel.messages.fetch();
			if (messages.size > 0) {
				messages = messages.filter(filter);
			}
		}

		messages = Array.from(messages.values());
		messages.sort((a, b) => a.createdTimestamp - b.createdTimestamp);
		let message = messages[0];
		if (message) {
			let content = message.content;
			if (content.startsWith('`')) {
				let savedDefaults = JSON.parse(content.replace(/^`{3}json|`{3}$/gi, ''));
				if (defaults) {
					Object.assign(savedDefaults, defaults);
					let newContent = '```JSON\n' + JSON.stringify(savedDefaults, null, 4) + '```';
					if (newContent !== content) {
						await message.edit(newContent);
					}
				}

				defaults = savedDefaults;
			}
		} else if (defaults) {
			message = await channel.send('```JSON\n' + JSON.stringify(defaults, null, 4) + '```');
		}

		message && (this.#defaultMessageId = message.id);
		return this.#defaults = defaults;
	}
	async createEntry(data) {
		if (typeof data != 'object') {
			throw new TypeError("Entry is not an object.")
		}

		let channel = this.#channel;
		let entry = await channel.send(JSON.stringify(data));
		this.cache ||= [];
		this.cache.unshift(entry);
		return entry;
	}
	async entries() {
		if (this.cache !== null) {
			return this.cache;
		}

		let channel = this.#channel;
		let filter = message => message.author.id === this.#clientId && message.id !== this.#defaultMessageId;
		let messages = channel.messages.cache.filter(filter);
		if (messages.size < 1) {
			messages = await channel.messages.fetch();
			if (messages.size > 0) {
				messages = messages.filter(filter);
			}

			if (messages.size < 1) {
				return [];
			}
		}

		return this.cache = Array.from(messages.values()).sort((a, b) => a.content.length - b.content.length);
	}
	async create(key, value) {
		return this.update(key, value);
	}
	async get(key) {
		let entries = await this.entries();
		if (entries.length > 0) {
			for (let entry of entries) {
				let data = JSON.parse(entry.content);
				if (data.hasOwnProperty(key)) {
					return data[key];
				}
			}
		}

		return null;
	}
	async has(key) {
		let entries = await this.entries();
		if (entries.length > 0) {
			for (let entry of entries) {
				let data = JSON.parse(entry.content);
				if (data.hasOwnProperty(key)) {
					return true;
				}
			}
		}

		return false;
	}
	async set(key, value) {
		if (!key) {
			throw new TypeError("Key must be a string, or a number greater than 0.");
		}

		let data = {};
		let entries = await this.entries();
		let message = entries.find(entry => {
			let data = JSON.parse(entry.content);
			return data && data.hasOwnProperty(key);
		}) || entries[0];
		if (message) {
			data = JSON.parse(message.content);
		}

		let newValue = Object.assign({}, this.#defaults, value);
		if (JSON.stringify(data[key]) === JSON.stringify(value)) {
			return newValue;
		}

		data[key] = newValue;
		if (message) {
			let content = JSON.stringify(data);
			if (content.length > 2e3) {
				delete data[key];
				await this.createEntry({
					[key]: newValue
				});
			}

			await message.edit(JSON.stringify(data));
		} else {
			await this.createEntry(data);
		}

		return newValue;
	}
	async update(key, value) {
		if (!key) {
			throw new TypeError("Key must be a string, or a number greater than 0.");
		}

		let data = {};
		let entries = await this.entries();
		let message = entries.find(entry => {
			let data = JSON.parse(entry.content);
			return data && data.hasOwnProperty(key);
		}) || entries[0];
		if (message) {
			data = JSON.parse(message.content);
		}

		let newValue = Object.assign({}, this.#defaults, merge(Object.assign({}, data[key]), value));
		if (JSON.stringify(data[key]) === JSON.stringify(value)) {
			return newValue;
		}

		data[key] = newValue;
		if (message) {
			let content = JSON.stringify(data);
			if (content.length > 2e3) {
				delete data[key];
				await this.createEntry({
					[key]: newValue
				});
			}

			await message.edit(JSON.stringify(data));
		} else {
			await this.createEntry(data);
		}

		return newValue;
	}
	async delete(key) {
		let entries = await this.entries();
		if (entries.length > 0) {
			for (let entry of entries) {
				let data = JSON.parse(entry.content);
				if (data.hasOwnProperty(key)) {
					delete data[key];
					let keys = Object.keys(data);
					if (keys.length > 0) {
						await entry.edit(JSON.stringify(data));
					} else {
						await entry.delete();
					}
					return true;
				}
			}
		}

		return false;
	}
	async destroy() {
		await this.#channel.delete();
		this.#channel = null;
		this.cache = null;
	}
}

function merge(parent, object) {
	for (const key in object) {
		if (object.hasOwnProperty(key)) {
			if (parent[key] instanceof Object && typeof object[key] == 'object') {
				parent[key] = merge(parent[key], object[key]);
				continue;
			}

			parent[key] = object[key];
		}
	}

	return parent;
}