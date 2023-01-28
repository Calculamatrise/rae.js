export default {
    async execute(interaction, options) {
        const role = options.getRole('role');
        if (role === null) {
            await interaction.client.database.guilds.update(interaction.guildId, {
                auto_role: null
            });
            return {
                content: "Successfully disabled auto role for this server.",
                ephemeral: true
            }
        }

        await interaction.client.database.guilds.update(interaction.guildId, {
            auto_role: role.id
        });
        return {
            content: `The default role for this server has been set to ${role.name}.`,
            ephemeral: true
        }
    }
}