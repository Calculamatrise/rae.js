export default async function() {
    await this.application.fetch();

    console.log(`Logged in as ${this.user.tag}`);
    this.user.presence.set({
        status: "dnd",
        activities: [{
            name: "Rebooting due to changes...",
            type: "CUSTOM"
        }]
    });

    await this.deployCommands();

    console.log(`Ready when you are, ${this.application.owner.username}!`);
    this.user.presence.set({
        status: "idle",
        activities: [{
            name: "you",
            type: "LISTENING"
        }]
    });
}