export default async function(reaction, user, member) {
    if (user.bot) return;
    if (reaction.message.channel.type == 1) {
        this.chatbridge.messages.forEach(({ messages }) => {
            if (messages.find(message => message.id == reaction.message.id)) {
                messages.forEach(function(doppelganger) {
                    doppelganger.react(reaction._emoji.toString()).catch(function(error) {
                        console.error('ChatBridgeReaction:', error.message);
                    });
                });
            }
        });
    } else if (/^\**role\smenu/i.test(reaction.message.content) && reaction.message.author.id == this.user.id && member) {
        let guildRoles = Array.from(reaction.message.guild.roles.cache.values());
        let role = reaction.message.content.split('\n').map(r => r.split(/\s+/)).find(r => r[0] == reaction.emoji.toString())?.[1];
        role = guildRoles.find(r => r.name.toLowerCase() == String(role).toLowerCase());
        role && await member.roles.add(role);
    }
}