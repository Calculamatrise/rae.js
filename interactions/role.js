export default {
    async execute(interaction, options) {
        if (!interaction.member.permissions.has("MANAGE_ROLES")) {
            return {
                content: "You don't have sufficient privledges to execute this command. The `MANAGE_ROLES` scope is required!",
                ephemeral: true
            }
        }

        const { role } = options.get("role");
        if (options.getBoolean("auto")) {
            await interaction.client.database.guilds.update(interaction.guildId, {
                auto_role: role.id
            });
            return {
                content: "Successfully enabled auto role for this server.",
                ephemeral: true
            }
        }

        return {
            embeds: [{
                description: options.getString("description") || ("Click on a button below to add or remove the " + role.name + " role!"),
                color: role.color || null
            }],
            components: [
                {
                    type: "ACTION_ROW",
                    components: [
                        {
                            type: "BUTTON",
                            label: "Add",
                            style: "PRIMARY",
                            customId:  "role-add-" + role.id,
                            emoji: null,
                            disabled: false
                        },
                        {
                            type: "BUTTON",
                            label: "Remove",
                            style: "SECONDARY",
                            customId: "role-remove-" + role.id,
                            emoji: null,
                            disabled: false
                        }
                    ]
                }
            ]
        }
    },
    click(interaction, options, args) {
        return this[args[0].value](...arguments);
    },
    async add(interaction, options, args) {
        if (interaction.member.roles.cache.has(args[1].value)) {
            return {
                content: "Looks like you already have this role!",
                ephemeral: true
            }
        }
    
        await interaction.member.roles.add(args[1].value);
        if (interaction.guildId == "433783980345655306") {
            const roles = ["842185148640395284", "833774597756289035", "833774455196483604"];
            roles.filter(t => t != args[1].value).forEach(t => {
                if (interaction.member.roles.cache.has(t)) {
                    interaction.member.roles.remove(t);
                }
            });
        }
    },
    remove(interaction, options, args) {
        if (interaction.member.roles.cache.has(args[1].value)) {
            interaction.member.roles.remove(args[1].value);
        }
    },
    toggle(interaction, options, args) {
        if (interaction.member.roles.cache.has(args[1].value)) {
            return this.remove(...arguments);
        }

        return this.add(...arguments);
    },
    data: {
        name: "role",
        description: "Create a single self-assignable role.",
        // default_member_permissions: 1 << 28,
        dm_permission: false,
        options: [
            {
                name: "role",
                description: "Choose a self-assignable role",
                type: 8,
                required: true
            },
            {
                name: "description",
                description: "Describe what this role does for the user. (pings, color)",
                type: 3,
                required: false
            },
            {
                name: "auto",
                description: "Automatically distribute this role to new members",
                type: 5,
                required: false
            }
        ]
    }
}