export default function(oldState, newState) {
    if (this.user.id == newState.id && newState.suppress && newState.channelId) {
        newState.guild.members.me.voice.setSuppressed(false).catch(function(error) {
            console.error(`VoiceStateUpdate: ${error.message}`);
        });
    }

    let player = this.players.get(oldState.guild.id);
    if (player) {
        if (!newState.channelId && this.user.id == newState.id) {
            return player.stop();
        }

        if (oldState.channelId === newState.channelId) return;
        setTimeout(() => {
            if (player.interaction && player.interaction.guild.members.me.voice.channel && player.interaction.guild.members.me.voice.channel.members.size < 2) {
                return player.stop();
            }
        }, 3e5);
    }
}