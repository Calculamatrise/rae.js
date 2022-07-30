export default {
    execute(interaction) {
        let queue = interaction.client.queues.get(interaction.guildId);
        if (!queue || queue.songs.length === 0) {
            return {
                content: "No songs are playing.",
                ephemeral: true
            }
        }

        let components = [];
        if (queue.songs.length > 5) {
            components.push({
                type: 1,
                components: [{
                    type: 2,
                    label: "Previous page",
                    style: 1,
                    customId: "musicQueue-page-previous",
                    disabled: queue.page <= 1
                }, {
                    type: 2,
                    label: "Next page",
                    style: 1,
                    customId: "musicQueue-page-next",
                    disabled: queue.songs.length <= queue.page * 5
                }]
            });
        }

        if (queue.songs.length > 0) {
            components.push({
                type: 1,
                components: [{
                    type: 3,
                    placeholder: "Remove a track",
                    customId: "musicQueue-splice",
                    options: queue.songs.filter(function(item, index) {
                        return index >= (queue.page - 1) * 5 && index < queue.page * 5;
                    }).map(function(item) {
                        return {
                            label: item.name,
                            value: queue.songs.indexOf(item).toString()
                        }
                    })
                }]
            });
        }

        return {
            components,
            embeds: [{
                title: "Queue",
                description: queue.songs.filter(function(item, index) {
                    return index < 5;
                }).map(function(item) {
                    return `${queue.songs.indexOf(item) + 1}. [${item.title || item.name}](<${item.url || item.external_urls.spotify}>)`;
                }).join("\n"),
                color: 3092790
            }]
        }
    },
    async click(interaction, options, args) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be connected to my voice channel to execute this function.",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (!queue) {
            return {
                content: "There is no such queue that exists for this server.",
                ephemeral: true
            }
        }

        switch(args[0].value.toLowerCase()) {
            case "page":
                switch(args[1].value.toLowerCase()) {
                    case "next":
                        queue.page++;
                        break;
    
                    case "previous":
                        queue.page--;
                        break;
                }

                await interaction.update(this.execute(...arguments));
        }
    },
    async select(interaction, options, args) {
        if (interaction.member.voice.channelId != interaction.guild.members.me.voice.channelId) {
            return {
                content: "You must be connected to my voice channel to execute this function.",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.get(interaction.guildId);
        if (!queue) {
            return {
                content: "There is no such queue that exists for this server.",
                ephemeral: true
            }
        }

        let song;
        switch(args[0].value.toLowerCase()) {
            case "splice":
                song = queue.songs.splice(args[1].value, 1)[0];
                break;
        }

        if (queue.songs.length % 5 === 0 && queue.songs.length / 5 < queue.page) {
            queue.page--;
        }

        if (queue.songs.length === 0) {
            interaction.update({
                content: "All tracks have been removed from the queue.",
                components: [],
                embeds: []
            });
            return;
        }

        await interaction.update(this.execute(...arguments));
        interaction.followUp({
            content: `Successfully removed **${song.name}** from the queue.`
        });
    }
}