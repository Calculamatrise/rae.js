export default async function(reaction, user) {
    if (user.bot) return;
    this.snipes.set("reaction", reaction.message.channel.id, {
        author: user,
        content: `[${reaction.emoji.id ? "<:a:" + reaction.emoji.id + ">" : reaction.emoji.name}](${reaction.message.url})`,
        createdTimestamp: Date.now()
    });
}