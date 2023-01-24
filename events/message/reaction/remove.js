export default async function(reaction, user) {
    if (user.bot) return;
    const member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id);
    if (/^\**role\s(select\s)?menu/i.test(reaction.message.content) && reaction.message.author.id == this.user.id && member) {
        let role = reaction.message.content.split('\n').map(r => r.split(/(?<=^\S+)\s/)).find(r => r[0] == reaction.emoji.toString())?.[1];
        role = reaction.message.guild.roles.cache.find(r => r.name.toLowerCase() == String(role).toLowerCase());
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