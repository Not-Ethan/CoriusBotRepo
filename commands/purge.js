module.exports={
  name: "purge",
  aliases: ["clear"],
  description: "clear a number of messages from the channel",
  syntax: "purge <number of messages>",
  enabled: true,
  async execute(client, message, args) {
    args = message.content.split(" ").slice(1);
    let amount = args.join(" ");
    if (!amount) return message.channel.send("No amount given.", 2);
    if (amount > 100) {
      return message.channel.send("Number too high!", 2);
    }
    if (amount < 1) {
      return message.channel.send("You need to delete at least one message", 2);
    }
    let channel = message.channel;
    message.delete()
    channel.bulkDelete(amount).then(async msgs => {
      let msga = await message.channel.send(":white_check_mark: Deleted " + amount + " messages.", 3)
      msga.delete({timeout: 1000, reason: `Purge by ${message.author}`});
    });
  }
}