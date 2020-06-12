const Flags = require('./Flags');

class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.avatar = user.avatar;
    this.dicriminator = user.discriminator;
    this.publicFlags = new Flags(user.public_flags);
    this.flags = new Flags(user.flags);
    this.bot = user.bot;
  }

  setPresence(presence) {
    this.status = presence.client_status;
    this.game = presence.game;
    this.activities = presence.activities;
  }
}

module.exports = User;
