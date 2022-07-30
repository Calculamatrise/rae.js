export default async function(member) {
    if (!member.pending) {
        let { auto_role } = await this.database.guilds.get(member.guild.id);
        if (auto_role > 0) {
            member.roles.add(auto_role);
        }
    }
}