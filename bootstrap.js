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

client.developerMode = /^(dev|test)$/gi.test(process.argv.at(2));
client.developerMode && await import("./config.js").catch(() => null);
client.database.connect(process.env.DATABASE_KEY);

client.login([process.env.TOKEN, process.env.DEV_TOKEN][+client.developerMode]);