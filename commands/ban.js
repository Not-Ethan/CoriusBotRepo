module.exports = {
  name: "ban",
  description: "Ban a user.",
  syntax: "ban <user>",
  aliases: [""],
  enabled: true,
  async execute(client, message, args) {
  if(!message.member.hasPermission("BAN_MEMBER")) {return message.channel.send(`${message.author}, you don't have permission to use this command!`)}
  if(!message.guild.me.hasPermission("BAN_MEMBER")) {return message.channel.send(`${message.author}, I don't have ban permissions!`)}
  let toban = message.mentions.members.first()
  await toban.ban().catch(`Could not ban ${toban.displayName}.`)
    message.channel.send(`:white_check_mark:${toban.displayName} was banned! :point_right:`)
}
}