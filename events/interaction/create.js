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
            interaction.respond(await event.focus(interaction, interaction.options.getFocused(true)));
            return;
        }

        if (event.data?.dm_permission === false && interaction.channel.type == "DM") {
            interaction.reply({
                content: "You may not use this command in direct messages.",
                ephemeral: true
            });
            return;
        }

        if (event.data?.default_member_permissions) {
            if (!interaction.member?.permissions.has(BigInt(event.data.default_member_permissions)) && interaction.user.id != interaction.client.application.owner.id) {
                interaction.reply({
                    content: "Insufficient privledges.",
                    ephemeral: true
                });
                return;
            }
        }

        if ((event.blacklist instanceof Array && event.blacklist.has(interaction.user.id)) || (event.whitelist instanceof Array && !event.whitlist.has(interaction.user.id))) {
            interaction.reply({
                content: event.response || "Insufficient privledges.",
                ephemeral: true
            });
            return;
        }

        const parent = this.interactions.get(command.replace(/[A-Z].*/g, ""));
        const options = event.data?.options || parent.data?.options?.find(option => option.name == subcommand)?.options;
        if (options) {
            if (interaction.isButton() || interaction.isSelectMenu()) {
                for (const argument of args) {
                    if (!options[args.indexOf(argument)]) break;
                    argument.name = options[args.indexOf(argument)].name;
                    argument.type = options[args.indexOf(argument)].type;
                }

                interaction.options = new CommandInteractionOptionResolver(interaction.client, args);
            }
        }

        const data = await this.interactions.emit(command, interaction, interaction.options, args);
        if (!data) {
            if (interaction.isButton() || interaction.isSelectMenu()) {
                interaction.deferUpdate();
                return;
            }

            interaction[(interaction.deferred ? "editR" : "r") + "eply"]({
                content: "Something went wrong. Please try again!",
                ephemeral: true
            });
            return;
        }

        const { response: responseType, then: followUp } = data;
        delete data.response;
        delete data.then;

        await interaction[responseType || "reply"](data).catch(console.error);
        if (followUp) {
            interaction.followUp(followUp).catch(console.error);
        }

        this.setIdle(false);
    }
}