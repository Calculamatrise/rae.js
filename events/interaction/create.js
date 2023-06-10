import { CommandInteractionOptionResolver } from "discord.js";

export default async function(interaction) {
    let command = interaction.commandName;
    let subcommand = interaction.hasOwnProperty('options') && interaction.options.getSubcommand(false);
    if (subcommand) {
        command += subcommand.replace(/^./, char => char.toUpperCase());
    }

    let args = interaction.options?.data || [];
    if (interaction.hasOwnProperty('customId') || interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
        [command, ...args] = interaction.customId?.split('-') ?? [];
        subcommand = command.split(/(?=[A-Z])/).slice(1).at(-1);
        if (subcommand) {
            subcommand = subcommand.toLowerCase();
        }

        args = args.map(value => ({ value })) || [];
        if (interaction.isStringSelectMenu()) {
            interaction.values.forEach(item => args.push({ value: item.value ?? item }));
        }
    }

    if (this.interactions.has(command, (interaction.commandType ?? 1) != 1)) {
        const event = this.interactions.get(command);
        if (!interaction.isRepliable() && !interaction.responded) {
            return interaction.respond(await event.focus(interaction, interaction.options.getFocused(true)))
            .catch(error => console.error("FocusedInteraction:", error.message));
        }

        if ((event.blacklist !== void 0 && event.blacklist.has(interaction.user.id)) || (event.whitelist !== void 0 && !event.whitelist.has(interaction.user.id))) {
            return interaction.reply({
                content: event.response || "Insufficient privledges.",
                ephemeral: true
            });
        }

        let data;
        if (interaction.isButton() || interaction.isStringSelectMenu() || interaction.isModalSubmit()) {
            let parent = this.interactions.get(command.replace(/[A-Z].*/g, ''));
            let options = event?.options || parent?.options?.find(option => option.name == subcommand)?.options;
            if (options) interaction.options = new CommandInteractionOptionResolver(interaction.client, args.map((argument, index) => Object.assign(options[index], argument)));
            let method = interaction.isStringSelectMenu() ? 'select' : 'click';
            if (!event.hasOwnProperty(method)) method = 'execute';
            if (data = await event[method](interaction, interaction.options, args)) {
                await interaction[interaction.deferred ? 'followUp' : interaction.replied ? 'editReply' : 'reply'](data).catch(function({ message }) {
                    console.error("InteractionCreate:", message);
                });
            } else if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }
        } else if (data = await event.execute(interaction, interaction.options, args)) {
            await interaction[interaction.deferred ? 'editReply' : interaction.replied ? 'followUp' : 'reply'](data).catch(function({ message }) {
                console.error("InteractionCreate:", message);
            });
        } else if (interaction.isRepliable() && !interaction.replied) {
            await interaction[(interaction.deferred ? 'editR' : 'r') + 'eply']({
                content: "Something went wrong. Please try again!",
                ephemeral: true
            });
        }

        this.setIdle(false);
    }
}