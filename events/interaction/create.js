import { CommandInteractionOptionResolver } from "discord.js";

export default async function(interaction) {
    let command = interaction.commandName;
    let subcommand = interaction.options?.getSubcommand(false);
    if (subcommand) {
        command += subcommand[0].toUpperCase() + subcommand.slice(1);
    }

    let args = interaction.options?.data || [];
    if (interaction.isButton() || interaction.isSelectMenu()) {
        command = interaction.customId.replace(/-.+/, "");
        subcommand = command.replace(/.*(?=[A-Z])/g, "").toLowerCase();
        if (interaction.customId.includes("-")) {
            interaction.customId.replace(/^\w+-/gi, "").split("-").forEach(t => args.push({ value: t }));
        }

        if (interaction.isSelectMenu()) {
            interaction.values.map((item) => args.push({ value: item.value || item }));
        }
    }

    if (this.interactions.has(command, interaction.isContextMenu())) {
        const event = this.interactions.get(command);
        if (interaction.isAutocomplete()) {
            !interaction.responded && interaction.respond(await event.focus(interaction, interaction.options.getFocused(true))).catch(function(error) {
                console.error("FocusedInteraction:", error.message);
            });
            return;
        }

        if (typeof event.data == "object") {
            if (event.data.dm_permission === false && interaction.channel.type == "DM") {
                interaction.reply({
                    content: "You may not use this command in direct messages.",
                    ephemeral: true
                });
                return;
            }

            if (event.data.default_member_permissions) {
                if (!interaction.member?.permissions.has(BigInt(event.data.default_member_permissions)) && interaction.user.id != interaction.client.application.owner.id) {
                    interaction.reply({
                        content: "Insufficient privledges.",
                        ephemeral: true
                    });
                    return;
                }
            }
        }

        if ((event.blacklist instanceof Set && event.blacklist.has(interaction.user.id)) || (event.whitelist instanceof Set && !event.whitelist.has(interaction.user.id))) {
            interaction.reply({
                content: event.response || "Insufficient privledges.",
                ephemeral: true
            });
            return;
        }

        if (interaction.isButton() || interaction.isSelectMenu()) {
            let parent = this.interactions.get(command.replace(/[A-Z].*/g, ""));
            let options = event.data?.options || parent.data?.options?.find(option => option.name == subcommand)?.options;
            if (options) interaction.options = new CommandInteractionOptionResolver(interaction.client, args.map((argument, index) => Object.assign(options[index], argument)));
            let data = await event[interaction.isSelectMenu() ? "select" : "click"](interaction, interaction.options, args);
            if (!data) {
                if (!interaction.deferred && !interaction.replied) {
                    await interaction.deferUpdate();
                }
            } else {
                await interaction[interaction.deferred ? "followUp" : interaction.replied ? "editReply" : "reply"](data).catch(function({ message }) {
                    console.error("InteractionCreate:", message);
                });
            }
        } else {
            let data = await this.interactions.emit(command, interaction, interaction.options, args);
            if (!data) {
                if (!interaction.replied) {
                    interaction[(interaction.deferred ? "editR" : "r") + "eply"]({
                        content: "Something went wrong. Please try again!",
                        ephemeral: true
                    });
                }
            } else {
                await interaction[interaction.deferred ? "editReply" : interaction.replied ? "followUp" : "reply"](data).catch(function({ message }) {
                    console.error("InteractionCreate:", message);
                });
            }
        }

        this.setIdle(false);
    }
}