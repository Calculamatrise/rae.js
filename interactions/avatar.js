export default {
    execute(interaction, options) {
        const { user } = options.get("user");
        return {
            ephemeral: true,
            files: [
                user.displayAvatarURL() + "?size=2048"
            ]
        }
    },
    data: {
        description: "Get someone's avatar.. I guess",
        options: [{
            name: "user",
            description: "User who's avatar you wish to see",
            type: 6,
            required: true
        }]
    },
    menus: {
        user: {
            name: "avatar",
            type: 2
        }
    }
}