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
        if (!interaction.client.queues.has(interaction.guildId)) {
            interaction.client.queues.set(interaction.guildId, new Queue());
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (queue.interaction !== null && queue.interaction.replied) {
            queue.interaction.editReply({ components: [] }).catch(function(error) {
                console.error(`QueueManager: ${error.message}`);
            });
        }

        queue.init(interaction);
        return queue.play(options.getString("song")).then(function(song) {
            return {
                content: `**${song.playing ? "Now playing" : "Track Queued - Position " + queue.songs.length}**\n[${song.name}](<${song.url}>)`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: queue.currentTrack?.looping ? "Stop Looping" : "Loop Track",
                        style: 1 + queue.currentTrack?.looping,
                        customId: queue.currentTrack?.looping ? "musicUnloop" : "musicLoop-track",
                        emoji: null, // "🔂",
                        disabled: false
                    }, {
                        type: 2,
                        label: queue.repeatQueue ? "Stop Looping Queue" : "Loop Queue",
                        style: 1 + queue.repeatQueue,
                        customId: queue.repeatQueue ? "musicUnloop" : "musicLoop-queue",
                        emoji: null, // "🔁",
                        disabled: false
                    }, {
                        type: 2,
                        label: "End Session",
                        style: 4,
                        customId: "musicStop",
                        emoji: null, // "🔂",
                        disabled: false
                    }]
                }]
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
        let queue = interaction.client.queues.get(interaction.guildId);
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