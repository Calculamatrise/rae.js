export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to resume the music!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue && queue.stopped) {
            queue.player.unpause();
            let content = {
                content: `**Now playing**\n[${queue.currentTrack.name}](<${queue.currentTrack.url}>)`,
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
                    content: "Now playing!",
                    ephemeral: true
                }
            }).catch(function() {
                return content;
            });
        }
        
        return {
            content: "Music is already playing!",
            ephemeral: true
        }
    },
    click() {
        this.execute(...arguments);
    }
}