export default {
    description: "Create a reaction role menu.",
    default_member_permissions: 1 << 28,
    dm_permission: false,
    async execute(interaction, options) {
        if (!interaction.member.permissions.has('MANAGE_ROLES')) {
            return {
                content: "You don't have sufficient privledges to execute this command. The `MANAGE_ROLES` scope is required!",
                ephemeral: true
            }
        }

        const channel = options.getChannel('channel');
        const title = options.getString('title');
        await interaction.reply({
            content: "Send each emoji with its corresponding role individually (separate messages) seperated by a space. Type done when you're ready! (max: 20)\nExample: \\💜 Purple",
            ephemeral: true
        });

        let roles = [];
        let messageCache = [];
        for (let i = 0; i < 20; i++) {
            let message = await interaction.channel.awaitMessages({ filter: m => m.author.id == interaction.user.id, max: 1, time: 180e3 }).then(r => r.first());
            if (!message) break;
            messageCache.push(message);
            if (/^(stop|cancel)$/i.test(message.content)) {
                await message.delete().catch(console.warn);
                return {
                    content: "Process terminated.",
                    ephemeral: true
                }
            } else if (/^(done)$/i.test(message.content)) {
                break;
            }

            let [emoji, role] = message.content.split(/\s+/);
            if (!emoji || !role) {
                await interaction.followUp({
                    content: "Something went wrong. Please try again!",
                    ephemeral: true
                });
                i--;
                continue;
            }

            let guildRoles = Array.from(interaction.guild.roles.cache.values());
            role = guildRoles.find(r => r.name.toLowerCase() == role.toLowerCase());
            if (role) {
                role.emoji = await message.react(emoji).then(r => r.emoji);
                roles.push(role);
            }
        }

        channel.send(`**Role Menu${title ? (': ' + title) : ''}**\nReact to give yourself a role!\n\n` + roles.map(r => r.emoji.toString() + ' ' + r.name).join('\n')).then(m => {
            for (const { emoji } of roles) {
                m.react(emoji);
            }

            for (const message of messageCache) {
                message.delete();
            }
        });
    },
    options: [{
        name: "channel",
        description: "Where would you like to send the role menu?",
        channel_types: [0, 1, 2, 3, 5, 10, 11, 12],
        type: 7,
        required: true
    }, {
        name: "multiple",
        description: "Allow multiple roles to be selected. (default: true)",
        type: 5,
        required: false
    }, {
        name: "title",
        description: "Choose a title.",
        type: 3,
        required: false
    }]
}