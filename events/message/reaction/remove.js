export default async function(reaction, user, member) {
    if (user.bot) return;
    if (/^\**role\smenu/i.test(reaction.message.content) && reaction.message.author.id == this.user.id && member) {
        let guildRoles = Array.from(reaction.message.guild.roles.cache.values());
        let role = reaction.message.content.split('\n').map(r => r.split(/\s+/)).find(r => r[0] == reaction.emoji.toString())?.[1];
        role = guildRoles.find(r => r.name.toLowerCase() == String(role).toLowerCase());
        role && member.roles.remove(role);
    }

    this.snipes.set('reaction', reaction.message.channel.id, {
        executor: user,
        message: {
            author: user,
            content: `[${reaction.emoji.toString()}](${reaction.message.url})`,
            createdTimestamp: Date.now()
        }
    });
}