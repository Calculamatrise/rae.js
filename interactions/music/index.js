export default {
    data: {
        name: "music",
        description: "Music player for voice channels.",
        default_member_permissions: 1 << 20,
        dm_permission: false,
        options: [{
            name: "play",
            description: "Play a song or playlist.",
            type: 1,
            options: [{
                name: "song",
                description: "A song name or url.",
                type: 3,
                required: true,
                autocomplete: true
            }]
        }, {
            name: "loop",
            description: "Loop the track or queue.",
            type: 1,
            options: [{
                name: "range",
                description: "Track or queue.",
                type: 3,
                required: true,
                choices: [{
                    name: "Track",
                    value: "track"
                }, {
                    name: "Queue",
                    value: "queue"
                }]
            }]
        }, {
            name: "back",
            description: "Goes back a track.",
            type: 1
        }, {
            name: "pause",
            description: "Pause the music.",
            type: 1
        }, {
            name: "queue",
            description: "Display the current queue.",
            type: 1
        }, {
            name: "resume",
            description: "Resume the music.",
            type: 1
        }, {
            name: "shuffle",
            description: "Shuffle the queue.",
            type: 1
        }, {
            name: "skip",
            description: "Skip the current track.",
            type: 1
        }, {
            name: "stop",
            description: "Stop the music.",
            type: 1
        }, {
            name: "unloop",
            description: "Unloop looping music.",
            type: 1
        }]
    }
}