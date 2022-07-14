import Queue from "../utils/Queue.js";

export default class {
    /**
     * @protected
     */
    cache = new Map();
    create(interaction) {
        const queue = this.cache.get(interaction.guildId);
        if (queue) {
            if (queue.interaction.replied) {
                queue.interaction.editReply({ components: [] }).catch(function(error) {
                    console.error(`QueueManager: ${error.message}`);
                });
            }

            return queue.interaction = interaction, queue;
        }

        this.cache.set(interaction.guildId, new Queue(interaction));

        return this.cache.get(interaction.guildId);
    }
}