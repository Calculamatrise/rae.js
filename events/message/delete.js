export default async function(message) {
    if (message.author.bot) return;
    if (message.channel.type == "DM") {
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

    this.snipes.set("message", message.channel.id, message);
}