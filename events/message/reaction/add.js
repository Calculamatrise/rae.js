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
        const options = reaction.message.content.split('\n').map(r => r.split(/(?<=^\S+)\s/)).slice(3).map((option, index) => {
            const possibilities = reaction.message.guild.roles.cache.filter(r => r.name.toLowerCase() == String(option[1]).toLowerCase()).sort((a, b) => b.rawPosition - a.rawPosition);
            option[1] = possibilities.at(Math.min(index, possibilities.size - 1));
            return option;
        });
        const role = options.find(([emoji]) => emoji == reaction.emoji.toString());
        if (/^\**role\sselect/i.test(reaction.message.content)) {
            await member.roles.remove(options.map(([_, role]) => role));
            for (const option of options) {
                const emoji = String(option[0]).replace(/^<a?:\w+:|>$/g, '');
                const reactions = reaction.message.reactions.cache.get(emoji) || await reaction.message.reactions.fetch(emoji);
                if (reactions && emoji != reaction.emoji.toString()) {
                    await reactions.users.remove(user);
                }
            }
        }

        await member.roles.add(role[1]);
    }
}