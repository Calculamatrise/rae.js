export default {
    data: {
        name: "chatbridge",
        description: "Communicate to other users Discord wide via DMs.",
        // default_member_permissions: 0,
        options: [{
            name: "opt-in",
            description: "Communicate to other users Discord wide via DMs.",
            type: 1
        }, {
            name: "opt-out",
            description: "Opt out of receiving chat messages.",
            type: 1
        }, {
            name: "setcolor",
            description: "Manager your appearance by colour.",
            type: 1,
            options: [{
                name: "hex",
                description: "A hexadecimal colour value.",
                min_length: 4,
                max_length: 7,
                type: 3,
                required: true
            }]
        }]
    }
}