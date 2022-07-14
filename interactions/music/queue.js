export default {
    execute(interaction) {
        const queue = interaction.client.queues.cache.get(interaction.guildId);
        if (!queue || queue.songs.length === 0) {
            return {
                content: "No songs are playing.",
                ephemeral: true
            }
        }

        let components = [];
        if (queue.songs.length > 5) {
            components.push({
                type: "ACTION_ROW",
                components: [
                    {
                        type: "BUTTON",
                        label: "Previous page",
                        style: "PRIMARY",
                        customId: "musicQueue-page-previous",
                        disabled: queue.page <= 1
                    },
                    {
                        type: "BUTTON",
                        label: "Next page",
                        style: "PRIMARY",
                        customId: "musicQueue-page-next",
                        disabled: queue.songs.length <= queue.page * 5
                    }
                ]
            });
        }

        if (queue.songs.length > 0) {
            components.push({
                type: "ACTION_ROW",
                components: [
                    {
                        type: "SELECT_MENU",
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
                    }
                ]
            });
        }

        return {
            components,
            embeds: [
                {
                    title: "Queue",
                    description: queue.songs.filter(function(item, index) {
                        return index < 5;
                    }).map(function(item) {
                        return `${queue.songs.indexOf(item) + 1}. [${item.title || item.name}](<${item.url || item.external_urls.spotify}>)`;
                    }).join("\n"),
                    color: "#2f3136"
                }
            ]
        }
    },
    click(interaction, options, args) {
        if (!interaction.member.voice.channel || interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be connected to my voice channel to execute this function.",
                ephemeral: true
            }
        }

        let queue = interaction.client.queues.cache.get(interaction.guildId);
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
    
                let components = [];
                if (queue.songs.length > 5) {
                    components.push({
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "BUTTON",
                                label: "Previous page",
                                style: "PRIMARY",
                                customId: "musicQueue-page-previous",
                                disabled: queue.page <= 1
                            },
                            {
                                type: "BUTTON",
                                label: "Next page",
                                style: "PRIMARY",
                                customId: "musicQueue-page-next",
                                disabled: queue.songs.length <= queue.page * 5
                            }
                        ]
                    });
                }
                
                if (queue.songs.length > 0) {
                    components.push({
                        type: "ACTION_ROW",
                        components: [
                            {
                                type: "SELECT_MENU",
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
                            }
                        ]
                    });
                }
    
                return {
                    components,
                    embeds: [
                        {
                            title: "Queue",
                            description: queue.songs.filter(function(item, index) {
                                return index >= (queue.page - 1) * 5 && index < queue.page * 5;
                            }).map(function(item) {
                                return `${queue.songs.indexOf(item) + 1}. [${item.title || item.name}](<${item.url || item.external_urls.spotify}>)`;
                            }).join("\n"),
                            color: "#2f3136"
                        }
                    ],
                    response: "update"
                }
        }
    },
    async select(interaction, options, args) {
        if (interaction.member.voice.channelId != interaction.guild.me.voice.channelId) {
            return {
                content: "You must be connected to my voice channel to execute this function.",
                ephemeral: true
            }
        }
    
        let queue = interaction.client.queues.cache.get(interaction.guildId);
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
            return {
                content: "All tracks have been removed from the queue.",
                components: [],
                embeds: [],
                response: "update"
            }
        }
    
        let components = [];
        if (queue.songs.length > 5) {
            components.push({
                type: "ACTION_ROW",
                components: [
                    {
                        type: "BUTTON",
                        label: "Previous page",
                        style: "PRIMARY",
                        customId: "musicQueue-page-previous",
                        disabled: queue.page <= 1
                    },
                    {
                        type: "BUTTON",
                        label: "Next page",
                        style: "PRIMARY",
                        customId: "musicQueue-page-next",
                        disabled: queue.songs.length <= queue.page * 5
                    }
                ]
            });
        }
        
        if (queue.songs.length > 0) {
            components.push({
                type: "ACTION_ROW",
                components: [
                    {
                        type: "SELECT_MENU",
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
                    }
                ]
            });
        }
    
        await interaction.update({
            components,
            embeds: [
                {
                    title: "Queue",
                    description: queue.songs.filter(function(item, index) {
                        return index >= (queue.page - 1) * 5 && index < queue.page * 5;
                    }).map(function(item) {
                        return `${queue.songs.indexOf(item) + 1}. [${item.title || item.name}](<${item.url || item.external_urls.spotify}>)`;
                    }).join("\n"),
                    color: "#2f3136"
                }
            ]
        });
    
        return {
            content: `Successfully removed **${song.name}** from the queue.`,
            response: "followUp"
        }
    }
}