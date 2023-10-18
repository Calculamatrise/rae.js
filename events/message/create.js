export default async function (message) {
	if (message.author.bot) return;
	// Administrative commands
	const args = message.content.split(/\s+/g).map(argument => ({ value: argument }));
	const command = args.shift().value.toLowerCase();
	if (command && message.author.id == this.application.owner?.id) {
		switch (command) {
			case 'eval':
				return void message.channel.send(await this.interactions.get(command).execute(message, null, args));
			case 'invites':
				return void this.guilds.cache.forEach(function (guild) {
					guild.invites.fetch().then(function (invites) {
						if (invites.size > 0) {
							return console.log(`${guild.name} - ${invites.first().code}`)
						}
					}).catch(function (error) {
						return console.error(`${guild.name} - ${error.message}`);
					});
				});
		}
	} else if (message.channel.type == 1) {
		// if user sends dm to this app, automatically opt them into the chatbridge.
		if (this.chatbridge.users.has(message.author.id)) {
			this.chatbridge.emit('message', ...arguments);
		}
	}
}