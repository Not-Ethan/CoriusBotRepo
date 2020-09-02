const EventEmitter = require("events")
module.exports = {
  name: "rps",
  description: "Play rock paper scissors against another user or the bot.",
  enabled: true,
  syntax: "rps <user> [choice (only fill if playing with bot)]",
  aliases: [""],
  async execute(client, message, args) {
    const emitter = new EventEmitter();
      emitter.on("ans1", () => {
        if (ans1 != "" && ans2 != "") {
          compare(ans1, ans2);
        }
      });
      emitter.on("ans2", () => {
        if (ans1 != "" && ans2 != "") {
          compare(ans1, ans2);
        }
      });
      const cycle = { rock: "paper", paper: "scissors", scissors: "rock" };
      let ans1 = "";
      let ans2 = "";
      const channel = message.channel;
      let user = message.mentions.members.first();
          if (!user) {
        return message.channel.send("No user specified, ping the bot if you want to play against the computer");
      }
    if (user.presence.status == "offline") {
      return message.channel.send(`${user.displayName} isn't online right now. Maybe play with them later?`)
    }
      if (user.id == message.author.id) {
        return message.channel.send("You can't play by yourself!");
      }
      if (user.id==client.user.id) {
        let choice = args.slice(1,2)
        choice = choice[0].toLowerCase()
        if (!choice || !cycle.hasOwnProperty(choice)) {
          return message.channel.send(`You will need to make a valid choice ${message.author}!`)
        }
        let a = Math.floor(Math.random() * 3)
        let mychoice;
        if (a==0) {
          mychoice="rock"
        }if (a==1) {
          mychoice="paper"
        }if (a==2) {
          mychoice="scissors"
        }
        if (choice == mychoice) {
          message.channel.send(`You chose **${choice}**, I chose **${mychoice}**, its a draw!`)
          return
        }
        if (cycle[mychoice] == choice) {
          return message.channel.send(`${message.author}, you chose **${choice}**, I chose **${mychoice}**, you win!`)
        } else {
          return message.channel.send(`${message.author}, you chose **${choice}**, I chose **${mychoice}**, I win!`)
        }
      }
      let user1 = await message.author.send("Rock, paper, or scissors?").catch(err => console.log(err));
      let user2 = await user.send("Rock, paper, or scissors").catch(err => console.log(err));
      const filter = m =>
        m.content.toLowerCase() == "rock" ||
        m.content.toLowerCase() == "scissors" ||
        m.content.toLowerCase() == "paper";
      let a = await user1.channel.createMessageCollector(filter, {
        time: 60000,
        limit: 1
      });
      a.on("collect", m => {
        ans1 = m.content;
        emitter.emit("ans1");
      });
      a.on("end", collected => {
        if (collected.size == 0) {
          return channel.send(`No reply from ${message.author}.`);
        }
      });
      let b = await user2.channel.createMessageCollector(filter, {
        time: 60000,
        limit: 1
      });
      b.on("collect", m => {
        ans2 = m.content;
        emitter.emit("ans2");
      });
      b.on("end", collected => {
        if (collected.size == 0) {
          return channel.send(`No reply from ${user}.`);
        }
      });
      function compare(x, y) {
        if (x != "" && y != "") {
          if (x == y) {
           return channel.send("It's a draw!");
          } else {
            if (cycle[x] == y) {
              message.channel.send(`${user} has won!`);
              return;
            } else {
              channel.send(`${message.author} has won!`);
              return;
            }
          }
        }
      }
  }
}