export default {
    execute(interaction) {
        if (!interaction.client.chatbridge.users.has(interaction.user.id)) {
            return {
                content: "You've already opted out of the chat bridge!",
                ephemeral: true
            }
        }

        return interaction.client.database.users.set(interaction.user.id, { chatbridge: { enabled: false }}).then(({ chatbridge }) => {
            interaction.client.chatbridge.users.delete(interaction.user.id);
            interaction.client.chatbridge.send(`${interaction.user.tag} has opted out of the chat bridge. Goodbye :(`);
            return {
                content: "You've successfully opted out!",
                ephemeral: true
            }
        }).catch(error => {
            console.error("ChatBridge:", error.message);
        });
    }
}