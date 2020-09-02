const { MessageEmbed, escapeMarkdown } = require("discord.js");
module.exports = {
  name: "help",
  description:
    "A list of all the commands in this bot! Use `help` [command] for info on a command.",
  syntax: "help [command]",
  enabled: true,
  aliases: [""],
  async execute(client, message, args) {
    let guildConfig = {
      prefix: client.config.prefix
    };
    if(message.guild) guildConfig = client.settings.get(message.guild.id);
    let prefix = guildConfig.prefix || client.config.prefix;
    
    let owners = [];
    client.config.owners.map(x=>{
      let owner = client.users.cache.get(x);
      if(!owner) return
      owners.push(owner.tag);
    })
    
    const embed = new MessageEmbed()
    if(!message.guild) {
        embed.setAuthor(client.user.username, null, process.env.url)
        .setFooter(
          `${message.author.tag} || ${owners.join(" & ")}`,
          message.author.avatarURL());
    }
    else {
      embed.setAuthor(message.guild.me.displayName, null, process.env.url)
        .setFooter(
          `${message.guild.name} || ${owners.join(" & ")}`,
          message.guild.iconURL());
    }

    const commands = client.commands; 

    if (args[0]){
      const name = args[0].toLowerCase();
      const command = commands.get(name) || client.commands.find(cmd=>cmd.aliases && cmd.aliases.includes(name));
      if(!command) return message.reply(`The \`${name}\` command doesn't exist.`);
      embed
        .setTitle(`Help page for the \`${command.name}\` command.`)
        .setDescription(`
Syntax: \`${client.config.prefix}${command.syntax ? command.syntax : command.name}\`
Description: ${command.description}\

`)
   
    }
    
   else {
      embed
        .setTitle("Help")
        .setDescription(`
A list of all the commands available to the bot. Specify a command for more info on that command command. 
The prefix is **\`${prefix}\`**.`);
      commands.mapValues(command => {
        if(command.hidden) return;
        embed.addField(command.name, command.description);
      });
    }
    await message.channel.send(embed);
  }
};
