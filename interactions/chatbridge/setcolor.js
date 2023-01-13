import Color from "../../utils/Color.js";

export default {
    execute(interaction, options) {
        let color = options.getString('hex').replace('#', '');
        if (/^#?(\w{3,4}|\w{6,8})$/.test(color)) {
            color = new Color(color);
            return interaction.client.database.users.set(interaction.user.id, {
                chatbridge: {
                    color: color.toHex()
                }
            }).then(function({ chatbridge }) {
                return {
                    content: `Successfully set your colour appearance to ${color.toHex()}!`,
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