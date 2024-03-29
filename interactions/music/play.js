import Player from "../../utils/Player.js";
import Search from "../../utils/Search.js";

export default {
	async execute(interaction, options) {
		if (!interaction.member.voice.channel) {
			return {
				content: "You aren't connected to a voice channel!",
				ephemeral: true
			}
		}

		await interaction.deferReply();
		if (!interaction.client.players.has(interaction.guildId)) {
			interaction.client.players.set(interaction.guildId, new Player());
		}

		let player = interaction.client.players.get(interaction.guildId);
		if (player.interaction !== null && player.interaction.replied) {
			player.interaction.editReply({ components: [] }).catch(function (error) {
				console.error(`QueueManager: ${error.message}`);
			});
		}

		player.init(interaction);
		return player.play(await player.search(options.getString('song'))).then(function (song) {
			return {
				content: `**${song.playing ? "Waiting to play" : "Track Queued - Position " + player.queue.length}**\n[${song.name?.replace(/([-_|`*])/g, '\\$1')}](<${song.url}>)`,
				components: [{
					type: 1,
					components: [{
						type: 2,
						label: player.queue.freeze ? "Stop Looping" : "Loop Track",
						style: 1 + player.queue.freeze,
						customId: player.queue.freeze ? "musicUnloop" : "musicLoop-track",
						emoji: null, // "🔂"
					}, {
						type: 2,
						label: player.queue.cycle ? "Stop Looping Queue" : "Loop Queue",
						style: 1 + player.queue.cycle,
						customId: player.queue.cycle ? "musicUnloop" : "musicLoop-queue",
						emoji: null, // "🔁"
					}, {
						type: 2,
						label: "End Session",
						style: 4,
						customId: "musicStop",
						emoji: null, // "🔂"
					}]
				}]
			}
		}).catch(function (error) {
			console.error("PlayInteraction:", error.message);
			return {
				content: error.message,
				ephemeral: true
			}
		});
	},
	focus(interaction, option) {
		if (interaction.client.players.has(interaction.guildId)) {
			let player = interaction.client.players.get(interaction.guildId);
			if (player.queue.cache.length > 0) {
				return player.queue.cache
					.slice(0, 25)
					.reverse()
					.map(({ name, url }) => ({ name, value: url }))
					.filter(({ name }) => String(name).toLowerCase().includes(option.value.toLowerCase()))
					.sort((a, b) => {
						if (a.name.toLowerCase().indexOf(option.value.toLowerCase()) > b.name.toLowerCase().indexOf(option.value.toLowerCase())) {
							return 1;
						} else if (a.name.toLowerCase().indexOf(option.value.toLowerCase()) < b.name.toLowerCase().indexOf(option.value.toLowerCase())) {
							return -1;
						}

						return a.name > b.name ? 1 : -1;
					});
			}
		}

		if (option.value.length < 1) return [];
		return Search.query(option.value, { limit: 5 }).then(function (data) {
			if (data instanceof Array) {
				return data.map(function ({ name, url }) {
					return {
						name,
						value: url || name
					}
				});
			} else if ('entries' in data) {
				return data.entries.slice(0, 25).map(function ({ name, url }) {
					return {
						name,
						value: url || name
					}
				});
			}

			return [{
				name: data.name,
				value: data.url || data.name
			}]
		}).catch(function (error) {
			console.error("PlayFocusInteraction", error.message);
			return [];
		});
	}
}