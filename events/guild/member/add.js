export default async function(member) {
    const data = await this.database.guilds.get(member.guild.id);
    if (data.auto_role > 0) {
        member.roles.add(member.guild.roles.cache.get(data.auto_role) || await member.guild.roles.fetch(data.auto_role));
    }
}