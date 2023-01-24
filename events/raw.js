export default async function(event) {
    if (!whitelistedEvents.includes(event.t)) return;
    const evt = event.t.toLowerCase().replace(/([-_]\w)/g, m => m.toUpperCase().replace(/[-_]/g, ''));
    const guild = event.d.guild_id && (this.guilds.cache.get(event.d.guild_id) || await this.guilds.fetch(event.d.guild_id));
    const channel = event.d.channel_id && (this.channels.cache.get(event.d.channel_id) || await this.channels.fetch(event.d.channel_id));
    const message = event.d.message_id && (channel.messages.cache.get(event.d.message_id) || await channel.messages.fetch(event.d.message_id));
    if (/^guild_join_request_update$/i.test(event.t)) {
        return this.emit(evt, guild.members.cache.get(event.d.request.user_id) || await guild.members.fetch(event.d.request.user_id));
    } else if (/^message_reaction_(add|remove)$/i.test(event.t) && !channel.messages.cache.has(event.d.message_id)) {
        return this.emit(evt, message.reactions.resolve(event.d.emoji.id || event.d.emoji.name), this.users.cache.get(event.d.user_id) || await this.users.fetch(event.d.user_id));
    }
}

let whitelistedEvents = [
    'GUILD_JOIN_REQUEST_UPDATE',
    'MESSAGE_REACTION_ADD',
    'MESSAGE_REACTION_REMOVE'
];