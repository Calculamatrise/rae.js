export default async function(message) {
    if (message.author.bot) return;
    if (message.channel.type == "DM" && this.chatbridge.users.has(message.author.id)) {
        let author = this.chatbridge.users.get(message.author.id);
        let referenceMessage = message.reference && (message.channel.messages.cache.get(message.reference.messageId) || await message.channel.messages.fetch(message.reference.messageId).catch(function(error) {
            console.error("ChatBridge", error.message);
        }));
        if (referenceMessage && (referenceMessage.content.length > 0 || referenceMessage.embeds[0]?.description.length > 0)) {
            referenceMessage = `> ${referenceMessage.content || referenceMessage.embeds[0].description.replace(/^>.*\n/gi, "")}\n${message.content}`;
        } else {
            referenceMessage = false;
        }

        if (this.chatbridge.messages.size > 15) this.chatbridge.messages.delete(Array.from(this.chatbridge.messages.keys()).shift());
        this.chatbridge.users.forEach(async (data, user) => {
            if (message.author.id == user) return;
            user = this.users.cache.get(user) || await this.users.fetch(user);
            user.send({
                embeds: [{
                    author: {
                        name: message.author.username,
                        iconURL: message.author.displayAvatarURL()
                    },
                    color: author.color || null,
                    description: referenceMessage || message.content,
                    footer: {
                        text: message.author.tag,
                    },
                    image: {
                        url: message.attachments.first()?.proxyURL || null
                    },
                    timestamp: Date.now()
                }]
            }).then((last) => {
                let data = this.chatbridge.messages.get(message.id) || {
                    author: message.author.id,
                    messages: []
                }
                data.messages.push(last);
                this.chatbridge.messages.set(message.id, data);
            }).catch(function(error) {
                console.error("ChatBridge:", error.message);
            });
        });
    } else if (message.channel.type != "DM" && message.channel.name.match(/^temp-(chat|no-mic|muted)$/gi)) {
        setTimeout(() => {
            message.delete().catch(function(error) {
                console.error(`TempChannel: ${error.message}`);
            });;
        }, 6e4);
    }

    // Administrative commands
    const args = message.content.split(/\s+/g).map(argument => ({ value: argument }));
    const command = args.shift().value.toLowerCase();
    if (command && message.author.id == this.application.owner.id) {
        switch (command) {
            case "eval":
                message.channel.send(await this.interactions.get(command).execute(message, null, args));
                break;

            case "invites":
                this.guilds.cache.forEach(function(guild) {
                    guild.invites.fetch().then(function(invites) {
                        if (invites.size > 0) {
                            return console.log(`${guild.name} - ${invites.first().code}`)
                        }
                    }).catch(function(error) {
                        return console.error(`${guild.name} - ${error.message}`);
                    });
                });
                break;
        }
    }
}