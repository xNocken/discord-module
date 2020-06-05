class Flags {
  constructor(flag) {
    this.discordEmployee = (flag >> 0) & 1;
    this.discordPartner = (flag >> 1) & 1;
    this.hypeSquadEvents = (flag >> 2) & 1;
    this.bugHunter1 = (flag >> 3) & 1;
    this.houseBravery = (flag >> 6) & 1;
    this.houseBrilliance = (flag >> 7) & 1;
    this.houseBallance = (flag >> 8) & 1;
    this.earlySupporter = (flag >> 9) & 1;
    this.teamUser = (flag >> 10) & 1;
    this.system = (flag >> 12) & 1;
    this.bugHunter2 = (flag >> 14) & 1;
    this.verifiedBot = (flag >> 16) & 1;
    this.verifiedBotDeveloper = (flag >> 17) & 1;
  }
}

module.exports = Flags;
