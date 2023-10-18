import EventEmitter from "events";
import Color from "../utils/Color.js";

export default class extends EventEmitter {
	#client = null;
	messages = new Map();
	users = new Map();
	constructor(client) {
		super();
		this.#client = client;
		this.on('message', this.onmessage);
		this.on('messageUpdate', this.onmessageupdate);
		this.on('messageDelete', this.onmessagedelete);
	}

	async mask(message) {
		let author = this.users.get(message.author.id);
		let referenceMessage = message.reference && (message.channel.messages.cache.get(message.reference.messageId) || await message.channel.messages.fetch(message.reference.messageId).catch(function (error) {
			console.error('ChatBridge', error.message);
		}));
		if (referenceMessage && (referenceMessage.content.length > 0 || referenceMessage.embeds[0]?.description.length > 0)) {
			referenceMessage = `> ${referenceMessage.content || referenceMessage.embeds[0].description.replace(/^>.*\n/gi, '')}\n${message.content}`;
		} else {
			referenceMessage = false;
		}

		return {
			author: {
				name: message.author.username,
				iconURL: message.author.displayAvatarURL()
			},
			color: author.color ? new Color(author.color).toDecimal() : null,
			description: referenceMessage || message.content,
			footer: {
				text: message.author.tag,
			},
			image: {
				url: message.attachments.first()?.proxyURL || null
			},
			timestamp: new Date().toISOString()
		}
	}

	async send(data) {
		const messages = [];
		for (const id of this.users.keys()) {
			const user = this.#client.users.cache.get(id) || await this.#client.users.fetch(id);
			await user.send(data)
				.then(message => messages.push(message))
				.catch(error => console.error("ChatBridge:", error.message));
		}

		return messages;
	}

	async onmessage(message) {
		if (message.channel.type != 1 || !this.users.has(message.author.id)) {
			return;
		}

		if (this.messages.size > 15) {
			this.messages.delete(Array.from(this.messages.keys()).shift());
		}

		this.send({ embeds: [await this.mask(message)] }).then(messages => {
			if (!this.messages.has(message.id)) {
				this.messages.set(message.id, {
					author: message.author.id,
					messages: []
				});
			}

			this.messages.get(message.id).messages.push(...messages);
		}).catch(function (error) {
			console.error('ChatBridge:', error.message);
		});
	}

	async onmessageupdate(message, edit) {
		let author = this.users.get(message.author.id);
		if (author && this.messages.has(message.id)) {
			let data = this.messages.get(message.id);
			if (data.author == message.author.id) {
				let skeleton = await this.mask(message);
				data.messages.forEach(async doppelganger => {
					doppelganger.edit({
						embeds: [Object.assign(skeleton, {
							description: edit.content,
							footer: {
								text: "Edited by " + message.author.tag,
							}
						})]
					}).catch(function (error) {
						console.error("ChatBridgeEdit:", error.message);
					});
				});
			}
		}
	}

	async onmessagedelete(message) {
		let author = this.users.get(message.author.id);
		if (author && this.messages.has(message.id)) {
			let data = this.messages.get(message.id);
			if (data.author == message.author.id) {
				let skeleton = await this.mask(message);
				data.messages.forEach(async doppelganger => {
					doppelganger.edit({
						embeds: [Object.assign(skeleton, {
							description: "*This message was deleted.*",
							footer: {
								text: "Deleted by " + message.author.tag,
							},
							image: {
								url: null
							}
						})]
					}).catch(function (error) {
						console.error("ChatBridgeDelete:", error.message);
					});
				});
			}
		}
	}
}