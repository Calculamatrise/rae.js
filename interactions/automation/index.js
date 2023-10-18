export default {
	description: "Configure automated actions.",
	default_member_permissions: 1 << 5,
	dm_permission: false,
	options: [{
		name: "toggle-join-notification",
		description: "Welcome new members w/ a banner!",
		type: 1
	}, {
		name: "toggle-leave-notification",
		description: "Receive notifications when a member leaves the server",
		type: 1
	}]
}