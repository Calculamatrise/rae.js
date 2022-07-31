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
                content: `**${song.playing ? "Now playing" : "Track Queued - Position " + queue.songs.size}**\n[${song.name}](<${song.url}>)`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: queue.songs.freeze ? "Stop Looping" : "Loop Track",
                        style: 1 + queue.songs.freeze,
                        customId: queue.songs.freeze ? "musicUnloop" : "musicLoop-track",
                        emoji: null, // "🔂",
                        disabled: false
                    }, {
                        type: 2,
                        label: queue.songs.cycle ? "Stop Looping Queue" : "Loop Queue",
                        style: 1 + queue.songs.cycle,
                        customId: queue.songs.cycle ? "musicUnloop" : "musicLoop-queue",
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
            console.error("PlayInteraction:", error.message);
            return {
                content: error.message,
                ephemeral: true
            }
        });
    },
    focus(interaction, option) {
        if (interaction.client.queues.has(interaction.guildId)) {
            let queue = interaction.client.queues.get(interaction.guildId);
            if (queue.songs.recentlyPlayed.size > 0) {
                return Array.from(queue.songs.recentlyPlayed.values())
                .slice(0, 25)
                .reverse()
                .map(({ name, url }) => ({ name, value: url }))
                .filter(prof =>  prof.name.toLowerCase().includes(option.value.toLowerCase()))
                .sort((a, b) => {
                    if (a.name.toLowerCase().indexOf(option.value.toLowerCase()) > b.name.toLowerCase().indexOf(option.value.toLowerCase())) {
                        return 1;
                    } else if (a.name.toLowerCase().indexOf(option.value.toLowerCase()) < b.name.toLowerCase().indexOf(option.value.toLowerCase())) {
                        return -1;
                    }

                    return a.name > b.name ? 1 : -1;
                });
            }
        }

        if (option.value.length < 1) return [];
        return Queue.getVideo(option.value, { limit: 5 }).then(songs => songs.map(({ title, url }) => ({ name: title, value: url || title }))).catch(function(error) {
            console.error("PlayFocusInteraction", error.message);
            return [];
        });
    }
}