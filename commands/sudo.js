async function j(j) {
  if(j.id =="402639792552017920") {
     return null
     } else
       {
         return "Sudo by: " + j.username + j.discriminator
       }
}
module.exports = {
  name: "sudo",
  description: "Forces a user to say something",
  enabled: true,
  syntax: "sudo <user> [channel] <message>",
  aliases: ["forcesay"],
  async execute(client, message, args) { 
    const { prefix } = client.config;
    if (!message.member.hasPermission("MANAGE_MESSAGES"))
      return message.channel.send(
        `${message.author}, you don't have permission to use this command!`
      );
     if(!args) return message.reply(`Missing arguments. Use ${prefix}help for more info on how to use commands.`)
      let toSudoUser = message.mentions.users.first();
      if (!toSudoUser) {
          if (!isNaN(parseInt(args[0], 10))) {
            let idLookup = client.users.cache.get(args[0]);
            if(!idLookup) return message.reply(`No user was specified. Use ${prefix}help for more info on how to use commands.`)
            toSudoUser = idLookup;
          }
          else if(args[0].match(/^((.+?)#\d{4})/i)) {
            let tagLookup = client.users.cache.find(u=>u.tag === args[0]);
            if(!tagLookup) return message.reply(`No user was specified. Use ${prefix}help for more info on how to use commands.`)
            toSudoUser = tagLookup;

          }
          else return message.channel.send(`No user was specified. Use ${prefix}help for more info on how to use commands.`)
      }
      let id = args.slice(1,2)
      let tochannelarg = args.slice(1, 2);
      let tochannelid = tochannelarg.join(" ").replace(/[\\<>@#&!]/g, "");
      let tochannel = message.guild.channels.cache.find(ch => ch.id == tochannelid);
      let msg = args.slice(2).join(" ");
      let newAvatar = toSudoUser.avatarURL();
      if (tochannel == null) {
        tochannel = message.channel;
        msg = args.slice(1).join(" ");
      }
      let hook = await tochannel.createWebhook(toSudoUser.username, {avatar: newAvatar});
      message.delete({timeout: 0, reason: j(message.author)});
      await hook.send(msg, {
        disableMentions: "everyone",
        split: true
      });
      hook.delete(1000);
  }
};
