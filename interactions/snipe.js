import { CommandInteractionOptionResolver } from "discord.js";

import { discord } from "../colors.js";

export default {
    execute(interaction, options) {
        if (interaction.isContextMenu()) {
            options = new CommandInteractionOptionResolver(interaction.client, [
                {
                    name: "user",
                    user: options.getMessage("message").author,
                    type: "USER"
                },
                {
                    name: "type",
                    value: "edit",
                    type: "STRING"
                }
            ]);
        }

        const type = options.getString("type") || "message";
        const channel = options.getChannel("channel") || interaction.channel;
        const snipe = interaction.client.snipes.get(type, channel.id, options.getUser("user"));
        if (snipe) {
            return {
                embeds: [
                    {
                        color: discord,
                        description: snipe.content + (snipe.attachments?.first()?.contentType == "video/mp4" ? snipe.attachments?.first()?.url : ""),
                        author: {
                            name: snipe.author.tag,
                            iconURL: snipe.author.displayAvatarURL()
                        },
                        image: {
                            url: snipe.attachments?.first()?.proxyURL || null,
                        },
                        footer: {
                            text: type == "message" ? "Deleted by " + snipe.author.tag : type == "edit" ? "Edited" : "Removed"
                        },
                        timestamp: snipe.createdTimestamp
                    }
                ]
            }
        }

        return {
            content: "No recently " + (type == "edit" ? "edited" : "deleted") + (type == "reaction" ? " reactions" : " messages") + " in " + channel.name,
            ephemeral: true
        }
    },
    data: [
        {
            name: "snipe",
            description: "Snipe a recently edited or deleted message.",
            options: [
                {
                    name: "type",
                    description: "Type of snipe; eg. edit, reaction etc.",
                    type: 3,
                    required: false,
                    choices: [
                        {
                            name: "message",
                            value: "message"
                        },
                        {
                            name: "edit",
                            value: "edit"
                        },
                        {
                            name: "reaction",
                            value: "reaction"
                        }
                    ]
                },
                {
                    name: "channel",
                    description: "Channel from which you're sniping.",
                    type: 7,
                    required: false,
                    channel_types: [ 0, 1, 2, 3, 5, 10, 11, 12 ]
                },
                {
                    name: "user",
                    description: "Snipe deleted content from a specified user.",
                    type: 6,
                    required: false
                }
            ]
        },
        {
            name: "snipe edit",
            type: 3
        }
    ]
}