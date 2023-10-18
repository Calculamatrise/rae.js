export default {
	description: "Get someone's avatar.. I guess",
	execute(interaction, options) {
		const user = options.getUser('user');
		return {
			ephemeral: true,
			files: [
				user.displayAvatarURL({
					format: 'jpg',
					size: 4096
				})
			]
		}
	},
	menus: {
		user: {
			name: "avatar",
			type: 2
		}
	},
	options: [{
		name: "user",
		description: "User who's avatar you wish to see",
		type: 6,
		required: true
	}]
}