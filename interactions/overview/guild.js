export default {
    async execute(interaction, options) {
        let guild = options.get("id") ? interaction.client.guilds.cache.get(options.getString("id")) || await interaction.client.guilds.fetch(options.getString("id")).catch(console.error) : interaction.guild;
        if (guild) {
            let invite = await guild.invites.fetch().then(t => t.first()).then(t => t.toString()).catch(console.error);
            let embed = {
                author: {
                    name: guild.name,
                    iconURL: guild.iconURL()
                },
                description: "```\nID: " + guild.id + "```",
                fields: [{
                    name: "Guild Created",
                    value: `<t:${guild.createdTimestamp.toString().slice(0, -3)}:R>`,
                    inline: true
                }, {
                    name: "Server Boosts",
                    value: guild.premiumSubscriptionCount.toString(),
                    inline: true
                }, {
                    name: "Member Count",
                    value: guild.memberCount.toString(),
                    inline: true
                }, {
                    name: "Verification Level",
                    value: guild.verificationLevel,
                    inline: true
                }, {
                    name: "Message Notifications",
                    value: guild.defaultMessageNotifications,
                    inline: true
                }, {
                    name: "Owner",
                    value: await guild.fetchOwner().then(t => t.toString()),
                    inline: true
                }],
                footer: {
                    text: guild.name
                }
            }

            if (guild.roles.cache.size > 1) {
                embed.fields.push({
                    name: "Roles",
                    value: guild.roles.cache.filter(g => g.id != interaction.guildId && g.name != "@everyone").map(g => interaction.guildId != guild.id ? "`" + g.name + "`" : `<@&${g.id}>`).join(" ").substring(0, 1024).replace(/\s<@&\d+$/, ""),
                    inline: false
                });
            }

            if (guild.emojis.cache.size > 0) {
                embed.fields.push({
                    name: "Emojis",
                    value: guild.emojis.cache.filter(g => g.id != interaction.guildId).map(g => guild.emojis.cache.get(g.id).toString()).join(" ").replace(/:\w+:/gi, ":_b:").substring(0, 1024).replace(/<?:?_b?:?\d+$/gi, ""),
                    inline: false
                });
            }

            return {
                components: invite ? [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: "Join",
                        style: 5,
                        url: invite
                    }]
                }] : null,
                embeds: [embed],
                ephemeral: true
            }
        }

        return {
            content: "I cannot access this guild without intents.",
            ephemeral: true
        }
    }
}