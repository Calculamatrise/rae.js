export default {
	description: "Purge command. Bulk delete messages.",
	default_member_permissions: 1 << 13,
	dm_permission: false,
	execute(interaction, options) {
		return interaction.channel.bulkDelete(options.getInteger('messages')).then(response => {
			return {
				content: "Successfully cleared " + response.size + " messages.",
				ephemeral: true
			}
		}).catch(async error => {
			await interaction.deferReply({ ephemeral: true });
			return interaction.channel.messages.fetch({ limit: options.getInteger('messages') }).then(messages => {
				messages = Array.from(messages.values());
				return new Promise(async (resolve, reject) => {
					await Promise.all(messages.map(message => message.delete().catch(reject)));
					resolve({
						content: "Successfully cleared " + messages.length + " messages.",
						ephemeral: true
					});
				});
			}).catch(error => {
				return {
					content: error.message,
					ephemeral: true
				}
			});
		});
	},
	options: [{
		name: "messages",
		description: "Number of messages to be purged.",
		min_value: 10,
		max_value: 1e3,
		type: 4,
		required: true
	}]
}