export default {
	async execute(interaction) {
		const entry = await interaction.client.database.guilds.get(interaction.guild.id);
		if (entry.alerts.memberJoin) {
			await interaction.client.database.guilds.update(interaction.guildId, {
				alerts: {
					memberJoin: null
				}
			});
			return {
				content: "Successfully disabled auto role for this server.",
				ephemeral: true
			}
		}

		await interaction.client.database.guilds.update(interaction.guildId, {
			alerts: {
				memberJoin: interaction.channel.id
			}
		});
		return {
			content: `Successfully enabled member join notifications for this server in ${interaction.channel.name}.`,
			ephemeral: true
		}
	}
}