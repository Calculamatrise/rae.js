export default async function(reaction, user) {
    if (user.bot) return;
    const member = reaction.message.guild.members.cache.get(user.id) || await reaction.message.guild.members.fetch(user.id);
    if (reaction.message.channel.type == 1) {
        this.chatbridge.messages.forEach(({ messages }) => {
            if (messages.find(message => message.id == reaction.message.id)) {
                messages.forEach(function(doppelganger) {
                    doppelganger.react(reaction.emoji.toString()).catch(function(error) {
                        console.error('ChatBridgeReaction:', error.message);
                    });
                });
            }
        });
    } else if (/^\**role\s(select\s)?menu/i.test(reaction.message.content) && reaction.message.author.id == this.user.id) {
        const options = new Map(reaction.message.content.split('\n').map(l => l.split(/(?<=^\S+)\s/)).slice(3).filter((option, index) => {
            const possibilities = reaction.message.guild.roles.cache.filter(r => r.name.toLowerCase() == String(option[1]).toLowerCase()).sort((a, b) => b.rawPosition - a.rawPosition);
            return option[1] = possibilities.at(Math.min(index, possibilities.size - 1));
        }));
        const role = options.get(reaction.emoji.toString());
        if (/^\**role\sselect/i.test(reaction.message.content)) {
            const exclude = Array.from(options.values());
            const roles = Array.from(member.roles.cache.filter(role => !exclude.find(r => r.id == role.id)).values());
            await member.roles.set(roles.concat(role));
            options.delete(reaction.emoji.toString());
            for (const option of options.keys()) {
                const emoji = String(option).replace(/^<a?:\w+:|>$/g, '');
                const reactions = reaction.message.reactions.cache.get(emoji) || await reaction.message.reactions.fetch(emoji);
                reactions && await reactions.users.remove(user);
            }
        } else {
            await member.roles.add(role);
        }
    }
}