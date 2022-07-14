export default {
    async execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to execute this command!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.cache.get(interaction.guildId);
        if (queue && !queue.stopped) {
            let song = queue.pause();
            let content = {
                content: `**Paused**\n[${song.name}](<${song.url}>)`,
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "BUTTON",
                                label: "Back",
                                style: "PRIMARY",
                                customId: "musicBack"
                            },
                            {
                                type: "BUTTON",
                                label: "Play",
                                style: "PRIMARY",
                                customId: "musicResume"
                            },
                            {
                                type: "BUTTON",
                                label: "Skip",
                                style: "PRIMARY",
                                customId: "musicSkip"
                            }
                        ]
                    }
                ]
            }

            return queue.interaction.editReply(content).then(function() {
                return {
                    content: "Paused.",
                    ephemeral: true
                }
            }).catch(function() {
                return content;
            });
        }

        return {
            content: "Nothing is playing.",
            ephemeral: true
        }
    },
    click() {
        this.execute(...arguments);
    }
}