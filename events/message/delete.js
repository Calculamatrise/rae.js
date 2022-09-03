export default async function(message) {
    if (message.author.bot) return;
    if (message.channel.type == 1) {
        this.chatbridge.emit("messageDelete", ...arguments);
    }

    let action = message.channel.type != 1 && await message.guild.fetchAuditLogs({
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