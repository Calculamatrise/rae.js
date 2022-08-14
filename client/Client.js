import { readdir } from "fs";
import { Client } from "discord.js";

import DatabaseHandler from "../handlers/database.js";
import InteractionHandler from "../handlers/interactions.js";
import SnipeHandler from "../handlers/snipes.js";
import Guild from "../models/guild.js";
import Member from "../models/member.js";
import User from "../models/user.js";
import Temp from "../utils/Temp.js";

export default class extends Client {
    constructor() {
		super(...arguments);

        this.database = new DatabaseHandler();
        this.interactions = new InteractionHandler();
        this.snipes = new SnipeHandler();
        
        this.deafs = new Temp();
        this.players = new Map();

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

        this.database.createStore(Guild);
        this.database.createStore(Member);
        this.database.createStore(User);
        this.database.on("connected", () => {
            this.database.users.get().then((users) => {
                users.forEach(async ({ id, chatbridge }) => {
                    this.chatbridge.users.set(id, {
                        color: chatbridge.color,
                        messages: new Map()
                    });
                });
            });
        });

        this.database.on("error", function(error) {
            console.error(error)
            console.error("Database:", error.message);
        });

        this.database.on("disconnected", () => {
            console.warn("I've lost connection to the database!");
        });
	}
    chatbridge = {
        messages: new Map(),
        users: new Map()
    }
    developerMode = false;
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

                await callback(result), resolve(result);
            });
        });
    }

    setIdle(status = true) {
        if (typeof status !== "boolean") {
            throw new TypeError("INVALID_BOOLEAN");
        }

        status || setTimeout(() => this.user.setStatus("idle"), 6e4);
        return this.user.setStatus(status ? "idle" : "online");;
    }

    deployCommands() {
        return new Promise(async resolve => {
            let commands = this.application.commands;
            if (this.developerMode) {
                commands = this.guilds.cache.get("433783980345655306").commands;
            }

            await commands.fetch().then(commands => {
                commands.forEach((command) => {
                    if (!this.interactions.has(command.name, command.type != 1)) {
                        return command.delete();
                    }
                });
            });

            for (const { data, menudata: { message, user } = {}} of this.interactions.values()) {
                if (this.developerMode && data && data.name != "music") continue;
                data && await commands.create(data);
                message && await commands.create(message);
                user && await commands.create(user);
            }

            resolve();
        });
    }
}