
const fetch = require("node-fetch")
const Discord = require("discord.js")
const embed = new Discord.MessageEmbed();
module.exports = {
  name: "searchr",
  description: "Search a subreddit for posts!",
  aliases: ["reddit"],
  syntax: "searchr <subreddit> [sort]",
  enabled: true,
  execute(client, message, args) {
    let sub = args.slice(0, 1);
      if (sub[0].startsWith('r/')) {
        sub = sub[0].replace('r/', '')
      }
      let sort = args.slice(1, 2)[0]
      if (sort != undefined)sort = sort.toLowerCase();
      console.log(sub, sort)
      if (
        sort != "best" ||
        sort != "hot" ||
        sort != "rising" ||
        sort != "new" ||
        sort != "top"
      ) {
        sort = "hot";
      }
      fetch(`https://api.reddit.com/r/${sub[0]}/${sort}/.json?limit=50`)
        .then(response => response.json())
        .then(response => {
        console.log(response)
          let post = Math.floor(Math.random() * 50);
          let data = response.data.children[post].data;
          if (!data) {
            post = Math.floor(Math.random() * 50);
            data = response.data.children[post].data;
          }
          if (data.is_video == true) {
            while (data.is_video == true) {
              post = Math.floor(Math.random() * 51);
              data = response.data.children[post].data;
            }
          }
          /*if (data.is_video == true) {embed.addField("Video", `${data.media.reddit_video.dash_url}`)async function h() {let data = await 
  response.data.children[post+1].data; print(data)}*/
          embed.setTitle(`r/${data.subreddit} - ${data.title}`);
          embed
            .setURL("https://reddit.com" + data.permalink)
            .setAuthor(
              data.author,
              null,
              "https://www.reddit.com/user/" + data.author + "/"
            ).setFooter(`Upvotes | ${data.ups}`)
          if (data.selftext != "") {
            embed.addField("Text", `${data.selftext}`);
          }
          if (data.url.startsWith("https://www.youtube.com")) {
            return message.channel
              .send(embed)
              .then(message.channel.send(data.url));
          }

          if (
            data.url.endsWith(".jpg") ||
            data.url.endsWith(".png") ||
            data.url.endsWith(".jpg") ||
            data.url.endsWith(".jpeg")
          ) {
            embed.setImage(`${data.url}`);
          }
          if (data.url.startsWith("https://imgur.com")) {return message.channel.send(embed); message.channel.send(data.url)} 
        message.channel.send(embed);
        });
  }
}