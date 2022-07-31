import { execSync } from "child_process";

import discord from "discord.js";
import { inspect } from "util";
import paste from "paster.js";

import { client } from "../bootstrap.js";

export default {
    async execute(interaction, options, args) {
        const flags = new Set();
        const stdout = [];

        let str = args.map(({ value }) => value).join(" ").replace(/--[^s]*$/g, function(match) {
            match.split(/\s+/g).forEach(function(flag) {
                flags.add(flag);
            });
            return "";
        }).replace(/^`+(\w*)?(\s*)?|`+(\s*)?$/g, "");

        try {
            if (flags.has("exec")) {
                let result = execSync(str);
                return {
                    embeds: [{
                        color: interaction.member?.roles.cache.first()?.color || null,
                        fields: [{
                            name: "Result",
                            value: `\`\`\`js\n${result.toString()}\`\`\``,
                            inline: false
                        }, {
                            name: "Type",
                            value: `\`\`\`js\n${typeof result}\`\`\``,
                            inline: false
                        }]
                    }],
                    ephemeral: true
                }
            }

            let _inspect = flags.has("noins") ? (x => x) : inspect;
            console.out = function(...args) {
                return stdout.push(args.map(x => _inspect(x)).join(" ")) && undefined;
            }

            let evaled = await eval(`(async () => {${str}})()`);
            stdout.push(_inspect(evaled, {
                depth: 0
            }));

            if (!flags.has("noout")) {
                if (flags.has("paste") || stdout.join("\n").length >= 1024) {
                    return paste.create(stdout.join("\n")).then(function({ link }) {
                        return {
                            content: link,
                            ephemeral: true
                        }
                    });
                }

                return {
                    embeds: [{
                        color: interaction.member?.roles.cache.first()?.color || null,
                        fields: [{
                            name: "Result",
                            value: `\`\`\`js\n${stdout.join("\n")}\`\`\``,
                            inline: false
                        }, {
                            name: "Type",
                            value: `\`\`\`js\n${typeof evaled}\`\`\``,
                            inline: false
                        }]
                    }],
                    ephemeral: true
                }
            }
        } catch(error) {
            if (!flags.has("noerr")) {
                return {
                    embeds: [{
                        color: 13846582,
                        fields: [{
                            name: error.constructor.name,
                            value: `\`\`\`\n${error.message}\`\`\``,
                            inline: false
                        }]
                    }],
                    ephemeral: true
                }
            }
        }
    },
    data: {
        name: "eval",
        description: "Execute code on discord.",
        default_member_permissions: 0,
        options: [{
            name: "input",
            description: "Code you wish to execute",
            type: 3,
            required: true
        }],
    },
    menudata: {
        message: {
            name: "eval",
            default_member_permissions: 0,
            type: 3
        }
    },
    whitelist: new Set([
        "307360544468238336",
        "430418106972897282"
    ]),
    response: "Oh no! You can't use this command. It's specifically designed for testing purposes."
}