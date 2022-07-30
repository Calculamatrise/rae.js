export default {
    async execute(interaction, options) {
        let input = options.get("message");
        let message = input.message || interaction.channel.messages.cache.get(input.value) || await interaction.channel.messages.fetch(input.value);
        return {
            embeds: [{
                author: {
                    name: message.author.tag,
                    iconURL: message.author.avatarURL()
                },
                description: message.content,
                footer: {
                    text: "Sent by " + message.author.username,
                    iconURL: message.author.avatarURL()
                },
                timestamp: new Date(message.createdTimestamp).toISOString()
            }],
            ephemeral: true
        }
    },
    menudata: {
        user: {
            name: "overview",
            type: 3
        }
    }
}