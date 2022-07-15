export default {
    async execute(interaction, options) {
        let time = options.getString("time");
        if (time.match(/\d{2}:\d{2}/gi)) {
            let date = new Date();
            let [ hour, minute ] = time.split(":");
            let [ hours, minutes ] = [date.getHours(), date.getMinutes()];
            if ((hour == 24 && minutes > 0)) {
                return {
                    content: `There's no such thing as ${time}, silly!`,
                    ephemeral: true
                }
            }

            let delta = ((hour - hours) * 60 + (minute - minutes)) * 6e4;
            if (delta > 0) {
                setTimeout(() => {
                    return interaction.user.send({
                        content: `**Reminder!**\n${options.getString("note")}`
                    }).then(function() {
                        return interaction.client.database.users.set(interaction.user.id, {
                            reminder: {
                                note: null,
                                time: 0
                            }
                        });
                    }).catch(function({ message }) {
                        console.error("SetReminderInteraction:", message);
                    });
                }, delta);
                await interaction.client.database.users.set(interaction.user.id, {
                    reminder: {
                        note: options.getString("note"),
                        time: options.getString("time")
                    }
                });
                return {
                    content: `Your reminder has been set! I'll shoot you a DM at ${hour}:${minute}`,
                    ephemeral: true
                }
            }

            return {
                content: `It's past ${time}! The current time is ${date.getHours()}:${date.getMinutes()}. Try again tomorrow.`,
                ephemeral: true
            }
        }

        return {
            content: "Please enter a proper time: 23:00 (11pm)",
            ephemeral: true
        }
    },
    data: {
        name: "setreminder",
        description: "Set a reminder for yourself! I'll spam you when the time comes.",
        options: [
            {
                name: "note",
                description: "What would you like me to remind you of?",
                type: 3,
                required: true
            },
            {
                name: "time",
                description: "When would you like me to remind you? (24 hour format)",
                type: 3,
                min_length: 4,
                max_length: 4,
                required: true
            }
        ]
    }
}