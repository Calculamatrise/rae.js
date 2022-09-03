export default {
    data: {
        description: "Interact virtually with other users!",
        dm_permission: false,
        options: [{
            name: "experimental",
            description: "Test gif categories.",
            type: 1,
            options: [{
                name: "input",
                description: "Search parameter.",
                type: 3,
                required: true,
                autocomplete: true
            }]
        }, {
            name: "hug",
            description: "Virtually hug another member.",
            type: 1,
            options: [{
                name: "user",
                description: "Pick a member to hug.",
                type: 6,
                required: true
            }]
        }, {
            name: "rail",
            description: "Virtually rail another member.",
            type: 1,
            options: [{
                name: "user",
                description: "Pick a user to rail.",
                type: 6,
                required: true
            }]
        }]
    }
}