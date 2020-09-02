
module.exports = {
  name: "dashboard",
  alaises: ["panel"],
  description: "Opens the dashboard for the bot",
  syntax: "dashboard",
  enabled: true,
  execute(client, message, args) {
    message.channel.send("Here you go " + message.member.displayName + ": " + process.env.URL)
  }
}