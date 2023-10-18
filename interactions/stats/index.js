export default {
	description: "View or changes server member statistics.",
	default_member_permissions: 1 << 5,
	dm_permission: false,
	options: [{
		name: "configure",
		description: "Configure server member analytics.",
		type: 1
	}, {
		name: "level",
		description: "View your level in this server",
		type: 1
	}]
}