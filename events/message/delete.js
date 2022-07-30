export default async function(message) {
    if (message.author.bot) return;
    if (message.channel.type == 1) {
        let author = this.chatbridge.users.get(message.author.id);
        if (author && this.chatbridge.messages.has(message.id)) {
            let data = this.chatbridge.messages.get(message.id);
            if (data.author == message.author.id) {
                data.messages.forEach(function(doppelganger) {
                    doppelganger.edit({
                        embeds: [Object.assign(doppelganger.embeds[0], {
                            description: "*This message was deleted.*",
                            footer: {
                                text: "Deleted by " + message.author.tag,
                            },
                            image: {
                                url: null
                            }
                        })]
                    }).catch(function(error) {
                        console.error("ChatBridgeDelete:", error.message);
                    });
                });
            }
        }
    }

    let action = await message.guild.fetchAuditLogs({
        limit: 1,
        type: 72,
    }).then(({ entries }) => entries.size > 0 && entries.values().next().value).catch(function({ message }) {
        console.error("MessageDelete:", message);
    });
    this.snipes.set("message", message.channel.id, {
        executor: (action && action.target.id == message.author.id && action.extra.channel.lastMessageId == message.id) ? action.executor : message.author,
        message
    });
}