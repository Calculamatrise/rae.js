export default async function() {
    await this.application.fetch()

    console.log(`Logged in as ${this.user.tag}`);
    this.user.setPresence({
        status: "dnd",
        activities: [{
            name: "Rebooting due to changes..."
        }]
    });

    await this.deployCommands();

    console.log(`Ready when you are, ${this.application.owner.username}!`);
    this.user.setPresence({
        status: "idle",
        activities: [{
            name: "you",
            type: "LISTENING"
        }]
    });
}