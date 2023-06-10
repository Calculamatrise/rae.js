export default async function(reaction, user) {
    if (user.bot) return;
    const member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id);
    if (/^\**role\s(select\s)?menu/i.test(reaction.message.content) && reaction.message.author.id == this.user.id) {
        const options = reaction.message.content.split('\n').map(r => r.split(/(?<=^\S+)\s/)).slice(3).map((option, index) => {
            const possibilities = reaction.message.guild.roles.cache.filter(r => r.name.toLowerCase() == String(option[1]).toLowerCase()).sort((a, b) => b.rawPosition - a.rawPosition);
            option[1] = possibilities.at(Math.min(index, possibilities.size - 1));
            return option;
        });
		const role = options.find(([emoji]) => emoji == reaction.emoji.toString())[1];
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