import fetch from "node-fetch";

import { blue } from "../colors.js";

export default {
    async execute(interaction, options) {
        if (interaction.user.id == options.get("user").value) {
            return {
                content: "You cannot hug yourself.",
                ephemeral: true
            }
        }

        await interaction.deferReply();
        
        const emojis = ["🥰", "😍"]
        return fetch("https://nekos.life/api/v2/img/hug").then((response) => response.json()).then((image) => {
            return {
                embeds: [
                    {
                        color: interaction.member?.roles.cache.first()?.color || blue,
                        description: "**" + interaction.user.username + "** hugs <@" + options.get("user").value + "> " +  emojis[Math.floor(Math.random() * emojis.length)],
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
        name: "hug",
        description: "Hug another member.",
        dm_permission: false,
        options: [
            {
                name: "user",
                description: "Pick a member to hug.",
                type: 6,
                required: true
            }
        ]
    }
}