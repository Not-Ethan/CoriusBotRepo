module.exports = {
  name: "kick",
  description: "Kick a user.",
  syntax: "kick <user>",
  aliases: [""],
  enabled: true,
  async execute(client, message, args) {
  if(!message.member.hasPermission("KICK_MEMBER")) {return message.channel.send(`${message.author}, you don't have permission to use this command!`)}
  if(!message.guild.me.hasPermission("KICK_MEMBER")) {return message.channel.send(`${message.author}, I don't have kick permissions!`)}
  let tokick = message.mentions.members.first()
  await tokick.kick().catch(`Could not kick ${tokick.displayName}.`)
  message.channel.send(`:white_check_mark:${tokick.displayName} was kicked! :point_right:`)
}
}