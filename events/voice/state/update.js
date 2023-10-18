export default function (oldState, newState) {
	const isCurrentUser = this.user.id == newState.id;
	const currentState = newState.guild.members.me.voice;
	if (isCurrentUser && newState.suppress && newState.channelId) {
		currentState.setSuppressed(false).catch(err => {
			console.error(`VoiceStateUpdate: ${err.message}`);
		});
	}

	const player = this.players.get(oldState.guild.id);
	if (!player) {
		return;
	} else if (newState.channelId === null) {
		if (isCurrentUser) {
			return player.stop();
		}

		setTimeout(() => {
			if (currentState.channel.members.size < 2) {
				player.stop();
			}
		}, 3e5);
	}
}