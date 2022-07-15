import { readdir } from "fs";
import { Client, Intents } from "discord.js";

import DatabaseHandler from "../handlers/database.js";
import InteractionHandler from "../handlers/interactions.js";
import QueueHandler from "../handlers/queues.js";
import Snipes from "../utils/Snipes.js";
import Guild from "../models/guild.js";
import Member from "../models/member.js";
import User from "../models/user.js";
import Temp from "../utils/Temp.js";

export default class extends Client {
    constructor() {
		super({
            allowedMentions: {
                parse: [
                    "users",
                    "roles"
                ],
                repliedUser: true
            },
            intents: [
                Intents.FLAGS.DIRECT_MESSAGES,
                Intents.FLAGS.DIRECT_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILDS,
                Intents.FLAGS.GUILD_MEMBERS,
                Intents.FLAGS.GUILD_MESSAGES,
                Intents.FLAGS.GUILD_MESSAGE_REACTIONS,
                Intents.FLAGS.GUILD_PRESENCES,
                Intents.FLAGS.GUILD_VOICE_STATES,
                Intents.FLAGS.GUILD_WEBHOOKS
            ],
            partials: [
                "CHANNEL", // Required to receive DMs
            ]
        });

        this.database = new DatabaseHandler();
        this.interactions = new InteractionHandler();
        this.queues = new QueueHandler();

		this.snipes = new Snipes();
        this.deafs = new Temp();

        this.#import("./events", events => {
            events.forEach(({ camel, event }) => {
                this.on(camel, event)
            });
        });

        this.#import("./interactions", events => {
            events.forEach(({ camel, name, parent, event }) => {
                if (parent !== null) {
                    this.interactions.on(name == "index" ? parent : camel, event);
                    return;
                }

                this.interactions.on(name, event);
            });
        });

        this.database.connect(process.env.DATABASE_KEY);
        this.database.createStore(Guild);
        this.database.createStore(Member);
        this.database.createStore(User);
        this.database.on("connected", () => {
            this.database.users.get().then((users) => {
                users.forEach(async ({ id, chatbridge, reminder }) => {
                    this.chatbridge.users.set(id, {
                        color: chatbridge.color,
                        messages: new Map()
                    });

                    if (reminder.time !== null) {
                        this.interactions.emit("setreminder", {
                            client: this,
                            user: this.users.cache.get(id) || await this.users.fetch(id)
                        }, {
                            getString(id) {
                                return reminder[id];
                            }
                        });
                    }
                });
            });
        });

        this.database.on("error", function(error) {
            console.error("Database:", error.message);
        });

        this.database.on("disconnected", () => {
            console.warn("I've lost connection to the database!");
        });
	}
    chatbridge = ({
        messages: new Map(),
        users: new Map()
    });
    developerMode = false;
    idling = false;
    #import(directory, callback = (response) => response) {
        return new Promise((resolve, reject) => {
            readdir(directory, async (error, events) => {
                if (error) reject(error);
                let result = [];
                for (const event of events) {
                    if (event.endsWith(".js")) {
                        result.push(await import(`.${directory}/${event}`).then(({ default: data }) => {
                            let name = event.replace(/\.js$/i, "");
                            let response = {
                                camel: name, name,
                                parent: null,
                                event: data
                            }

                            let parents = directory.replace(/^\.\/[^/]*/g, "").match(/[^/]\w+[^/]/g, "");
                            if (parents) {
                                parents.push(name);
                                response.parent = parents.shift();
                                response.camel = response.parent + parents.map(event => event[0].toUpperCase() + event.slice(1)).join("");
                            }

                            return response;
                        }));
                        continue;
                    }

                    result.push(...await this.#import(`${directory}/${event}`));
                }

                resolve(await callback(result));
            });
        });
    }
    
    setIdle(t = true) {
        if (t === void 0 || typeof t !== "boolean") {
            return new Error("INVALID_BOOLEAN");
        }

        this.idling = t;
        this.user.setStatus(t ? "idle" : "online");
        if (!t) {
            setTimeout(() => {
                this.idling = true;
                this.user.setStatus("idle");
            }, 6e4);
        }
        
        return this.idling;
    }

    deployCommands() {
        return new Promise(async (resolve) => {
            if (this.user.id == "708904786916933693") {
                const commands = await this.application.commands.fetch();
                commands.forEach((command) => {
                    if (!this.interactions.has(command.name, command.type != "CHAT_INPUT")) {
                        return command.delete()
                    }
                });

                for (const { data } of this.interactions.values()) {
                    if (!data) continue;
                    if (data instanceof Array) {
                        for (const metadata of data) {
                            await this.application.commands.create(metadata);
                        }
                    } else {
                        await this.application.commands.create(data);
                    }
                }
            } else {
                const commands = await this.guilds.cache.get("433783980345655306").commands.fetch();
                commands.forEach((command) => {
                    if (!this.interactions.has(command.name, command.type != "CHAT_INPUT")) {
                        return command.delete();
                    }
                });

                for (const { data } of this.interactions.values()) {
                    if (!data) continue;
                    if (data instanceof Array) {
                        for (const metadata of data) {
                            await this.guilds.cache.get("433783980345655306").commands.create(metadata);
                        }
                    } else {
                        if (data.name != "setreminder") {
                            continue;
                        }

                        await this.guilds.cache.get("433783980345655306").commands.create(data);
                    }
                }
            }

            resolve();
        });
    }
}