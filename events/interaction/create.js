import { CommandInteractionOptionResolver } from "discord.js";

export default async function(interaction) {
    let command = interaction.commandName;
    let subcommand = interaction.options?.getSubcommand(false);
    if (subcommand) {
        command += subcommand.replace(/^./, char => char.toUpperCase());
    }

    let args = interaction.options?.data || [];
    if (interaction.isButton() || interaction.isStringSelectMenu()) {
        [command, ...args] = interaction.customId.split('-');
        subcommand = command.split(/(?=[A-Z])/).slice(1).at(-1);
        if (subcommand) {
            subcommand = subcommand.toLowerCase();
        }

        args = args.map(t => ({ value: t })) || [];
        if (interaction.isStringSelectMenu()) {
            interaction.values.forEach(item => args.push({ value: item.value ?? item }));
        }
    }

    if (this.interactions.has(command, (interaction.commandType ?? 1) != 1)) {
        const event = this.interactions.get(command);
        if (!interaction.isRepliable() && !interaction.responded) {
            return void interaction.respond(await event.focus(interaction, interaction.options.getFocused(true)))
            .catch(error => console.error("FocusedInteraction:", error.message));
        }

        if ((event.blacklist !== void 0 && event.blacklist.has(interaction.user.id)) || (event.whitelist !== void 0 && !event.whitelist.has(interaction.user.id))) {
            return void interaction.reply({
                content: event.response || "Insufficient privledges.",
                ephemeral: true
            });
        }

        let data;
        if (interaction.isButton() || interaction.isStringSelectMenu()) {
            let parent = this.interactions.get(command.replace(/[A-Z].*/g, ''));
            let options = event?.options || parent?.options?.find(option => option.name == subcommand)?.options;
            if (options) interaction.options = new CommandInteractionOptionResolver(interaction.client, args.map((argument, index) => Object.assign(options[index], argument)));
            let method = interaction.isStringSelectMenu() ? 'select' : 'click';
            if (!event.hasOwnProperty(method)) method = 'execute';
            if (method != 'execute' && (data = await event[method](interaction, interaction.options, args))) {
                await interaction[interaction.deferred ? 'followUp' : interaction.replied ? 'editReply' : 'reply'](data).catch(function({ message }) {
                    console.error("InteractionCreate:", message);
                });
            } else if (!interaction.deferred && !interaction.replied) {
                await interaction.deferUpdate();
            }
        } else if (data = await this.interactions.emit(command, interaction, interaction.options, args)) {
            await interaction[interaction.deferred ? 'editReply' : interaction.replied ? 'followUp' : 'reply'](data).catch(function({ message }) {
                console.error("InteractionCreate:", message);
            });
        } else if (!interaction.replied) {
            interaction[(interaction.deferred ? 'editR' : 'r') + 'eply']({
                content: "Something went wrong. Please try again!",
                ephemeral: true
            });
        }

        this.setIdle(false);
    }
}