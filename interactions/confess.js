export default {
    description: "Submit an anonymous confession.",
    dm_permission: false,
    async execute(interaction) {
        await interaction.showModal({
            title: 'Anonymous confession',
            custom_id: 'confess',
            components: [{
                type: 1,
                components: [{
                    type: 4,
                    label: "What's your confession?",
                    customId: 'confession',
                    style: 2
                }]
            }]
        });
    },
    click(interaction) {
        const input = interaction.fields.fields.get('confession');
        interaction.channel.send({
            embeds: [{
                author: {
                    name: 'Anonymous Confession'
                },
                description: input.value
            }]
        });
    }
}