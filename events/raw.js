export default async function(event) {
    if ((event.t || "").match(/^message_reaction_(add|remove)$/i)) {
        let channel = this.channels.cache.get(event.d.channel_id);
        if (channel) {
            channel.messages.fetch(event.d.message_id).then(message => {
                let reaction = message.reactions.resolve(event.d.emoji.id || event.d.emoji.name);
                if (reaction) {
                    this.emit(event.t.toLowerCase().replace(/([-_]\w)/g, group => group.toUpperCase().replace(/[-_]/g, '')), reaction, this.users.cache.get(event.d.user_id));
                }
            });
        }
    }
}