export default {
    async execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to execute this command!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue && !queue.stopped) {
            let song = queue.pause();
            let content = {
                content: `**Paused**\n[${song.name}](<${song.url}>)`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: "Back",
                        style: 1,
                        customId: "musicBack"
                    }, {
                        type: 2,
                        label: "Play",
                        style: 1,
                        customId: "musicResume"
                    }, {
                        type: 2,
                        label: "Skip",
                        style: 1,
                        customId: "musicSkip"
                    }]
                }]
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