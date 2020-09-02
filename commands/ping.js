const { MessageEmbed } = require("discord.js");
module.exports = {
	name: 'ping',
	description: "`ping` displays the ping of the bot.",
  enabled: true,
  syntax: "ping",
	execute(client, message, args) {
    const embed = new MessageEmbed()
    .setTitle(":ping_pong: Pong!")
    .addField("Bot's ping: ", `${client.ws.ping} ms`)
    .setAuthor(message.guild.me.displayName, null, process.env.url)
    .setFooter(`${message.guild.name} || ethan#1521`, message.guild.iconURL())
    message.channel.send(embed)
	},
};