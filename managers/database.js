import EventEmitter from "events";
import DataStoreManager from "./store.js";

const VIEW_CHANNELS = BigInt(1 << 10);
export default class extends EventEmitter {
	#client = null;
	#category = null;
	async connect(client, id) {
		let server = client.guilds.cache.get(id);
		if (!server) {
			server = await client.guilds.fetch(id);
			if (!server) {
				throw new Error("Server [" + id + "] not found.");
			}
		}

		let categories = server.channels.cache.filter(channel => channel.type);
		if (categories.size < 1) {
			categories = await server.channels.fetch();
			if (categories.size > 0) {
				categories = categories.filter(channel => channel && channel.type === 4);
			}
		}

		let name = client.user.username.toLowerCase();
		let category = categories.find(category => category.name === name);
		if (!category) {
			category = await server.channels.create({
				name,
				permissionOverwrites: [{
					id,
					deny: [VIEW_CHANNELS]
				}, {
					id: client.user.id,
					allow: [VIEW_CHANNELS]
				}],
				type: 4
			});
		}

		this.#client = client;
		this.#category = category;
		this.emit('ready');
	}
	async createChannel(name) {
		if (!this.#category) {
			throw new Error("Database is not connected!");
		}

		let filter = channel => channel.parentId === this.#category.id;
		let server = this.#category.guild;
		let channels = server.channels.cache.filter(filter);
		if (!channels) {
			channels = server.channels.fetch();
			if (channels.size > 0) {
				channels = channels.filter(filter)
			}
		}

		let channel = channels.find(channel => channel.name === name);
		if (!channel) {
			channel = await server.channels.create({
				name,
				parent: this.#category
			});
		}

		return channel;
	}
	async createStore(name, defaults) {
		if (!this.#category) {
			throw new Error("Database is not connected!");
		}

		let filter = channel => channel.parentId === this.#category.id;
		let server = this.#category.guild;
		let channels = server.channels.cache.filter(filter);
		if (!channels) {
			channels = server.channels.fetch();
			if (channels.size > 0) {
				channels = channels.filter(filter)
			}
		}

		let channel = channels.find(channel => channel.name === name);
		if (!channel) {
			channel = await server.channels.create({
				name,
				parent: this.#category
			});
		}

		let dataStore = new DataStoreManager(channel, this.#client.user.id, defaults);
		this[name] = dataStore;
		if (!/^backup$/i.test(name)) {
			let entries = await dataStore.entries();
			if (entries.length > 0) {
				let data = JSON.stringify(entries.reduce((combined, entry) => Object.assign(combined, JSON.parse(entry.content)), {}), null, 4);
				let payload = {
					files: [{
						attachment: Buffer.from(data),
						name: name + '.backup.json'
					}]
				};

				let backupName = 'backup';
				let backup = channels.find(channel => channel.name === backupName);
				if (!backup) {
					backup = await server.channels.create({
						name: backupName,
						parent: this.#category
					});
				}

				let messages = backup.messages.cache;
				if (messages.size < 1) {
					messages = await backup.messages.fetch();
				}

				messages = messages.map(message => Array.from(message.attachments.values()));
				let attachments = messages.flat();
				attachments = await Promise.all(attachments.map(attachment => fetch(attachment.url).then(r => r.text()))).catch(err => {
					console.error("An error occurred while fetching backup attachments for the database: " + err.message);
					return [];
				});
				let match = attachments.find(cache => cache === data);
				if (!match) {
					await backup.send(payload).catch(err => {
						console.error("Failed to save a backup for the database: " + err.message);
					});
				}
			}
		}

		return dataStore;
	}
	async getStore(name) {
		if (!this.#category) {
			throw new Error("Database is not connected!");
		}

		let filter = channel => channel.parentId === this.#category.id;
		let server = this.#category.guild;
		let channels = server.channels.cache.filter(filter);
		if (!channels) {
			channels = server.channels.fetch();
			if (channels.size > 0) {
				channels = channels.filter(filter);
			}
		}

		let channel = channels.find(channel => channel.name === name);
		if (channel) {
			let dataStore = new DataStoreManager(channel, this.#client.user.id);
			this[name] = dataStore;
			return dataStore;
		}

		return null;
	}
	async deleteStore(name) {
		let channel = this.getStore(name);
		if (channel) {
			await channel.delete();
			delete this[name];
			return true;
		}

		return false;
	}
	disconnect() {
		this.#category = null;
		this.#client = null;
		this.emit('disconnected');
	}
}