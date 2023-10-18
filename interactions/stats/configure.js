export default {
	async execute(interaction) {
		const client = interaction.client;
		const serverStorage = client.serverStorage;
		await serverStorage.connect(client, interaction.guild.id);
		const members = await serverStorage.getStore('members');
		if (!members) {
			await serverStorage.createStore('members', {
				experience: 0,
				level: 1,
				messages: 0
			});
			serverStorage.disconnect();
			return {
				content: "Successfully enabled the leveling system in this server.",
				ephemeral: true
			}
		}

		await members.destroy();
		serverStorage.disconnect();
		return {
			content: "The leveling system has been disabled, and all progress was reset.",
			ephemeral: true
		}
	}
}