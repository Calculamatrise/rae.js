export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to resume the music!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.cache.get(interaction.guildId);
        if (queue && !queue.stopped) {
            queue.setLoop(false);
            queue.setQueueLoop(false);
            let song = queue.songs[0];
            let content = {
                content: `**Now playing**\n[${song.name}](<${song.url}>)`,
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "BUTTON",
                                label: "Loop Track",
                                style: "PRIMARY",
                                customId: "musicLoop-track"
                            },
                            {
                                type: "BUTTON",
                                label: "Loop Queue",
                                style: "PRIMARY",
                                customId: "musicLoop-queue"
                            }
                        ]
                    }
                ]
            }

            return queue.interaction.editReply(content).then(function() {
                return {
                    content: "Unlooped the loop.",
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
    async click(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be connected to my voice channel to execute this function.",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.cache.get(interaction.guildId);
        if (queue) {
            queue.setLoop(false);
            queue.setQueueLoop(false);
            return {
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "BUTTON",
                                label: "Loop Track",
                                style: "PRIMARY",
                                customId: "musicLoop-track"
                            },
                            {
                                type: "BUTTON",
                                label: "Loop Queue",
                                style: "PRIMARY",
                                customId: "musicLoop-queue"
                            }
                        ]
                    }
                ],
                response: "update"
            }
        }

        return {
            content: "Nothing is playing.",
            ephemeral: true
        }
    }
}