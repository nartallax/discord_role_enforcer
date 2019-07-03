(function(packageCode, modname, runEval, entryPoint, entryFunction, waitLoad, onPackageNotFound){
	var knownPackages = {
		require: function(name){
			return onPackageNotFound(name);
		}
	}

	var currentPackage = null;
	var define = function(reqs, fn){
		var pkgs = [];
		var result = null;
		for(var i = 0; i < reqs.length; i++){
			var r = modname.resolve(currentPackage, reqs[i]);
			if(r === "exports")
				pkgs.push(result = {});
			else if(!(r in knownPackages))
				pkgs.push(onPackageNotFound(r))
			else
				pkgs.push(knownPackages[r]);
		}
		fn.apply(null, pkgs);
		knownPackages[currentPackage] = result;
	}
	
	var run = function(){
		for(var i = 0; i < packageCode.length; i++){
			var pkgName = packageCode[i][0];
			var pkgCode = packageCode[i][1] + "\n//# sourceURL=" + pkgName;
			currentPackage = pkgName;
			runEval(pkgCode, define);
			currentPackage = null;
		}
		knownPackages[entryPoint][entryFunction]();
	}
	
	waitLoad = waitLoad || function(cb){ cb() };
	waitLoad(run);
})([["main","define([\"require\", \"exports\", \"fs\", \"path\", \"discord.js\"], function (require, exports, fs, path, Discord) {\n    \"use strict\";\n    Object.defineProperty(exports, \"__esModule\", { value: true });\n    async function main() {\n        let config = JSON.parse(fs.readFileSync(path.resolve(__dirname, \"./config.json\"), \"utf8\"));\n        let memberRoleMap = new Map();\n        Object.keys(config.roles).forEach(roleId => {\n            config.roles[roleId].forEach((userId) => {\n                let arr = memberRoleMap.get(userId);\n                if (!arr) {\n                    memberRoleMap.set(userId, arr = []);\n                }\n                arr.push(roleId);\n            });\n        });\n        let botToken = fs.readFileSync(path.resolve(__dirname, config.botTokenFile), \"utf8\").trim();\n        let targetGuildId = fs.readFileSync(path.resolve(__dirname, config.guildIdFile), \"utf8\").trim();\n        let discordBot = new Discord.Client();\n        discordBot.on(\"error\", err => {\n            console.error(\"Discord client lib failed: \", err.stack);\n        });\n        let checkMember = (member) => {\n            let existingRoles = new Set(member.roles.map(_ => _.id));\n            (memberRoleMap.get(member.id) || []).forEach(async (roleId) => {\n                if (!existingRoles.has(roleId)) {\n                    try {\n                        await member.addRole(roleId);\n                        console.error(\"Added role \" + roleId + \" to user \" + member.id);\n                    }\n                    catch (e) {\n                        console.error(\"Failed to add role \" + roleId + \" to user \" + member.id + \": \" + e.stack);\n                    }\n                }\n            });\n        };\n        discordBot.on(\"guildMemberAdd\", member => {\n            if (member.guild.id === targetGuildId) {\n                checkMember(member);\n            }\n        });\n        await discordBot.login(botToken);\n        discordBot.guilds.forEach(guild => {\n            if (guild.id === targetGuildId) {\n                guild.members.forEach(checkMember);\n            }\n        });\n    }\n    exports.main = main;\n});\n"]],{
"dirname":function(name){
	return name.replace(/\/?[^\/]+$/, "");
},
"join":function(){
	var result = [];
	for(var i = 0; i < arguments.length; i++){
		var x = arguments[i];
		(i === 0) || (x = x.replace(/^\//, ""));
		(i === arguments.length - 1) || (x = x.replace(/\/$/, ""));
		x && result.push(x);
	}
	return this.normalize(result.join("/"));
},
"normalize":function(name){
	var x = name, xx;
	while(true){
		xx = x.replace(/[^\/]+\/\.\.\//g, "");
		if(xx.length === x.length)
			break;
		x = xx;
	}
	while(true){
		xx = x.replace(/\.\//g, "");
		if(xx.length === x.length)
			break;
		x = xx;
	}
	return x;
},
"resolve":function(base, name){
	return name.charAt(0) !== "."? name: this.join(this.dirname(base), name)
}
},function(code, define){ return eval(code) },"main","main", null, function(r){
	return require(r);
})
