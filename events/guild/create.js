export default async function(guild) {
    this.database.guilds.set(guild.id, {
        name: guild.name
    });
    console.log('I joined a new server!');
}