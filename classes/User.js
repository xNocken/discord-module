const Flags = require('./Flags');
const globals = require('../src/globals');

class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.avatar = user.avatar;
    this.discriminator = user.discriminator;
    this.publicFlags = new Flags(user.public_flags);
    this.flags = new Flags(user.flags);
    this.bot = user.bot;
  }

  setPresence(presence) {
    this.status = presence.client_status;
    this.game = presence.game;
    this.activities = presence.activities;
  }

  getPrivateChannelId(callback) {
    globals.requests.createPrivateChannel([this.id], (user) => {
      callback(user.message || user.id);
    });
  }

  static getUserById(id, callback) {
    globals.requests.getUserInfo(id, (user) => {
      if (user.id) {
        callback(new User(user));
      } else {
        callback(false);
      }
    });
  }

  getAccountCreateDate() {
    const binaryId = this.id.toString(2);
    const rightLengthId = '0'.repeat(64 - binaryId.length) + binaryId;

    return new Date(parseInt(rightLengthId.substring(0, 42), 2) + globals.discordEpochTimestamp);
  }
}

module.exports = User;
