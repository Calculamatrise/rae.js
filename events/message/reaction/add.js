export default async function(reaction, user) {
    if (user.bot) return;
    if (reaction.message.channel.type == "DM") {
        this.chatbridge.messages.forEach(({ messages }) => {
            if (messages.find(message => message.id == reaction.message.id)) {
                messages.forEach(function(doppelganger) {
                    doppelganger.react(reaction._emoji.id || reaction._emoji.name).catch(function(error) {
                        console.error("ChatBridgeReaction:", error.message);
                    });
                });
            }
        });
    }
}