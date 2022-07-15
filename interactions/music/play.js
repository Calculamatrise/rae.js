import Queue from "../../utils/Queue.js";

export default {
    async execute(interaction, options) {
        if (!interaction.member.voice.channel) {
            return {
                content: "You aren't connected to a voice channel!",
                ephemeral: true
            }
        }

        await interaction.deferReply();

        let queue = interaction.client.queues.create(interaction);
        return queue.play(options.getString("song")).then(function(song) {
            return {
                content: `**${song.playing ? "Now playing" : "Track Queued - Position " + queue.songs.length}**\n[${song.name}](<${song.url}>)`,
                components: [
                    {
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "BUTTON",
                                label: queue.repeatOne ? "Stop Looping" : "Loop Track",
                                style: queue.repeatOne ? "SECONDARY" : "PRIMARY",
                                customId: queue.repeatOne ? "musicUnloop" : "musicLoop-track",
                                emoji: null, // "🔂",
                                disabled: false
                            },
                            {
                                type: "BUTTON",
                                label: queue.repeatQueue ? "Stop Looping Queue" : "Loop Queue",
                                style: queue.repeatQueue ? "SECONDARY" : "PRIMARY",
                                customId: queue.repeatQueue ? "musicUnloop" : "musicLoop-queue",
                                emoji: null, // "🔁",
                                disabled: false
                            },
                            {
                                type: "BUTTON",
                                label: "End Session",
                                style: "DANGER",
                                customId: "musicStop",
                                emoji: null, // "🔂",
                                disabled: false
                            }
                        ]
                    }
                ]
            }
        }).catch(function(error) {
            console.error(`PlayInteraction: ${error.message}`);
            return {
                content: error.message,
                ephemeral: true
            }
        });
    },
    focus(interaction, option) {
        let queue = interaction.client.queues.cache.get(interaction.guildId);
        if (queue && queue.recentlyPlayed.length > 0) {
            return queue.recentlyPlayed.map(({ name, url }) => ({ name, value: url }));
        }

        if (option.value.length < 1) return [];
        return Queue.getVideo(option.value, { limit: 5 }).then(songs => songs.map(({ title, url }) => ({ name: title, value: url || title }))).catch(function(error) {
            console.error("PlayFocusInteraction", error.message);
            return [];
        });
    }
}