import fetch from "node-fetch";

export default {
    async execute(interaction, options) {
        if (!interaction.channel.nsfw) {
            return {
                ephemeral: true,
                content: "This is not an NSFW channel!"
            }
        }

        await interaction.deferReply({
            ephemeral: true
        });

        return fetch("https://nekos.life/api/v2/img/" + options.get("input").value).then((response) => response.json()).then((response) => {
            return {
                ephemeral: true,
                files: [
                    response.url
                ]
            }
        }).catch((error) => {
            return {
                content: error.message,
                ephemeral: true
            }
        });
    },
    data: {
        name: "experiment",
        description: "Test gifs.",
        default_permission: false,
        options: [
            {
                name: "input",
                description: "Search parameter.",
                type: 3,
                required: true
            }
        ]
    },
    whitelist: new Set([
        "307360544468238336",
        "430418106972897282"
    ]),
    response: "Oh no! You can't use this command. It's specifically designed for testing purposes."
}