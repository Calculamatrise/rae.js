export default {
	execute(interaction) {
		if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
			return {
				content: "You must be in my voice channel to execute this command!",
				ephemeral: true
			}
		}

		let player = interaction.client.players.get(interaction.guildId);
		if (player && player.queue.cache.length > 0) {
			let song = player.back();
			if (song) {
				let content = {
					content: `**Now playing**\n[${song.name}](<${song.url}>)`,
					components: [{
						type: 1,
						components: [{
							type: 2,
							label: "Back",
							style: 1,
							customId: "musicBack"
						}, {
							type: 2,
							label: "Pause",
							style: 1,
							customId: "musicPause"
						}, {
							type: 2,
							label: "Skip",
							style: 1,
							customId: "musicSkip"
						}]
					}]
				}

				return player.interaction.editReply(content).then(function () {
					return {
						content: "Backed the track!",
						ephemeral: true
					}
				}).catch(function () {
					return content;
				});
			}
		}

		return {
			content: "Nothing is playing.",
			ephemeral: true
		}
	}
}