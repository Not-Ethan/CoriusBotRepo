const _ = require("lodash");
const Discord = require("discord.js");
const config = require("./config.json");
const path = require("path")
const axios = require("axios").default;
const fs = require('fs-extra');
const Enmap = require("enmap");
const parser = require("discord-command-parser");
const vpnCheck = require("./helpers/checkVPN");
const XPManager = require("./managers/XPManager");

const client = new Discord.Client();
client.login(process.env.TOKEN)
client.config = config;
client.commands = new Discord.Collection();
client.settings = new Enmap("settings");
client.verifications = new Enmap("verifications");
client.verifiedUsers = new Enmap("verifiedUsers");
client.xp = new XPManager("xp");

const defaultSettingsConfig = {
  prefix: ".",
  welcome: `Hi there {{user}}, welcome too {{guild}}`,
  welcomeChannel: "welcome",
  bye: "",
  commands: [],
  verification: {
    enabled: true,
    blockVPN: true,
    nonInvisibleCaptcha: false,
    automaticallyKickUsers: 0,
    channel: "",
    role: ""
  }
  
};
client.verifications.generateCode = () => {
  let code = "";
  let arr = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ".split('');
  for(let i = 0; i<=12; i++) {
    let j = Math.floor(Math.random() * arr.length);
    let char = arr[j];
    code += char;
  }
  return code;
}

const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));
for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	client.commands.set(command.name, command);
}
function print(x) {console.log(x)}

client.on("guildCreate", async guild =>{
  await client.settings.defer;
  client.settings.ensure(guild.id, defaultSettingsConfig);
});

client.on('message', async message => {
  await client.settings.defer;
  if(message.guild) client.settings.ensure(message.guild.id, defaultSettingsConfig);
  let guildConfig = {
      prefix: client.config.prefix
  };
  if(message.guild) guildConfig = client.settings.get(message.guild.id);
  let prefix = guildConfig.prefix || client.config.prefix;
  /*
	if (!message.content.startsWith(prefix) || message.author.bot == true) return;
	const args = message.content.slice(prefix.length).split(/ +/)
	const command = args.shift().toLowerCase();
  */
  if(message.content.trim() === `<@!${client.user.id}>`) return await message.channel.send(`Hi there ${message.author}! My prefix is **${Discord.escapeMarkdown(prefix)}**`);
  const parsed = parser.parse(message, [prefix, `<@!${client.user.id}> `], {
    allowBots: false,
    allowSelf: false,
    //allowSpaceBeforeCommand: false,
    ignorePrefixCase: false
  });
  if(!parsed.success) return;
  let { command } = parsed;
  let args = parsed.arguments;
  let cmd = client.commands.get(command) || client.commands.find(cmd=>cmd.aliases.includes(command));
	if (!cmd) return;
  if (cmd.enabled == false) {return message.channel.send(`Sorry but the \
${cmd.name} command is disabled on ${message.guild}! If you have any questions please contact the moderation team.`)
.then(message =>message.delete({timeout: 3000}))
}
  if (cmd.args==true && !args) {return message.channel.send(`${command.name} needs arguments ${message.author}!`)}
try {
	cmd.execute(client, message, args);
} catch (error) {
	console.error(error);
	message.reply('there was an error trying to execute that command!');
}})



client.on("guildMemberAdd", async member=>{
  if(member.user.bot) return;
  const key = `${member.guild.id}-${member.id}`;
	await client.xp.defer;
	client.xp.ensure(key, {
		user: member.id,
		guild: member.guild.id,
		xp: 0,
		level: 0,
		allMessages: 0,
		countedMessages: 0,
	});
  const guild = member.guild;
  client.settings.ensure(guild.id, defaultSettingsConfig);
  const settings = client.settings.get(guild.id);
  if(settings.verification.enabled) {
    let role = guild.roles.cache.get(settings.verification.role);
    let channel = guild.channels.cache.get(settings.verification.channel);
    if(!role) {
      console.log(`${guild} => no verify role, making one`)
      role = await guild.roles.create({
        data: {
          name: "Unverified",
          color: "#696969",
          permissions: 0
        },
        reason: "Verification"
      });
      client.settings.set(guild.id, role.id, "verification.role");
      guild.channels.cache.map(c=>{
        c.updateOverwrite(role, {
          "VIEW_CHANNEL": false
        }, "Unverified");
      });
    }
    if(!channel) {
      channel = await guild.channels.create("verification", {
        type: "text",
        permissionOverwrites: [
          {
            id: guild.id,
            allow: [],
            deny: ["VIEW_CHANNEL"],
            type: "role"
          },
          {
            id: role.id,
            allow: ["VIEW_CHANNEL"],
            deny: [],
            type: "role"
          },
          {
            id: client.user.id,
            allow: ["VIEW_CHANNEL", "SEND_MESSAGES"],
            deny: [],
            type: "member"
          }
        ],
        reason: "Verification"
      });
      client.settings.set(guild.id, channel.id, "verification.channel");
    }
    let code = client.verifications.generateCode();
    if(client.verifications.has(code)) {
      while(client.verifications.has(code)) {
        code = client.verifications.generateCode();
        print("New code: "+code)
      }
    }
    client.verifications.set(code, {
      guild: guild.id,
      member: member.id,
      sent: Date.now(),
      blockVPN: settings.verification.blockVPN,
      nonInvisibleCaptcha: settings.verification.nonInvisibleCaptcha
    });
    let verifyURL = `${process.env.url}/verify/${code}`;
    member.roles.add(role);
    await member.user.send(`To access the **${Discord.escapeMarkdown(guild.name)}** server, Please complete a security check through the link below. Thank you!\n${verifyURL}`).catch(async ()=>{
      await channel.send(`Hey ${member}, **click the link below to verify you are not a robot**\n${verifyURL}`);
    });
    await channel.send(`Hey, ${member}, **check your DMs to gain access to the server.**`);
  }
  let message =  settings.welcome
  let channelName = settings.welcomeChannel
  let channel = member.guild.channels.get(ch=>ch.name==channelName)
  if(!channel) {
    channel = member.guild.channels.create(channelName, {
      type: "text",
      topic: `Welcome to ${guild.name}`,
      reason: "Welcome channel not found.",
      permissionOverwrites: [
        {
          id: member.guild.id,
          allow: ["VIEW_CHANNEL"],
          deny: ["SEND_MESSAGES"]
        }
      ]
    })
  }
  message += await message.replace("{{user}}", member.user.tag)
  message += await message.replace("{{guild}}", member.guild.name)
  channel.send(message)
});

client.on("message", async message => {
	if (message.partial) message = await message.fetch();
	if (message.author.bot || !message.guild) return;
	await client.xp.defer;
	const key = `${message.guild.id}-${message.author.id}`;
	client.xp.ensure(key, {
		user: message.author.id,
		guild: message.guild.id,
		xp: 0,
		level: 0,
		allMessages: 0,
		countedMessages: 0,
	});
	client.xp.inc(key, "allMessages");
	let guildCooldown = client.xp.cooldown.get(message.guild.id);
	if (!guildCooldown) client.xp.cooldown.set(message.guild.id, new Set());
	guildCooldown = client.xp.cooldown.get(message.guild.id);
	if(guildCooldown.has(message.author.id)) return;
	if((message.content.trim().split(/ +/g).length < 2 && message.content.length <= 10) && message.content.length <= 25) return;
	guildCooldown.add(message.author.id);
	setTimeout(() => {
		guildCooldown.delete(message.author.id);
	}, _.random(60000, 70000, false));

	let xpEarned = _.random(15, 25, false);
	client.xp.math(key, "+", xpEarned, "xp");
	client.xp.inc(key, "countedMessages");
	//const curLevel = Math.floor(0.1 * Math.sqrt(client.xp.get(key, "xp")));
	const curLevel = client.xp.getLevelFromXP(client.xp.get(key, "xp"));
	if (client.xp.get(key, "level") != curLevel) {
		await message.reply(`You've hit level **${curLevel}**!`);
		client.xp.set(key, curLevel, "level");
	}
});


client.on('ready', () => {
  console.log('ready')
  client.user.setStatus({status: "online",activity: {name:"For @me help", url: process.env.url, type: "WATCHING"}})
})


const passport = require("passport");
const discordStrategy = require("passport-discord.js").Strategy;
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const session = require('express-session');
const helmet = require("helmet");
const refresh = require('passport-oauth2-refresh');

app.set("view engine", "ejs");



app.use(cookieParser(process.env.SESSION_SECRET));
app.use(express.static('public'));
app.use(bodyParser.json());
app.use(helmet());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(session({
  key: process.env.SESSION_KEY,
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
 // cookie: {
  //  secure: true
  //}
}));

app.use(passport.initialize());
app.use(passport.session());


const Strategy = new discordStrategy({
  clientID: process.env.DISCORD_ID,
  clientSecret: process.env.DISCORD_SECRET,
  callbackURL: "https://corius.glitch.me/auth/discord/callback",
  scope: ["guilds", "connections", "identify", "email"]
}, function(accesstoken, refreshToken, profile, done) {
  //console.log(profile)
  return done(null, profile);
});

passport.use(Strategy);
refresh.use(Strategy);

passport.serializeUser(function(u, d) {
  if(u.avatar.startsWith("a_")) u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.gif`;
  else u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`;
  d(null, u);
});
passport.deserializeUser(function(u, d) {
  if(u.avatar.startsWith("a_")) u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.gif`;
  else u.avatarURL = `https://cdn.discordapp.com/avatars/${u.id}/${u.avatar}.png`;
  d(null, u);
});


app.get('/login', passport.authenticate('discord.js'));

app.get('/auth/discord/callback', passport.authenticate('discord.js', { failureRedirect: '/' }), function(req, res) {
  req.session.user = req.user;
  req.session.save();
  //console.log(req.user);
  //console.log(req.query);
  return res.redirect('/servers');
});

app.get("/logout", (req, res) => {
  req.session.destroy();
  req.user = undefined;
  req.logout();
  res.redirect("/");
})


app.get("/", (req, res) => {
  if(req.session.user) return res.render("index", {user: req.session.user});
  else return res.render("index", {user: null});
});

app.get("/servers", async (req, res) => {
    if (!req.session.user) return res.redirect('/login');
    let all = req.session.user.guilds;
    let hasPerms = [];
    await Promise.all(all.map(async ({id, name, icon, permissions, owner}) => {
        let server = {
          id: id,
          name: name,
          icon: icon,
          permissions: permissions,
          owner: owner
        };
        let perms = new Discord.Permissions(permissions);
        if(!perms.has("MANAGE_GUILD", true) && !owner) return;
        let iconURL;
        if (!icon) iconURL = "https://discordapp.com/assets/1cbd08c76f8af6dddce02c5138971129.png";
        else if(icon.startsWith("a_")) iconURL = `https://cdn.discordapp.com/icons/${id}/${icon}.gif`;
        else iconURL = `https://cdn.discordapp.com/icons/${id}/${icon}.png`;
        server.iconURL = iconURL;
        
        server.hasBot = await client.guilds.cache.has(id);
      
        hasPerms.push(server);
    }));
    hasPerms = _.orderBy(hasPerms, [x=>x.hasBot, x=>x.name.toLowerCase()], ['desc', 'asc']);
    return res.render("servers", { 
      user: req.session.user, 
      servers: hasPerms
    });
});
app.get("/dashboard", (req, res) => {
  return res.redirect("servers")
})
app.get("/dashboard/:server", (req, res)=>{
  //print(req)
  if (!req.session.user) return res.redirect('/login');
  let server = client.guilds.cache.get(req.params.server)
  if(!server) {return res.redirect("/servers")}
  let user = server.members.cache.get(req.session.user.id)
  if(!user.hasPermission("MANAGE_SERVER")) {return res.redirect("/servers")}
  res.render("dashboard/home", {user: req.session.user, server: server, gconfig: client.settings.get(req.params.server)})
})
app.get("/dashboard/:server/customcommand", (req, res)=> {
  if (!req.session.user) return res.redirect('/login');
  let server = client.guilds.cache.get(req.params.server);
  let user = req.session.user;
  let config = client.settings.get(req.params.server);
  let commands = config.commands;
  res.render("dashboard/customcommand", {user: user, commands: commands, server: server, config: config})
})
app.post("/dashboard/:server/customcommand", (req, res)=>{
  const cmd = req.body;
  console.log(cmd)
  const base = {
  name: "",
  description: "",
  args: [""],
  dm: false,
  server: "",
  response: ``,
  silent: "",
  roles: null,
  custom: true,
  delTimeout: -1,
  disChannels: [""],
};
  
  /*
  cmd.execute = (client, message, args)=> {
  if (this.roles) { message.author.addRoles(this.roles)
    }
    if (this.disChannels.includes(message.channel)) {
      return message.author.send("You can't use this command here.")
    }
    if (this.delTimeout > -1) {
      let delTimeout = this.delTimeout * 1000
      message.delete(delTimeout)
    }
    if (args.length < this.args) {return message.channel.send(`${this.name} needs arguments, ${message.author}!`)}
    let response = this.response.split(" ")
    
    
    if (this.dm==true && this.silent==false) {message.author.send(this.response)}
    else {if(this.silent==false) message.channel.send(this.response)}
  }
  */
})
app.get("/dashboard/:server/guildconfig", (req, res) => {
  if (!req.session.user) return res.redirect('/login');
  let server = client.guilds.cache.get(req.params.server);
  let user = req.session.user;
  let config = client.settings.get(req.params.server);
  let commands = config.commands;
  res.render("dashboard/guildconfig", {user: user, commands: commands, server: server, config: config})
});
app.post("/dashboard/:server/guildconfig", (req, res)=>{
  
})
app.get("/verify/:code", async(req, res) => {
  let code = req.params.code;
  const ip = req.get("CF-Connecting-IP") || req.get("X-FORWARDED-FOR").split(",")[0] || req.ip;
  await client.verifications.defer;
  await client.verifiedUsers.defer;
  await client.settings.defer;
  if(!client.verifications.has(code)) return res.render("verify", {
    code: code,
    status: "invalid"
  });
  
  let verification = client.verifications.get(code);
  let settings = client.settings.get(verification.guild);
  let guild = client.guilds.cache.get(verification.guild);
  
  if(settings.verification.blockVPN) { 

    if(await vpnCheck(ip)) return res.render("verify", {
      code: code,
      status: "blocked"
    });
  }
  
  client.verifiedUsers.ensure(verification.member, {ips: []})
  let pastIPs = client.verifiedUsers.ensure(verification.member, [], "ips");
  if(!(pastIPs || []).includes(ip)) client.verifiedUsers.push(verification.member, ip, "ips");
  
  res.render("verify", {
    code: code,
    status: "ok"
  });
});
app.get("/api/verify/INVISIBLE_RECAPTCHA/:code/:reCaptchaToken", async(req, res) => {
  let {code, reCaptchaToken} = req.params;
  const ip = req.get("CF-Connecting-IP") || req.get("X-FORWARDED-FOR").split(",")[0] || req.ip;
  await client.verifications.defer;
  await client.verifiedUsers.defer;
  await client.settings.defer;
  if(!client.verifications.has(code)) return res.json({ok:false, isBlocked: false});
  
  let verification = client.verifications.get(code);
  let settings = client.settings.get(verification.guild);
  let guild = client.guilds.cache.get(verification.guild);
  
  if(settings.verification.blockVPN) {
    if(await vpnCheck(ip)) return res.json({ok:false, isBlocked: true});
  }
  let verifyRecaptcha = await axios.post("https://www.google.com/recaptcha/api/siteverify",
    `secret=${encodeURIComponent(process.env.RECAPTCHA_SECRET)}&response=${encodeURIComponent(reCaptchaToken)}&ip=${encodeURIComponent(ip)}`, {
    headers: {
      "Content-Type": "application/x-www-form-urlencoded"
    },
    validateStatus: ()=>true,
  }); 
  client.verifiedUsers.ensure(verification.member, [], "ips");
  let pastIPs = client.verifiedUsers.get(verification.member, "ips");
  if(!(pastIPs || []).includes(ip)) client.verifiedUsers.push(verification.member, ip, "ips");
  if(verifyRecaptcha.data.success) {
    let role = guild.roles.cache.get(settings.verification.role);
    let member = guild.members.cache.get(verification.member);
    let channel = guild.channels.cache.get(settings.verification.channel);
    if(!member) return;
    await member.roles.remove(role).catch(()=>{
      if(!channel) member.user.send(`I couldn't remove the role. Contact the server staff.`);
      else channel.send(`Unable to apply role for ${member}.`);
    });
    client.verifications.delete(code);
  }
  res.json({
    ok: verifyRecaptcha.data.success,
    isBlocked: false
  });
});
app.all("*", (req, res) => {

  if (req.accepts('html')) {
    if(req.session.user) return res.render("404", {user: req.session.user});
    else return res.render("404", {user: null});
  }
  if (req.accepts('json')) {
    res.send({ error: 'Not Found' });
    return;
  }
  res.type('txt').send('Not Found');
});

app.listen(process.env.PORT || 3000);