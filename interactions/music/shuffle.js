export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to execute this command!",
                ephemeral: true
            }
        }
        
        let player = interaction.client.players.get(interaction.guildId);
        if (player && !player.stopped) {
            player.queue.shuffle();
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