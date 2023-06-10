// require "canvas": "^2.11.2",

// import { createCanvas, loadImage } from "canvas";

// const canvas = createCanvas(800, 300);
// const ctx = canvas.getContext('2d');

// export default async function (member) {
// 	let { member_join_notification } = await this.database.guilds.get(member.guild.id);
// 	if (member_join_notification != null) {
// 		const channel = member.guild.channels.cache.get(member_join_notification) || await member.guild.channels.fetch(member_join_notification).catch(e => {
// 			this.database.guilds.update(member.guild.id, {
// 				member_join_notification: null
// 			});
// 		});
// 		if (!channel) return;
// 		// const avatar = await loadImage(member.user.displayAvatarURL({ format: 'jpg', size: 256 }).replace(/\.webp(\?.*)?$/, '.jpg?size=256'));
// 		// const banner = await loadImage(member.guild.banner || 'banner.png');
// 		// ctx.clearRect(0, 0, canvas.width, canvas.height);
// 		// avatar && ctx.drawImage(avatar, 40, canvas.height / 2 - 110, 220, 220);
// 		// banner && ctx.drawImage(banner, 0, 0, canvas.width, canvas.height);
// 		// ctx.fillStyle = 'white';
// 		// ctx.font = "bold 30px Arial";
// 		// ctx.fillText(member.user.username, 300, canvas.height / 2 - 16);
// 		// ctx.fillStyle = '#eee';
// 		// ctx.font = "20px Arial";
// 		// ctx.fillText(`Welcome to ${member.guild.name}!`, 300, canvas.height / 2 + 16);
// 		// await channel.send({
// 		// 	content: `**${member.user.tag}** just joined the server!`,
// 		// 	files: [{
// 		// 		attachment: canvas.toBuffer(),
// 		// 		name: 'welcome.png'
// 		// 	}]
// 		// });
// 	}
// }