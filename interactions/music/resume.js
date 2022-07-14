export default {
    execute(interaction) {
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be in my voice channel to resume the music!",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.cache.get(interaction.guildId);
        if (queue && queue.stopped) {
            let song = queue.resume();
            let content = {
                content: `**Now playing**\n[${song.name}](<${song.url}>)`,
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
                                label: "Pause",
                                style: "PRIMARY",
                                customId: "musicPause"
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