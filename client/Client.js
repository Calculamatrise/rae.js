import { readdir, readFile } from "fs";
import { extname } from "path";
import { Client } from "discord.js";

import ChatbridgeHandler from "../handlers/chatbridge.js";
import DatabaseManager from "../managers/database.js";
import InteractionHandler from "../handlers/interactions.js";
import SnipeHandler from "../handlers/snipes.js";

export default class extends Client {
	chatbridge = new ChatbridgeHandler(this);
	commands = new Map();
	console = null;
	database = new DatabaseManager();
	developerMode = /^(dev|test)$/i.test(process.argv.at(2));
	interactions = new InteractionHandler();
	players = new Map();
	serverStorage = new DatabaseManager();
	snipes = new SnipeHandler();
	constructor() {
		super(...arguments);
		this.database.on('ready', async () => {
			this.console = await this.database.createChannel('console');
			await this.database.createStore('guilds', {
				alerts: {
					memberJoin: false,
					memberPart: false
				},
				chatbridge: null,
				name: null,
				roles: []
			});
			await this.database.createStore('users', {
				chatbridge: null
			});
			let entries = await this.database.users.entries();
			entries = entries.reduce((combined, entry) => Object.assign(combined, JSON.parse(entry.content)), {});
			for (let id in entries) {
				let entry = entries[id];
				if (entry.chatbridge && entry.chatbridge.enabled) {
					this.chatbridge.users.set(id, {
						color: entry.chatbridge.color,
						messages: new Map()
					});
				}
			}

			// store member stats in the guild? — this would not
			// require a database, and it would allow the server
			// owner to reset the stats whenever they'd like.
			// await this.database.createStore('members', {
			// 	guilds: []
			// });
		});
		this.database.on('error', error => {
			console.error("Database:", error.message);
		});
		this.database.on('disconnected', () => {
			console.warn("I've lost connection to the database!");
		});
	}

	#import(directory, callback) {
		return new Promise((resolve, reject) => {
			readdir(directory, async (error, events) => {
				if (error) reject(error);
				let result = [];
				for (const event of events) {
					if (extname(event)) {
						result.push(await import(`.${directory}/${event}`).then(function (data) {
							return [
								directory.split('/').slice(2).concat(/^index\.js$/.test(event) ? '' : event.replace(extname(event), '')).map((event, index) => index > 0 ? event.replace(/^./, m => m.toUpperCase()) : event).join(''),
								data
							]
						}));
					} else {
						result.push(...await this.#import(`${directory}/${event}`));
					}
				}

				result = new Map(result);
				if (typeof callback == 'function') {
					callback(result);
				}

				resolve(result);
			});
		});
	}

	config() {
		return new Promise((resolve, reject) => {
			readFile('.env', (err, data) => {
				if (err !== null) reject(err);
				const content = data.toString();
				if (content.length > 0) {
					for (const match of content.split('\n')) {
						const [key, value] = match.split(/[\s=]/, 2);
						if (key && value) {
							process.env[key] = value;
						}
					}
				}

				resolve();
			});
		});
	}

	deployCommands() {
		return new Promise(async resolve => {
			const { commands } = (this.developerMode ? this.guilds.cache.get("433783980345655306") : this.application);
			const live = await commands.fetch();
			for (const command of live.values()) {
				if (!this.interactions.has(command.name, command.type != 1)) {
					await command.delete();
				}
			}

			for (const data of this.interactions.values()) {
				// if (this.developerMode && data?.name != 'verify') continue;
				const { message, user } = data.menus ?? {};
				message && await commands.create(message);
				user && await commands.create(user);
				delete data.menus;
				// data.hasOwnProperty('name') && console.log(data)
				data.hasOwnProperty('name') && await commands.create(data);
			}

			resolve();
		});
	}

	async login() {
		await this.#import("./events", events => {
			events.forEach((event, name) => {
				this.on(name, event.default);
			});
		});

		await this.#import("./interactions", events => {
			events.forEach(({ default: module }, name) => {
				if ('description' in module) {
					module.name = module.name ?? name.replace(/.*(?=[A-Z])/, '').toLowerCase();
				}

				if ('menus' in module) {
					for (const menu in module.menus) {
						if (typeof module.menus[menu] != 'object') continue;
						module.menus[menu].name = module.menus[menu].name ?? name.replace(/.*(?=[A-Z])/, '').toLowerCase();
					}
				}

				// this.commands.set(name, module);
				this.interactions.on(name, module);
			});
		});

		if (this.developerMode) {
			await this.config();
			arguments[0] = process.env.DEV_TOKEN;
		}

		const res = await super.login(...arguments);
		await this.database.connect(this, '433783980345655306');
		return res;
	}

	setIdle(status = true, timeout = 6e4) {
		status || setTimeout(() => this.user.setStatus('idle'), timeout ?? 6e4);
		return this.user.setStatus(status ? 'idle' : 'online');
	}
}