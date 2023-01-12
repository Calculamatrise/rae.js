export default async function(event) {
    if (/^guild_join_request_update$/i.test(event.t)) {
        let guild = this.guilds.cache.get(event.d.guild_id);
        let member = guild.members.cache.get(event.d.request.user_id);
        member && this.emit(event.t.toLowerCase().replace(/([-_]\w)/g, group => group.toUpperCase().replace(/[-_]/g, '')), member);
    } else if (/^message_reaction_(add|remove)$/i.test(event.t)) {
        let channel = this.channels.cache.get(event.d.channel_id);
        let message = await channel.messages.fetch(event.d.message_id);
        let reaction = message.reactions.resolve(event.d.emoji.id || event.d.emoji.name);
        reaction && this.emit(event.t.toLowerCase().replace(/([-_]\w)/g, group => group.toUpperCase().replace(/[-_]/g, '')), reaction, this.users.cache.get(event.d.user_id), message.guild.members.cache.get(event.d.user_id) || await message.guild.members.fetch(event.d.user_id));
    }
}