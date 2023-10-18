export default {
	execute(interaction, options) {
		if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
			return {
				content: "You must be in my voice channel to resume the music!",
				ephemeral: true
			}
		}

		let player = interaction.client.players.get(interaction.guildId);
		if (player && !player.stopped) {
			let range = options.getString('range');
			player.setLoop(range == 'track') || player.setQueueLoop(range == 'queue');
			let song = player.currentTrack;
			let content = {
				content: `**Now looping**\n[${song.name}](<${song.url}>)`,
				components: [{
					type: 1,
					components: [{
						type: 2,
						label: player.queue.freeze ? "Stop Looping" : "Loop Track",
						style: 1 + player.queue.freeze,
						customId: player.queue.freeze ? "musicUnloop" : "musicLoop-track"
					}, {
						type: 2,
						label: player.queue.cycle ? "Stop Looping Queue" : "Loop Queue",
						style: 1 + player.queue.cycle,
						customId: player.queue.cycle ? "musicUnloop" : "musicLoop-queue"
					}]
				}]
			}

			return player.interaction.editReply(content).then(function () {
				return {
					content: `Looped the current ${range}!`,
					ephemeral: true
				}
			}).catch(function () {
				return content;
			});
		}

		return {
			content: "Nothing is playing.",
			ephemeral: true
		}
	}
}