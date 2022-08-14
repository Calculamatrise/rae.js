import Player from "../../utils/Player.js";

export default {
    async execute(interaction, options) {
        if (!interaction.member.voice.channel) {
            return {
                content: "You aren't connected to a voice channel!",
                ephemeral: true
            }
        }

        await interaction.deferReply();
        if (!interaction.client.players.has(interaction.guildId)) {
            interaction.client.players.set(interaction.guildId, new Player());
        }

        let player = interaction.client.players.get(interaction.guildId);
        if (player.interaction !== null && player.interaction.replied) {
            player.interaction.editReply({ components: [] }).catch(function(error) {
                console.error(`QueueManager: ${error.message}`);
            });
        }

        player.init(interaction);
        return player.play(options.getString("song")).then(function(song) {
            return {
                content: `**${song.playing ? "Now playing" : "Track Queued - Position " + player.queue.size}**\n[${song.name}](<${song.url}>)`,
                components: [{
                    type: 1,
                    components: [{
                        type: 2,
                        label: player.queue.freeze ? "Stop Looping" : "Loop Track",
                        style: 1 + player.queue.freeze,
                        customId: player.queue.freeze ? "musicUnloop" : "musicLoop-track",
                        emoji: null, // "🔂",
                        disabled: false
                    }, {
                        type: 2,
                        label: player.queue.cycle ? "Stop Looping Queue" : "Loop Queue",
                        style: 1 + player.queue.cycle,
                        customId: player.queue.cycle ? "musicUnloop" : "musicLoop-queue",
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
        if (interaction.client.players.has(interaction.guildId)) {
            let player = interaction.client.players.get(interaction.guildId);
            if (player.queue.recentlyPlayed.size > 0) {
                console.log(Array.from(player.queue.recentlyPlayed.values())
                .slice(0, 25)
                .reverse())
                return Array.from(player.queue.recentlyPlayed.values())
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
        return Player.getVideo(option.value, { limit: 5 }).then(songs => songs.map(({ title, url }) => ({ name: title, value: url || title }))).catch(function(error) {
            console.error("PlayFocusInteraction", error.message);
            return [];
        });
    }
}