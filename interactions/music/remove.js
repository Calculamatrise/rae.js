import Track from "../../utils/Track.js";

export default {
    execute(interaction, options) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be connected to my voice channel to execute this function.",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (!queue || queue.songs.size === 0) {
            return {
                content: "No songs are playing.",
                ephemeral: true
            }
        }

        let song = Array.from(queue.songs.values())[options.getInteger("track")];
        if (song instanceof Track) {
            queue.songs.delete(song);
            return {
                content: `Successfully removed **${song.name}** from the queue.`
            }
        }

        return {
            content: `No song was found at position: ${options.getInteger("track")}`
        }
    },
    focus(interaction, option) {
        if (interaction.client.queues.has(interaction.guildId)) {
            let queue = interaction.client.queues.get(interaction.guildId);
            if (queue.songs.size > 0) {
                return Array.from(queue.songs.values())
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