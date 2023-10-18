export default async function (member) {
	const entry = await this.database.guilds.get(member.guild.id);
	if (entry && entry.alerts.memberPart != null) {
		let channel = member.guild.channels.cache.get(entry.alerts.memberPart);
		if (!channel) {
			channel = await member.guild.channels.fetch(entry.alerts.memberPart).catch(() => {
				this.database.guilds.update(member.guild.id, {
					alerts: {
						memberPart: null
					}
				});
			});
			if (!channel) {
				return;
			}
		}

		channel && await channel.send(`**${member.user.tag}** just left the server.`);
	}
}