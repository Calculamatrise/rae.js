// const ATTACH_FILES = BigInt(1 << 15);
export default {
	async execute(interaction) {
		const entry = await interaction.client.database.guilds.get(interaction.guild.id);
		if (entry.alerts.memberPart) {
			await interaction.client.database.guilds.update(interaction.guildId, {
				alerts: {
					memberPart: null
				}
			});
			return {
				content: "Successfully disabled member leave notifications for this server.",
				ephemeral: true
			}
		}

		await interaction.client.database.guilds.update(interaction.guildId, {
			alerts: {
				memberPart: interaction.channel.id
			}
		});
		return {
			content: `Successfully enabled member leave notifications for this server in ${interaction.channel.name}.`,
			ephemeral: true
		}
	}
}