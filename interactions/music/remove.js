import Track from "../../utils/Track.js";

export default {
    execute(interaction, options) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be connected to my voice channel to execute this function.",
                ephemeral: true
            }
        }

        let player = interaction.client.players.get(interaction.guildId);
        if (!player || player.queue.size === 0) {
            return {
                content: "No songs are playing.",
                ephemeral: true
            }
        }

        let song = player.queue.find(t => t == options.getInteger('track'));
        if (song instanceof Track) {
            player.queue.splice(player.queue.indexOf(song), 1);
            return {
                content: `Successfully removed **${song.name}** from the queue.`
            }
        }

        return {
            content: `No song was found at position: ${options.getInteger("track")}`
        }
    },
    focus(interaction, option) {
        if (interaction.client.players.has(interaction.guildId)) {
            let player = interaction.client.players.get(interaction.guildId);
            if (player.queue.length > 0) {
                return player.queue
                .slice(0, 25)
                .map(({ name }, index) => ({ name, value: index }))
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

        return [];
    }
}