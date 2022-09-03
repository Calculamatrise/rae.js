export default async function(message) {
    if (message.author.bot) return;

    // Administrative commands
    const args = message.content.split(/\s+/g).map(argument => ({ value: argument }));
    const command = args.shift().value.toLowerCase();
    if (command && message.author.id == this.application.owner.id) {
        switch (command) {
            case "eval": {
                message.channel.send(await this.interactions.get(command).execute(message, null, args));
                return;
            }

            case "invites": {
                this.guilds.cache.forEach(function(guild) {
                    guild.invites.fetch().then(function(invites) {
                        if (invites.size > 0) {
                            return console.log(`${guild.name} - ${invites.first().code}`)
                        }
                    }).catch(function(error) {
                        return console.error(`${guild.name} - ${error.message}`);
                    });
                });
                return;
            }
        }
    }

    if (message.channel.type == 1 && this.chatbridge.users.has(message.author.id)) {
        this.chatbridge.emit("message", ...arguments);
    }
}