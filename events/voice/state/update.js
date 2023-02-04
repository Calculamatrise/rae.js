export default function(oldState, newState) {
    if (this.user.id == newState.id && newState.suppress && newState.channelId) {
        newState.guild.members.me.voice.setSuppressed(false).catch(function(error) {
            console.error(`VoiceStateUpdate: ${error.message}`);
        });
    }

    const player = this.players.get(oldState.guild.id);
    if (player) {
        if (!newState.channelId && this.user.id == newState.id) {
            return player.stop();
        }

        if (oldState.channelId === newState.channelId) return;
        setTimeout(() => {
            if (newState.guild.members.me.voice.channel.members.size < 2) {
                player.stop();
            }
        }, 3e5);
    }
}