export default {
    description: "Submit an anonymous confession.",
    dm_permission: false,
    async execute(interaction, options) {
        await interaction.channel.send({
            embeds: [{
                author: {
                    name: 'Anonymous Confession'
                },
                description: options.getString('confession')
            }]
        });
        return {
            content: "HA, I DIDN'T MAKE IT ANONYMOUS! ||jkjk||",
            ephemeral: true
        }
    },
    options: [{
        name: "confession",
        description: "CONFESS YOUR SINS.",
        type: 3,
        required: true
    }]
}