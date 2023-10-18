export default async function (message, edit) {
	if (message.channel.type == 1) {
		this.chatbridge.emit('messageUpdate', ...arguments);
	}

	this.snipes.set('edit', message.channel.id, {
		executor: message.author,
		message
	});
}