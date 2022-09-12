import Client from "./client/Client.js";
import { GatewayIntentBits, Partials } from "discord.js";

export const client = new Client({
    allowedMentions: {
        parse: [
            "users",
            "roles"
        ],
        repliedUser: true
    },
    intents: [
        GatewayIntentBits.DirectMessages,
        GatewayIntentBits.DirectMessageReactions,
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.GuildMessageReactions,
        GatewayIntentBits.GuildPresences,
        GatewayIntentBits.GuildVoiceStates,
        GatewayIntentBits.GuildWebhooks,
        // GatewayIntentBits.MessageContent,
    ],
    partials: [
        Partials.Channel, // Required to receive DMs
        Partials.GuildMember
    ]
});

client.login(process.env.TOKEN);

// clear cache on glitch
// rm -rf .cache

import Heart from "./heartbeat.js";

const heart = new Heart({
    rate: 6e4
});

heart.on("pulse", function(beats) {
    console.log("Heartbeat", beats);
});

heart.listen();