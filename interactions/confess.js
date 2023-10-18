export default {
	description: "Submit an anonymous confession.",
	dm_permission: false,
	async execute(interaction) {
		// Create forum post/thread
		await interaction.showModal({
			title: 'Anonymous confession',
			custom_id: 'confess',
			components: [{
				type: 1,
				components: [{
					type: 4,
					label: "What's the topic of confession?",
					customId: 'topic',
					style: 1,
					required: false
				}]
			}, {
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
		const topic = interaction.fields.fields.get('topic');
		const input = interaction.fields.fields.get('confession');
		interaction.channel.send({
			embeds: [{
				author: {
					name: topic.value || 'Confession'
				},
				description: input.value,
				footer: {
					text: 'Anonymous'
				}
			}]
		}).then(message => {
			interaction.channel.type === 0 && message.startThread({
				autoArchiveDuration: 60,
				name: topic.value || 'Anonymous Confession', // get AI to summarize a topic or have one listed in the input modal
				reason: 'Keep the discussion for each confession organized'
			}).catch(e => {
				interaction.channel.send({
					content: 'Missing permissions! Please enable the start threads permission.'
				}).catch(() => { });
			});
		}).catch(() => { });
	}
}