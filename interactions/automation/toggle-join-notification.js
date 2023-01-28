export default {
    async execute(interaction) {
        const { member_join_notification } = await interaction.client.database.guilds.get(interaction.guild.id);
        if (member_join_notification) {
            await interaction.client.database.guilds.update(interaction.guildId, {
                member_join_notification: null
            });
            return {
                content: "Successfully disabled auto role for this server.",
                ephemeral: true
            }
        }

        await interaction.client.database.guilds.update(interaction.guildId, {
            member_join_notification: interaction.channel.id
        });
        return {
            content: `Successfully enabled member join notifications for this server in ${interaction.channel.name}.`,
            ephemeral: true
        }
    }
}