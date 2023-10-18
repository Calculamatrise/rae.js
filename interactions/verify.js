const timeouts = new Map();
export default {
	description: "Verify your age via ID in this server.",
	dm_permission: 0,
	async execute(interaction, options) {
		const staff = interaction.guild.channels.cache.get(interaction.guild.publicUpdatesChannelId);
		if (!staff) {
			return {
				content: "This command is only compatible with community servers!",
				ephemeral: true
			}
		}

		if (timeouts.has(interaction.user.id)) {
			const timeout = timeouts.get(interaction.user.id);
			const delta = (timeout - Date.now()) / 36e+5;
			if (delta > 0) {
				const rtf = new Intl.RelativeTimeFormat('en', {
					localeMatcher: 'best fit',
					numeric: 'always',
					style: 'long'
				});
				return {
					content: "You've already submitted your ID! You may attempt to submit your ID again " + rtf.format(Math.floor(delta), 'hours'),
					ephemeral: true
				}
			}

			timeouts.delete(interaction.user.id);
		}

		await staff.send({
			content: `<@${interaction.user.id}> (${interaction.user.tag}) submitted their identification for moderation approval.`,
			files: [options.getAttachment('id')],
			components: [{
				type: 1,
				components: [{
					type: 2,
					label: "Approve",
					style: 3,
					customId: "verify",
					disabled: false
				}, {
					type: 2,
					label: "Ignore",
					style: 4,
					customId: "verify-false",
					disabled: false
				}]
			}]
		});

		timeouts.set(interaction.user.id, Date.now() + 8.64e+7);
		return {
			content: "Successfully submitted your ID for verification!",
			ephemeral: true
		}
	},
	async click(interaction, options) {
		const user = interaction.message.mentions.users.first();
		const member = interaction.guild.members.cache.get(user.id) || await interaction.guild.members.fetch(user.id).catch(e => e);
		if (!member) {
			return {
				content: "User has left the server.",
				ephemeral: true
			}
		}

		if (options.data.length > 0) {
			await user.send(`Your ID has been rejected in **${interaction.guild.name}**!`);
			await interaction.message.edit({
				content: `**[DENIED]** ${interaction.message.content}\n*Denied by ${interaction.user.tag}*`,
				components: [],
				files: []
			});
			return {
				content: `Successfully rejected **${user.tag}**`,
				ephemeral: true
			}
		}

		const role = interaction.guild.roles.cache.find(r => /^age\s*verified$/i.test(r.name)) || await interaction.guild.roles.create({ name: 'Age Verified' });
		await member.roles.add(role);
		await user.send(`Your ID has been verified in **${interaction.guild.name}**!`).catch(({ message }) => {
			interaction.channel.send({
				content: "Messages cannot be sent to this user, but they were still verified! They just don't know it \😁\n```" + message + "```",
				ephemeral: true
			});
		});
		await interaction.message.edit({
			content: `**[APPROVED]** ${interaction.message.content}\n*Approved by ${interaction.user.tag}*`,
			components: [],
			files: []
		});
		return {
			content: `Successfully verified **${user.tag}**`,
			ephemeral: true
		}
	},
	options: [{
		name: 'id',
		description: "Provide a photo of your ID",
		required: true,
		type: 11
	}]
}