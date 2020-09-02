const Enmap = require("enmap");
const { Collection } = require("discord.js");

/*
export type XPData = {
  user: string,
  guild: string,
  xp: number,
  level: number,
  allMessages: number,
  countedMessages: number,
};
*/

module.exports = class XPHandler extends Enmap { 
  constructor(options) {
    super(options);
  };

  cooldown = new Collection();

  getXPFromLevel = (level) => {
    let xp = 0;
    let incLevel = 0;
    while (incLevel < level) {
      xp += 5 * (Math.pow(incLevel, 2)) + 50 * incLevel + 100;
      incLevel++;
    }
    return xp;
  };
  getIncXPFromLevel = (level) => {
    return 5 * (Math.pow(level, 2)) + 50 * level + 100;
  };
  getLevelFromXP = (xp) => {
    let level = 0;
  
    while (xp >= this.getIncXPFromLevel(level)) {
      xp -= this.getIncXPFromLevel(level);
      level++;
    }
  
    return level;
  };
  getCurrentIncXP = (xp) => {
    let level = 0;
    while (xp >= this.getIncXPFromLevel(level)) {
      xp -= this.getIncXPFromLevel(level);
      level++;
    }
  
    return xp;
  };
}