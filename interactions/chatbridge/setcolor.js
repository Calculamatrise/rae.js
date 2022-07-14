export default {
    execute(interaction, options) {
        let color = options.getString("hex");
        if (color.match(/^#\w{6}$/g)) {
            return interaction.client.database.users.set(interaction.user.id, {
                chatbridge: {
                    color
                }
            }).then(function({ chatbridge }) {
                return {
                    content: `Successfully set your colour appearance to ${chatbridge.color}!`,
                    ephemeral: true
                }
            }).catch(function(error) {
                console.error("ChatBridge:", error.message);
            });
        }

        return {
            content: "Please choose a proper hexadecimal colour value!",
            ephemeral: true
        }
    }
}