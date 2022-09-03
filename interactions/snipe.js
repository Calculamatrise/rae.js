import { CommandInteractionOptionResolver } from "discord.js";

import { discord } from "../colors.js";

export default {
    async execute(interaction, options) {
        if (interaction.isMessageContextMenuCommand()) {
            options = new CommandInteractionOptionResolver(interaction.client, [{
                name: "user",
                user: options.getMessage("message").author,
                type: 6
            }, {
                name: "type",
                value: "edit",
                type: 3
            }]);
        }

        const type = options.getString("type") || "message";
        const channel = options.getChannel("channel") || interaction.channel;
        const snipe = interaction.client.snipes.get(type, channel.id, options.getUser("user"));
        if (snipe) {
            return {
                embeds: [{
                    color: discord,
                    description: (snipe.message.content + (snipe.message.attachments?.first()?.contentType == "video/mp4" ? snipe.message.attachments?.first()?.url : "")) || "*This feature is currently unavailable.*",
                    author: {
                        name: snipe.message.author.tag,
                        iconURL: snipe.message.author.displayAvatarURL()
                    },
                    image: {
                        url: snipe.message.attachments?.first()?.proxyURL || null,
                    },
                    footer: {
                        iconURL: snipe.executor.displayAvatarURL(),
                        text: type == "message" ? "Deleted by " + snipe.executor.tag : type == "edit" ? "Edited" : "Removed"
                    },
                    timestamp: new Date(snipe.message.createdTimestamp).toISOString()
                }]
            }
        }

        return {
            content: "No recently " + (type == "edit" ? "edited" : "deleted") + (type == "reaction" ? " reactions" : " messages") + " in " + channel.name,
            ephemeral: true
        }
    },
    data: {
        description: "Snipe a recently edited or deleted message.",
        options: [{
            name: "type",
            description: "Type of snipe; eg. edit, reaction etc.",
            type: 3,
            required: false,
            choices: [{
                name: "message",
                value: "message"
            }, {
                name: "edit",
                value: "edit"
            }, {
                name: "reaction",
                value: "reaction"
            }]
        }, {
            name: "channel",
            description: "Channel from which you're sniping.",
            type: 7,
            required: false,
            channel_types: [ 0, 1, 2, 3, 5, 10, 11, 12 ]
        }, {
            name: "user",
            description: "Snipe deleted content from a specified user.",
            type: 6,
            required: false
        }]
    },
    menus: {
        message: {
            name: "snipe",
            type: 3
        }
    }
}