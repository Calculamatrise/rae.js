export default {
    data: {
        name: "overview",
        description: "Gather publicly available data.",
        options: [{
            name: "guild",
            description: "Get data from any guild via ID.",
            type: 1,
            options: [{
                name: "id",
                description: "Guild ID.",
                type: 3,
                required: false
            }]
        }, {
            name: "message",
            description: "Gather data on a discord user.",
            type: 1,
            options: [{
                name: "message",
                description: "Gather data from a message.",
                type: 3,
                required: true
            }]
        }, {
            name: "user",
            description: "Gather data on a discord user.",
            type: 1,
            options: [{
                name: "user",
                description: "Gather data from a user.",
                type: 6,
                required: true
            }]
        }]
    }
}