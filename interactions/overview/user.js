export default {
    async execute(interaction, options) {
        const { user, member } = options.get('user');
        let embed = {
            author: {
                name: user.username,
                iconURL: user.avatarURL()
            },
            fields: [{
                name: "Account Created",
                value: `<t:${user.createdAt.getTime().toString().slice(0, -3)}:R>`,
                inline: true
            }],
            footer: {
                text: user.tag + " | " + user.id
            }
        }

        if (member) {
            embed.fields.push({
                name: "Joined Server",
                value: `<t:${member.joinedAt.getTime().toString().slice(0, -3)}:R>`,
                inline: true
            });
            if (member.presence) {
                embed.fields.push({
                    name: "Status" + (member.presence.clientStatus?.mobile ? " (mobile)" : ""),
                    value: member.presence.status,
                    inline: !member.nickname
                });
                for (const activity of member.presence.activities) {
                    if (activity.type == "CUSTOM") {
                        embed.description = activity.state;
                    }
                }
            }
            
            if (member.nickname) {
                embed.fields.push({
                    name: "Nickname",
                    value: member.nickname,
                    inline: true
                });
            }

            if (member.roles.cache.size > 1) {
                embed.color = member.roles.cache.first().color || null;
                embed.fields.push({
                    name: "Roles",
                    value: member.roles.cache.filter(r => r.id != interaction.guildId).map(r => "<@&" + r.id + ">").join(' ').substring(0, 1024).replace(/\s<@&\d+$/, ""),
                    inline: false
                });
            }
        }

        return {
            embeds: [embed],
            ephemeral: true
        }
    },
    menus: {
        user: {
            name: 'overview',
            type: 2
        }
    }
}