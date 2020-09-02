const {escapeMarkdown} = require("discord.js");

module.exports = {
	name: 'prefix',
	description: "Allows you to set the prefix.",
  enabled: true,
  syntax: "prefix [newPrefix]",
  aliases: [""],
	async execute(client, message, args) {
    if(!message.guild) return await message.channel.send(`Hi there ${message.author}! My prefix is **${escapeMarkdown(client.config.prefix)}**`);
    let guildConfig = client.settings.get(message.guild.id);
    let prefix = guildConfig.prefix;
    if(args.length == 0) {
      await message.channel.send(`Hi there ${message.author}! My prefix on **${escapeMarkdown(message.guild.name || "Direct Messages")}** is **${escapeMarkdown(prefix)}**`)
    }
    else {
      if(!message.member.permissions.has("MANAGE_GUILD", true)) return await message.reply(`You need to have the permission **Manage Server** to set the prefix!`);
      let newPrefix = args.join(" ");
      client.settings.set(message.guild.id, newPrefix, "prefix");
      await message.reply(`Okay, my prefix on **${escapeMarkdown(message.guild.name)}** was set to \`${newPrefix}\``)
    }
    
	},
};