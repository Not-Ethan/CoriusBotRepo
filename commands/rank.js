const _ = require("lodash");
const Canvas = require("canvas");
const {cool} = require("../cool-people.json")
const { MessageAttachment } = require("discord.js");
function numberWithCommas(x) {
	return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
}
/**
 * Draws a rounded rectangle using the current state of the canvas.
 * If you omit the last three params, it will draw a rectangle
 * outline with a 5 pixel border radius
 * @param {CanvasRenderingContext2D} ctx
 * @param {Number} x The top left x coordinate
 * @param {Number} y The top left y coordinate
 * @param {Number} width The width of the rectangle
 * @param {Number} height The height of the rectangle
 * @param {Number} [radius = 5] The corner radius; It can also be an object
 *                 to specify different radii for corners
 * @param {Number} [radius.tl = 0] Top left
 * @param {Number} [radius.tr = 0] Top right
 * @param {Number} [radius.br = 0] Bottom right
 * @param {Number} [radius.bl = 0] Bottom left
 * @param {Boolean} [fill = false] Whether to fill the rectangle.
 * @param {Boolean} [stroke = true] Whether to stroke the rectangle.
 */
function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
	if (typeof stroke === 'undefined') {
			stroke = true;
	}
	if (typeof radius === 'undefined') {
			radius = 5;
	}
	if (typeof radius === 'number') {
			radius = {tl: radius, tr: radius, br: radius, bl: radius};
	} else {
			let defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
			for (let side in defaultRadius) {
					radius[side] = radius[side] || defaultRadius[side];
			}
	}
	ctx.beginPath();
	ctx.moveTo(x + radius.tl, y);
	ctx.lineTo(x + width - radius.tr, y);
	ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
	ctx.lineTo(x + width, y + height - radius.br);
	ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
	ctx.lineTo(x + radius.bl, y + height);
	ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
	ctx.lineTo(x, y + radius.tl);
	ctx.quadraticCurveTo(x, y, x + radius.tl, y);
	ctx.closePath();
	if (fill) {
			ctx.fill();
	}
	if (stroke) {
			ctx.stroke();
	}

}
const progressBar = (ctx, x, y, w, h, val, color1, color2) => {
	ctx.fillStyle = color1;
	roundRect(ctx, x, y, w, h, 15, true, true);
	ctx.fillStyle = color2;
	if(val !== 0) roundRect(ctx, x, y, val * w, h, {tl: 15, tr:0, bl: 15, br: 0}, true, true);
};

const levelColor = (level) => {
	if(level < 5 ) return "#B5B5B5";
	if(level >= 5 && level < 10 ) return "#90D8DD";
	if(level >= 10 && level < 15 ) return "#0065b3";
	if(level >= 15 && level < 20 ) return "#00FFA6";
	if(level >= 20 && level < 25 ) return "#00FF23";
	if(level >= 25 && level < 30 ) return "#B9FF00";
	if(level >= 30 && level < 35 ) return "#FFE000";
	if(level >= 35 && level < 40 ) return "#FF8000";
	if(level >= 40 && level < 45 ) return "#FC3C3C";
	if(level >= 45 && level < 50 ) return "#FF0000";
	else return "#760000";
};

const rankColor = (rank) => {
	if(rank === 1) return "#d4af37";
	if(rank === 2) return "#c0c0c0";
	if(rank === 3) return "#cd7f32";
	if(rank >= 4 && rank <= 10) return "#0026ff";
	if(rank >= 11 && rank <= 20) return "#d3d3d3";
	else return "#8f8f8f";
};

const applyUsernameText = (canvas, text) => {
	const ctx = canvas.getContext('2d');
	let fontSize = 60;

	do {
			ctx.font = `${fontSize -= 10}px sans-serif`;
	} while (ctx.measureText(text).width > 300);
	return ctx.font;
};

const getNumberFont = (canvas, text) => {
const ctx = canvas.getContext('2d');

let fontSize = 70;

do {
		ctx.font = `${fontSize -= 1}px sans-serif`;
} while (ctx.measureText(text).width > 65);

return ctx.font;
};

module.exports = {
    name: "rank",
    description: "Check what XP level you reached!",
    aliases: ["xp", "level"],
    syntax: "rank [user]",
	execute: async (client, message, args) => {
		if(!message.guild || !message.member) return await message.reply(`This command can only be run in a guild.`);
		try {
            let user = message.mentions.users.first();
            if (!user && !isNaN(parseInt(args[0], 10))) user = client.users.cache.get(args[0]);
            if (!user) user = message.author;
			const key = `${message.guild.id}-${user.id}`;
			await client.xp.defer;
			client.xp.ensure(key, {
				user: user.id,
				guild: message.guild.id,
				xp: 0,
				level: 0,
				allMessages: 0,
				countedMessages: 0,
			});
			let currentLevel = client.xp.get(key, "level");
			let currentXP = client.xp.get(key, "xp");
			let nextLevel = currentLevel + 1;
			//let nextLevelXP = Math.pow(nextLevel, 2) * 100;
			let nextLevelXP = client.xp.getXPFromLevel(nextLevel);
			let currentXPProgress = client.xp.getCurrentIncXP(currentXP);
			let nextLevelIncXP = client.xp.getIncXPFromLevel(nextLevel);
			//let XPProgress = Math.round((currentXPProgress/nextLevelIncXP)*100);
			let XPProgress = Math.min(Math.max(currentXPProgress / nextLevelIncXP, 0), 1);;
			const guildMembersXP = client.xp.filter( p => p.guild === message.guild.id ).array();
			const guildMembersXPSorted = guildMembersXP.sort((a, b) => b.xp - a.xp);
			let rank = guildMembersXPSorted.findIndex(data=>data.user === user.id) + 1;
			const canvas = Canvas.createCanvas(934, 282);
			const ctx = canvas.getContext('2d');

			const background = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
			background.addColorStop(0, "#4b3bd9");
			background.addColorStop(0.9, "#a87be4");
			ctx.fillStyle = background;
			//ctx.fillStyle = levelColor(currentLevel);
			ctx.fillRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = "#e46215";
			ctx.strokeRect(0, 0, canvas.width, canvas.height);

			ctx.strokeStyle = "#1d1d2c";

			ctx.font = applyUsernameText(canvas, user.username);
			ctx.fillStyle = '#ffffff';
			ctx.fillText(user.username, 225, 141);
			//ctx.strokeText(user.username, 225, 141);

			let usernameWidth = ctx.measureText(user.username).width;
			ctx.font = "28px sans-serif";
			ctx.fillStyle = '#28292c';
      let j = user.discriminator
			ctx.fillText(`#${j}`, 235 + usernameWidth, 141);
      //adding title
      function getWidthOfArray(arr, margin) {
        var total = 0
  for(let i of arr) {
    total += ctx.measureText(arr[i]).width
  }
  return total+margin
}
      let dab = []
      for(let x of client.config.owners) {
        if(x == user.id) {
          dab.push("[Owner]")
        }
      }
      for(let y of cool) {
        if(y.includes(user.id)) {
          dab.push("[Cool]")
        }
      }
      let b = []
      dab.push("[j]")
      for(let i of dab) {
      if(i == "[Owner]") {
      ctx.fillStyle = "#730600"}
      if(i == "[Cool]") {
        ctx.fillStyle = "#00d1b2"
      }
        let n = 0
        if(b) {
          n = getWidthOfArray(b, 10)
        }
        ctx.font = "28px sans-serif";
        b.push(i)
      ctx.fillText(i, n, 30)
      }

			//ctx.strokeText(`#${user.discriminator}`, 235 + usernameWidth, 141);
			ctx.font = "28px sans-serif";
			ctx.fillStyle = '#ffffff';
			ctx.fillText("RANK", 575, 75);
			//ctx.strokeText("RANK", 575, 75);
			let rankLabelWidth = ctx.measureText("RANK").width;

			ctx.font = getNumberFont(canvas, `#${rank}`);
			ctx.fillStyle = rankColor(rank);
			ctx.fillText(`#${rank}`, 580 + rankLabelWidth, 75);
			//ctx.strokeText(`#${rank}`, 580 + rankLabelWidth, 75);

			ctx.font = "28px sans-serif";
			ctx.fillStyle = "#ffffff";
			ctx.fillText("LEVEL", 590 + rankLabelWidth + 65, 75);
			//ctx.strokeText("LEVEL", 590 + rankLabelWidth + 65, 75);
			let levelLabelWidth = ctx.measureText("LEVEL").width;

			//ctx.fillStyle = levelColor(canvas, currentLevel);
			ctx.fillStyle = levelColor(currentLevel);
			ctx.font = getNumberFont(canvas, `${currentLevel}`);
			ctx.fillText(`${currentLevel}`, 595 + rankLabelWidth + 65 + levelLabelWidth, 75);
			//ctx.strokeText(`${currentLevel}`, 595 + rankLabelWidth + 65 + levelLabelWidth, 75);
      
      
      
			let xpProgressWidth = ctx.measureText(`${numberWithCommas(currentXPProgress)} / ${numberWithCommas(nextLevelIncXP)} XP`).width;

			ctx.fillStyle = levelColor(currentLevel);
			ctx.font = "28px sans-serif";
			ctx.fillText(`${numberWithCommas(currentXPProgress)}`, 590 + rankLabelWidth + 45 - xpProgressWidth + 350, 160);
			//ctx.strokeText(`${numberWithCommas(currentXPProgress)}`, 590 + rankLabelWidth + 65 - 25, 160);
			let currentXPWidth = ctx.measureText(`${numberWithCommas(currentXPProgress)}`).width;

			ctx.fillStyle = "#28292c";
			ctx.font = "28px sans-serif";
			ctx.fillText(` / ${numberWithCommas(nextLevelIncXP)} XP`, 590 + currentXPWidth + rankLabelWidth + 45 - xpProgressWidth + 350, 160);
			//ctx.strokeText(` / ${numberWithCommas(nextLevelIncXP)} XP`, 590 + rankLabelWidth + 65 - 20 + currentXPWidth, 160);

			progressBar(ctx, 225, 175, 600, 30, XPProgress, "#777777", levelColor(currentLevel));

			ctx.beginPath();
			ctx.arc(112.5, 141, 75, 0, Math.PI * 2, true);
			ctx.closePath();
			ctx.clip();
			const avatar = await Canvas.loadImage(user.displayAvatarURL({dynamic: true, format: "png"}) || user.defaultAvatarURL);
			ctx.drawImage(avatar, 37.5, 66, 150, 150);
			const attachment = new MessageAttachment(canvas.toBuffer(), 'rank-card.png');
			return await message.channel.send({files:[attachment]});
			//if (user.id === message.author.id) return await message.channel.send(`You currently have ${currentXP}/${nextLevelXP} XP, and are level ${currentLevel}! You are rank #${rank}!`, {files:[attachment]});
			//else return await message.channel.send(`${user.tag} currently has ${currentXP}/${nextLevelXP} XP, and is level ${currentLevel}! They are rank #${rank}!`, {files:[attachment]});
		} catch (err) {
			console.log(err);
			await message.reply("An error occurred.");
		}
	}
};
