export default {
    description: "Create a single self-assignable role.",
    default_member_permissions: 1 << 5,
    dm_permission: false,
    options: [{
        name: "default-role",
        description: "Select a default role.",
        type: 1,
        options: [{
            name: "role",
            description: "Choose the default role for this server",
            type: 8,
            required: false
        }]
    }, {
        name: "toggle-join-notification",
        description: "Welcome new members w/ a banner!",
        type: 1
    }, {
        name: "toggle-leave-notification",
        description: "Receive notifications when a member leaves the server",
        type: 1
    }]
}