export default {
    async execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to execute this command!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue) {
            let song = queue.skip();
            if (song) {
                let content = {
                    content: `**Now playing**\n[${song.name}](<${song.url}>)`,
                    components: [{
                        type: 1,
                        components: [{
                            type: 2,
                            label: "Back",
                            style: 1,
                            customId: "musicBack"
                        }, {
                            type: 2,
                            label: "Pause",
                            style: 1,
                            customId: "musicPause"
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
                        content: "Skipped the current track!",
                        ephemeral: true
                    }
                }).catch(function() {
                    return content;
                });
            }
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