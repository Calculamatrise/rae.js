export default async function(message, edit) {
    if (message.channel.type == 1) {
        let author = this.chatbridge.users.get(message.author.id);
        if (author && this.chatbridge.messages.has(message.id)) {
            let data = this.chatbridge.messages.get(message.id);
            if (data.author == message.author.id) {
                data.messages.forEach(function(doppelganger) {
                    doppelganger.edit({
                        embeds: [Object.assign(doppelganger.embeds[0], {
                            description: edit.content,
                            footer: {
                                text: "Edited by " + message.author.tag,
                            }
                        })]
                    }).catch(function(error) {
                        console.error("ChatBridgeEdit:", error.message);
                    });
                });
            }
        }
    }

    this.snipes.set("edit", message.channel.id, {
        executor: message.author,
        message
    });
}