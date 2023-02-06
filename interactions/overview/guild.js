export default {
    async execute(interaction, options) {
        const guild = options.get('id') ? interaction.client.guilds.cache.get(options.getString('id')) || await interaction.client.guilds.fetch(options.getString('id')).catch(console.error) : interaction.guild;
        if (!guild) {
            return {
                content: "I cannot access this guild without intents.",
                ephemeral: true
            }
        }

        let invite = await guild.invites.fetch().then(t => t.first().toString()).catch(console.error);
        let embed = {
            author: {
                name: guild.name,
                iconURL: guild.iconURL()
            },
            description: guild.description,
            fields: [{
                name: "Guild Created",
                value: `<t:${Math.floor(guild.createdTimestamp / 1e3)}:R>`,
                inline: true
            }, {
                name: "Members",
                value: guild.memberCount.toString(),
                inline: true
            }, {
                name: "Bans",
                value: guild.bans.cache.size,
                inline: true
            }],
            footer: {
                text: guild.id
            }
        }

        const roles = guild.roles.cache.filter(r => r.id != guild.id && !r.managed).sort((a, b) => b.rawPosition - a.rawPosition);
        if (roles.size > 0) {
            embed.fields.push({
                name: `Roles (${roles.size})`,
                value: roles.map(r => interaction.guildId != guild.id ? `\`${r.name}\`` : `<@&${r.id}>`).join(' ').substring(0, 1024).replace(/\s<@&\d+$/, ''),
                inline: false
            });
        }

        if (guild.emojis.cache.size > 0) {
            embed.fields.push({
                name: `Emojis (${guild.emojis.cache.size})`,
                value: guild.emojis.cache.map(r => r.toString()).join(' ').replace(/:\w+:/gi, ":_:").substring(0, 1024).replace(/<?:?_b?:?\d+$/gi, ''),
                inline: false
            });
        }

        return {
            components: invite ? [{
                type: 1,
                components: [{
                    type: 2,
                    label: 'Join',
                    style: 5,
                    url: invite
                }]
            }] : null,
            embeds: [embed],
            ephemeral: true
        }
    }
}