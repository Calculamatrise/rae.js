import { readdir } from "fs";
import { extname, parse } from "path";
import { Client } from "discord.js";

import ChatbridgeHandler from "../handlers/chatbridge.js";
import DatabaseHandler from "../handlers/database.js";
import InteractionHandler from "../handlers/interactions.js";
import SnipeHandler from "../handlers/snipes.js";
import Guild from "../models/guild.js";
import Member from "../models/member.js";
import User from "../models/user.js";
import Temp from "../utils/Temp.js";

export default class extends Client {
    chatbridge = new ChatbridgeHandler(this);
    database = new DatabaseHandler();
    deafs = new Temp();
    developerMode = false;
    interactions = new InteractionHandler();
    players = new Map();
    snipes = new SnipeHandler();
    constructor() {
		super(...arguments);

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
            console.error("Database:", error.message);
        });

        this.database.on("disconnected", () => {
            console.warn("I've lost connection to the database!");
        });
	}

    #import(directory, callback) {
        return new Promise((resolve, reject) => {
            readdir(directory, async (error, events) => {
                if (error) reject(error);
                let result = [];
                for (const event of events) {
                    if (extname(event)) {
                        result.push(await import(`.${directory}/${event}`).then(function(data) {
                            return [
                                directory.split("/").slice(2).concat(/^index\.js$/.test(event) ? '' : event.replace(extname(event), '')).map((event, index) => index > 0 ? event.replace(/^./, m => m.toUpperCase()) : event).join(""),
                                data
                            ]
                        }));
                    } else {
                        result.push(...await this.#import(`${directory}/${event}`));
                    }
                }

                result = new Map(result);
                if (typeof callback == 'function') {
                    callback(result);
                }

                resolve(result);
            });
        });
    }

    async login() {
        await this.#import("./events", events => {
            events.forEach((event, name) => {
                this.on(name, event.default);
            });
        });

        await this.#import("./interactions", events => {
            events.forEach((event, name) => {
                if ('data' in event.default) {
                    event.default.data.name = event.default.data.name ?? name.replace(/.*(?=[A-Z])/, '').toLowerCase();
                }

                if ('menus' in event.default) {
                    for (const menu in event.default.menus) {
                        event.default.menus[menu].name = event.default.menus[menu].name ?? name.replace(/.*(?=[A-Z])/, '').toLowerCase();
                    }
                }

                this.interactions.on(name, event.default);
            });
        });

        return super.login(...arguments);
    }

    setIdle(status = true) {
        if (!status) {
            setTimeout(() => this.user.setStatus("idle"), 6e4);
        }

        return this.user.setStatus(status ? "idle" : "online");
    }

    deployCommands() {
        return new Promise(async resolve => {
            let commands = this.application.commands;
            if (this.developerMode) {
                commands = this.guilds.cache.get("433783980345655306").commands;
            }

            const live = await commands.fetch();
            for (const command of live.values()) {
                if (!this.interactions.has(command.name, command.type != 1)) {
                    await command.delete();
                }
            }

            for (const { data, menus: { message, user } = {}} of this.interactions.values()) {
                // if (this.developerMode && data?.name != "avatar") continue;
                data && await commands.create(data);
                message && await commands.create(message);
                user && await commands.create(user);
            }

            resolve();
        });
    }
}