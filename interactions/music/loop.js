export default {
    execute(interaction, options) {
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to resume the music!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.cache.get(interaction.guildId);
        if (queue && !queue.stopped) {
            let range = options.getString("range");
            queue.setLoop(range == "track");
            queue.setQueueLoop(range == "queue");
            let song = queue.songs[0];
            let content = {
                content: `**Now looping**\n[${song.name}](<${song.url}>)`,
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "BUTTON",
                                label: queue.repeatOne ? "Stop Looping" : "Loop Track",
                                style: queue.repeatOne ? "SECONDARY" : "PRIMARY",
                                customId: queue.repeatOne ? "musicUnloop" : "musicLoop-track"
                            },
                            {
                                type: "BUTTON",
                                label: queue.repeatQueue ? "Stop Looping Queue" : "Loop Queue",
                                style: queue.repeatQueue ? "SECONDARY" : "PRIMARY",
                                customId: queue.repeatQueue ? "musicUnloop" : "musicLoop-queue"
                            }
                        ]
                    }
                ]
            }

            return queue.interaction.editReply(content).then(function() {
                return {
                    content: `Looped the current ${range}!`,
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
    click(interaction, options) {
        options.get("range").type = "STRING";
        this.execute(...arguments);
    }
}