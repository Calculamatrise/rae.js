export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to execute this command!",
                ephemeral: true
            }
        }
        
        let queue = interaction.client.queues.cache.get(interaction.guildId);
        if (queue && !queue.stopped) {
            queue.shuffle();
            return {
                content: "I've shuffled the queue!"
            }
        }

        return {
            content: "Nothing is playing.",
            ephemeral: true
        }
    }
}