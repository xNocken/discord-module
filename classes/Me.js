const Flags = require('./Flags');
const globals = require('../src/globals');

class Me {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.avatar = user.avatar;
    this.discriminator = user.discriminator;
    this.publicFlags = new Flags(user.public_flags);
    this.flags = new Flags(user.flags);
    this.bot = user.bot;
    this.email = user.email;
  }

  setPresence(presence) {
    this.status = presence.client_status;
    this.game = presence.game;
    this.activities = presence.activities;
  }

  setStatus(status, afk) {
    globals.discord.gateway.send(JSON.stringify({
      op: 3,
      d: {
        since: (new Date()).getTime(),
        game: null,
        status,
        afk,
      },
    }));
  }

  setGame(game) {
    globals.discord.gateway.send(JSON.stringify({
      op: 3,
      d: {
        since: (new Date()).getTime(),
        status: 'online',
        afk: false,
        game,
      },
    }));
  }
}

module.exports = Me;
