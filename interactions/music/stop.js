export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to execute this command!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue && !queue.stopped) {
            queue.stop();
            return {
                content: "I've stopped playing music."
            }
        }

        return {
            content: "Nothing is playing.",
            ephemeral: true
        }
    },
    click(interaction) {
        return this.execute(interaction);
    }
}