export default {
    execute(interaction) {
        if (interaction.client.chatbridge.users.has(interaction.user.id)) {
            return {
                content: "You've already been opted into the chat bridge!",
                ephemeral: true
            }
        }

        return interaction.client.database.users.set(interaction.user.id, { chatbridge: { enabled: true }}).then(function({ chatbridge }) {
            interaction.client.chatbridge.users.set(interaction.user.id, {
                color: chatbridge.color,
                messages: []
            });
            return {
                content: "You've successfully opted in! By sending a message to my DMs, you can communicate with other Discord users!",
                ephemeral: true
            }
        }).catch(function(error) {
            console.error("ChatBridge:", error.message);
        });
    }
}