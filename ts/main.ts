import * as fs from "fs";
import * as path from "path";
import * as Discord from "discord.js";

export async function main(){
	let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, "./config.json"), "utf8"));
	let memberRoleMap = new Map<string, string[]>();
	Object.keys(config.roles).forEach(roleId => {
		config.roles[roleId].forEach((userId: string) => {
			let arr = memberRoleMap.get(userId)
			if(!arr){
				memberRoleMap.set(userId, arr = []);
			}
			arr.push(roleId);
		})
	})

	let botToken = fs.readFileSync(path.resolve(__dirname, config.botTokenFile), "utf8").trim();
	let targetGuildId = fs.readFileSync(path.resolve(__dirname, config.guildIdFile), "utf8").trim();
	let discordBot = new Discord.Client();
	discordBot.on("error", err => {
		console.error("Discord client lib failed: ", err.stack);
	});

	let checkMember = (member: Discord.GuildMember) => {
		let existingRoles = new Set(member.roles.map(_ => _.id));
		(memberRoleMap.get(member.id) || []).forEach(async roleId => {
			if(!existingRoles.has(roleId)){
				try {
					await member.addRole(roleId);
					console.error("Added role " + roleId + " to user " + member.id);
				} catch(e){
					console.error("Failed to add role " + roleId + " to user " + member.id + ": " + e.stack);
				}
			}
			
		});
	}
	

	discordBot.on("guildMemberAdd", member => {
		if(member.guild.id === targetGuildId){
			checkMember(member);
		}
	});

	await discordBot.login(botToken);

	discordBot.guilds.forEach(guild => {
		if(guild.id === targetGuildId){
			guild.members.forEach(checkMember)
		}
	});
}
