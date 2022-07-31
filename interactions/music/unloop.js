export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to resume the music!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue && !queue.stopped) {
            queue.setLoop(false);
            queue.setQueueLoop(false);
            let song = queue.currentTrack;
            let content = {
                content: `**Now playing**\n[${song.name}](<${song.url}>)`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: "Loop Track",
                        style: 1,
                        customId: "musicLoop-track"
                    }, {
                        type: 2,
                        label: "Loop Queue",
                        style: 1,
                        customId: "musicLoop-queue"
                    }]
                }]
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
    click() {
        this.execute(...arguments);
    }
}