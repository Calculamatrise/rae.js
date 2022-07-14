import Time from "../utils/Time.js";

export default {
    async execute(interaction, options) {
        const member = options.getMember("user");
        if (!member) {
            return {
                content: "The specified user does not exist.",
                ephemeral: true
            }
        }

        const time = new Time(...options.get("time").value.replace(/\s+/g, "").match(/\d+|\D+/gi));
        if (time.error) {
            return {
                content: "Specify a valid time.",
                ephemeral: true
            }
        } else if (!member.voice.channel) {
            return {
                content: "**" + member.user.tag + "** is not connected to a voice channel.",
                ephemeral: true
            }
        }

        await member.voice.setDeaf(!0).catch(function(error) {
            return console.error(`deafen.js: ${error.message}`);
        });

        interaction.client.deafs.set(interaction.guildId, member.id, {
            time: time.ms, timeout: setTimeout(async () => {
                interaction.followUp(await interaction.client.interactions.emit("undeafen", interaction, options)).catch(function(error) {
                    return console.error(`deafen.js: ${error.message}`);
                });
            }, time.ms)
        });

        return {
            content: "**" + member.user.tag + "** was deafened for " + time.toString() + ".",
            components: [
                {
                    type: "ACTION_ROW",
                    components: [
                        {
                            type: "BUTTON",
                            label: "Undeafen",
                            style: "SECONDARY",
                            customId: `undeafen-${member.id}`
                        }
                    ]
                }
            ]
        }
    },
    async click(interaction, options) {
        let user = options.get("user");
        user.type = "USER";
        user.member = interaction.guild.members.cache.get(user.value) || await interaction.guild.members.fetch(user.value);
        return this.execute(...arguments);
    },
    data: {
        name: "deafen",
        description: "Timed deafen.",
        default_member_permissions: 1 << 23,
        dm_permission: false,
        options: [
            {
                name: "user",
                description: "User to deafen.",
                type: 6,
                required: true
            },
            {
                name: "time",
                description: "Duration of deafen.",
                type: 3,
                required: true
            }
        ]
    }
}