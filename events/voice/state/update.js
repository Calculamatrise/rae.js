export default function(oldState, newState) {
    if (this.user.id == newState.id && newState.suppress && newState.channelId) {
        newState.guild.me.voice.setSuppressed(false).catch(function(error) {
            console.error(`VoiceStateUpdate: ${error.message}`);
        });
    }

    let queue = this.queues.cache.get(oldState.guild.id);
    if (queue) {
        if (!newState.channelId && this.user.id == newState.id) {
            return queue.stop();
        }

        if (oldState.channelId === newState.channelId) return;
        setTimeout(() => {
            if (queue.interaction && queue.interaction.guild.me.voice.channel && queue.interaction.guild.me.voice.channel.members.size < 2) {
                return queue.stop();
            }
        }, 3e5);
    }
}