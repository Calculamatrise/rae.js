export default async function(guild) {
    await this.database.guilds.delete(guild.id).catch(console.error);
    console.log('I have been removed from a server :-(');
}