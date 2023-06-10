export default async function (member) {
	let { member_leave_notification } = await this.database.guilds.get(member.guild.id);
	if (member_leave_notification != null) {
		const channel = member.guild.channels.cache.get(member_leave_notification) || await member.guild.channels.fetch(member_leave_notification).catch(e => {
			this.database.guilds.update(member.guild.id, {
				member_leave_notification: null
			});
		});
		channel && await channel.send(`**${member.user.tag}** just left the server.`);
	}
}