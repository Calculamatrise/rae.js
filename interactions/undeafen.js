export default {
    async execute(interaction, options) {
        const member = options.getMember("user");
        if (!member) {
            return {
                content: "The specified user does not exist in this server.",
                ephemeral: true
            }
        } else if (!member.voice.channel) {
            return {
                content: "**" + member.user.tag + "** is not connected to a voice channel.",
                ephemeral: true
            }
        }

        const deafen = interaction.client.deafs.get(interaction.guildId, member.id);
        if (!deafen) {
            if (member.voice.serverDeaf) {
                await member.voice.setDeaf(false).catch(function(error) {
                    console.error(`undeafen.js: ${error.message}`);
                });
                
                return {
                    content: "**" + member.user.tag + "** was undeafened."
                }
            }

            return {
                content: "**" + member.user.tag + "** is not deafened.",
                ephemeral: true
            }
        }

        clearTimeout(deafen.timeout);
        await member.voice.setDeaf(false).catch(function(error) {
            console.error(`undeafen.js: ${error.message}`);
        });

        interaction.client.deafs.delete(interaction.guildId, member.id);
        return {
            content: "**" + member.user.tag + "** was undeafened.",
            components: [{
                type: 1,
                components: [{
                    type: 2,
                    label: "Deafen again",
                    style: 1,
                    customId: `deafen-${member.id}-${deafen.time || 10000}`
                }]
            }]
        }
    },
    async click(interaction, options) {
        let user = options.get("user");
        user.type = "USER";
        user.member = interaction.guild.members.cache.get(user.value) || await interaction.guild.members.fetch(user.value);
        return this.execute(...arguments);
    },
    data: {
        description: "Undeafen a deafened user.",
        default_member_permissions: 1 << 23,
        dm_permission: false,
        options: [{
            name: "user",
            description: "User to be undeafened.",
            type: 6,
            required: true
        }]
    }
}