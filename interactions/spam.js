export default {
    async execute(interaction, options) {
        interaction.deferReply({
            ephemeral: true
        });

        const { user } = options.get("user"), message = options.get("message");
        return new Promise(function(resolve) {
            for (let i = 0; i < 10; i++) {
                setTimeout(async function() {
                    await user.send({
                        content: "**" + interaction.member.user.tag + "**" + (message ? (" says " + message.value) : " wants your attention!")
                    }).catch(function(error) {
                        resolve({
                            content: error.message,
                            ephemeral: true
                        });
                    });

                    if (i >= 9) {
                        resolve({
                            content: `Successfully spammed **${user.tag}**!`,
                            ephemeral: true
                        });
                    }
                }, i * 1000);
            }
        });
    },
    data: {
        name: "spam",
        description: "Spam another member.",
        default_member_permissions: 0,
        options: [{
            name: "user",
            description: "Pick a member to spam.",
            type: 6,
            required: true
        },{
            name: "message",
            description: "Write a friendly note for the user you're about to spam.",
            type: 3,
            required: false
        }]
    },
    menudata: {
        user: {
            name: "spam",
            default_member_permissions: 0,
            type: 2
        }
    },
    whitelist: new Set([
        "704794598303858728",
        "804019041131167745"
    ]),
    response: "Oh no! You can't use this command. It was made just for Gabrielle <3"
}