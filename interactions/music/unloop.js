export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to resume the music!",
                ephemeral: true
            }
        }

        let player = interaction.client.players.get(interaction.guildId);
        if (player && !player.stopped) {
            player.setLoop(false);
            player.setQueueLoop(false);
            let song = player.currentTrack;
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

            return player.interaction.editReply(content).then(function() {
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
    }
}