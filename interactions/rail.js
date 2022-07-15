import fetch from "node-fetch";

import { red } from "../colors.js";

export default {
    async execute(interaction, options) {
        if (!interaction.channel.nsfw) {
            return {
                content: "This is not an NSFW channel!",
                ephemeral: true
            }
        }

        if (interaction.user.id == options.get("user").value) {
            return {
                content: "You cannot rail yourself.",
                ephemeral: true
            }
        }

        await interaction.deferReply();

        const emojis = ["🥵", "😜", "😳"];
        return fetch("https://nekos.life/api/v2/img/nsfw_neko_gif").then((response) => response.json()).then((image) => {
            return {
                embeds: [
                    {
                        color: interaction.member?.roles.cache.first()?.color || red,
                        description: "**" + interaction.user.username + "** does lewd things to <@" + options.get("user").value + "> " + emojis[Math.floor(Math.random() * emojis.length)],
                        image
                    }
                ],
                ephemeral: true
            }
        }).catch((error) => {
            return {
                content: error.message,
                ephemeral: true
            }
        });
    },
    data: {
        name: "rail",
        description: "oop-",
        dm_permission: false,
        options: [
            {
                name: "user",
                description: "Pick a user to rail.",
                type: 6,
                required: true
            }
        ]
    }
}