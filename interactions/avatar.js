export default {
    description: "Get someone's avatar.. I guess",
    execute(interaction, options) {
        const { user } = options.get("user");
        return {
            ephemeral: true,
            files: [
                user.displayAvatarURL() + "?size=2048"
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