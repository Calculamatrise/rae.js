export default {
	async execute(interaction) {
		const client = interaction.client;
		const serverStorage = client.serverStorage;
		await serverStorage.connect(client, interaction.guild.id);
		const members = await serverStorage.getStore('members');
		serverStorage.disconnect();
		if (!members) {
			return {
				content: "The server owner hasn't configured this feature. Please contact a server administrator.",
				ephemeral: true
			}
		}

		let entry = await members.get(interaction.user.id);
		if (!entry) {
			entry = await members.create(interaction.user.id);
		}

		return {
			content: `You are level ${entry.level} at ${entry.experience}xp!`,
			ephemeral: true
		}
	}
}