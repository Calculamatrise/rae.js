export default class {
    #guilds = new Map();
    get(guildId, userId) {
        let guild = this.#guilds.get(guildId);
        return (guild && guild.get(userId)) || null;
    }

    set(guildId, userId, data) {
        let guild = this.#guilds.get(guildId);
        if (!guild) {
            this.#guilds.set(guildId, guild = new Map());
        }

        return guild.set(userId, data);
    }

    delete(guildId, userId) {
        let guild = this.#guilds.get(guildId);
        return (guild && guild.delete(userId)) ?? false;
    }
}