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

        const menu = new Map();
        const filter = m => m.author.id == interaction.user.id;
        const collector = interaction.channel.createMessageCollector({ filter, max: 20, idle: 240e3 });
        collector.on('collect', async function(message) {
            if (/^(stop|cancel)$/i.test(message.content)) {
                this.collected.clear();
                return this.stop();
            } else if (/^done$/i.test(message.content)) {
                return this.stop();
            }

            const arr = message.content.split(/(?<=^\S+)\s/);
            const role = arr[1] && (interaction.guild.roles.cache.find(r => r.id === arr[1].replace(/^<@&|>$/g, '') || r.name.toLowerCase() == arr[1].toLowerCase()));
            if (!role) {
                await interaction.followUp({
                    content: "Role not found! Try \\@mentioning the role.",
                    ephemeral: true
                });
                if (this.collected.delete(this.dispose(message))) {
                    message.deletable && message.delete();
                }
                return;
            }

            const emoji = await message.react(arr[0]).then(({ emoji }) => emoji.toString()).catch(() => undefined);
            if (!emoji) {
                await interaction.followUp({
                    content: "Emoji not found! Please use a different emoji.",
                    ephemeral: true
                });
                if (this.collected.delete(this.dispose(message))) {
                    message.deletable && message.delete();
                }
                return;
            } else if (menu.has(emoji)) {
                await interaction.followUp({
                    content: "You've already used that emoji! Pleae pick a new one and try again.",
                    ephemeral: true
                });
                if (this.collected.delete(this.dispose(message))) {
                    message.deletable && message.delete();
                }
                return;
            }

            menu.set(emoji, role);
        });

        collector.on('end', async function(collected) {
            if (menu.size > 0) {
                const message = await channel.send(`**Role ${options.getBoolean('single-choice') ? 'Select ' : ''}Menu${title ? (': ' + title) : ''}**\nReact to give yourself a role!\n\n` + Array.from(menu.entries()).map(([emoji, role]) => emoji + ' ' + role.name).join('\n'));
                for (const emoji of menu.keys()) {
                    await message.react(emoji);
                }
            } else {
                await interaction.followUp({
                    content: "Operation terminated due to inactivity.",
                    ephemeral: true
                });
            }

            for (const message of collected.values()) {
                message.deletable && message.delete();
            }
        });
    },
    options: [{
        name: "channel",
        description: "Where would you like to send the role menu?",
        channel_types: [0, 5, 10, 11, 12],
        type: 7,
        required: true
    }, {
        name: "single-choice",
        description: "Force users to pick ONLY one role. (default: false)",
        type: 5,
        required: false
    }, {
        name: "category",
        description: "Choose a title.",
        type: 3,
        required: false
    }]
}