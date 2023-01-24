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

        const channel = options.getChannel('channel') ?? interaction.channel;
        const title = options.getString('category');
        await interaction.reply({
            content: "Send each emoji with its corresponding role individually **seperated by a space**. Type **done** when you're ready! (max: 20)\nExample: \\💜 Purple",
            ephemeral: true
        });

        let roles = [];
        let messageCache = [];
        for (let i = 0; i < 20; i++) {
            let message = await interaction.channel.awaitMessages({ filter: m => m.author.id == interaction.user.id, max: 1, time: 240e3 }).then(r => r.first());
            if (!message) return {
                content: "You ran out of time! Please try again.",
                ephemeral: true
            }

            messageCache.push(message);
            if (/^(stop|cancel)$/i.test(message.content)) {
                await message.delete().catch(e => e);
                return {
                    content: "Operation terminated.",
                    ephemeral: true
                }
            } else if (/^(done)$/i.test(message.content)) {
                break;
            }

            let [emoji, role] = message.content.split(/(?<=^\S+)\s/);
            if (!emoji || !role) {
                await interaction.followUp({
                    content: "Something went wrong. Please try again!",
                    ephemeral: true
                });
                i--;
                continue;
            }

            role = interaction.guild.roles.cache.find(r => r.id === role || r.name.toLowerCase() == role.toLowerCase());
            if (role) {
                role.emoji = interaction.client.emojis.cache.find(e => e.id == emoji || e.name == emoji) ?? interaction.guild.emojis.cache.find(e => e.id == emoji || e.name == emoji) ?? emoji;
                if (roles.find(r => r.emoji.toString() == role.emoji.toString())) {
                    await message.reply({
                        content: "You've already used that emoji! Pleae pick a new one and try again.",
                        ephemeral: true
                    }).then(message => setTimeout(() => message.delete().catch(e => e), 3e3));
                    i--;
                    continue;
                }
                
                await message.react(role.emoji).then(r => roles.push(role)).catch(async err => {
                    await message.reply({
                        content: "Emoji not found. Please use a different emoji!",
                        ephemeral: true
                    }).then(message => setTimeout(() => message.delete().catch(e => e), 3e3));
                    i--;
                });
            } else {
                await message.reply({
                    content: "Role not found! Try \\@mentioning the role.",
                    ephemeral: true
                }).then(message => setTimeout(() => message.delete().catch(e => e), 3e3));
                i--;
            }
        }

        channel.send(`**Role ${options.getBoolean('multiple') ? '' : 'Select '}Menu${title ? (': ' + title) : ''}**\nReact to give yourself a role!\n\n` + roles.map(r => r.emoji.toString() + ' ' + r.name).join('\n')).then(async m => {
            for (const { emoji } of roles) {
                await m.react(emoji);
            }

            for (const message of messageCache) {
                message.delete().catch(e => e);
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
        name: "category",
        description: "Choose a title.",
        type: 3,
        required: false
    }]
}