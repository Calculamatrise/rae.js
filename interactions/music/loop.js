export default {
    execute(interaction, options) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to resume the music!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue && !queue.stopped) {
            let range = options.getString("range");
            queue.setLoop(range == "track");
            queue.setQueueLoop(range == "queue");
            let song = queue.currentTrack;
            let content = {
                content: `**Now looping**\n[${song.name}](<${song.url}>)`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: queue.currentTrack?.looping ? "Stop Looping" : "Loop Track",
                        style: 1 + queue.currentTrack?.looping,
                        customId: queue.currentTrack?.looping ? "musicUnloop" : "musicLoop-track"
                    }, {
                        type: 2,
                        label: queue.repeatQueue ? "Stop Looping Queue" : "Loop Queue",
                        style: 1 + queue.repeatQueue,
                        customId: queue.repeatQueue ? "musicUnloop" : "musicLoop-queue"
                    }]
                }]
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
    click() {
        this.execute(...arguments);
    }
}