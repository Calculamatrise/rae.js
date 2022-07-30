export default class {
    #guilds = new Map();
    get(guildId, userId) {
        let guild = this.#guilds.get(guildId);
        return guild && guild.get(userId) || null;
    }

    set(guildId, userId, data) {
        if (!this.#guilds.has(guildId)) {
            this.#guilds.set(guildId, new Map());
        }

        let guild = this.#guilds.get(guildId);
        return guild.set(userId, data);
    }

    delete(guildId, userId) {
        let guild = this.#guilds.get(guildId);
        return guild && guild.delete(userId);
    }
}