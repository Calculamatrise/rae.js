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
        const roles = reaction.message.content.split('\n').map(r => r.split(/(?<=^\S+)\s/)).slice(3);
        for (const role of roles) {
            role[1] = reaction.message.guild.roles.cache.find(r => r.name.toLowerCase() == String(role[1]).toLowerCase());
            if (!role[1]) {
                roles.splice(roles.indexOf(role), 1);
                continue;
            }

            if (/^\**role\sselect/i.test(reaction.message.content) && role[0].toString() != reaction.emoji.toString()) {
                await member.roles.remove(role[1]);
                const reactions = reaction.message.reactions.cache.get(role[0].replace(/^<a?:\w+:|>$/g, ''));
                if (reactions) {
                    await reactions.users.remove(user);
                }
            } else if (role[0].toString() == reaction.emoji.toString()) {
                member.roles.add(role[1]);
            }
        }
    }
}