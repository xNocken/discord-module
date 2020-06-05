const Flags = require('./Flags');

class User {
  constructor(user) {
    this.id = user.id;
    this.username = user.username;
    this.avatar = user.avatar;
    this.dicriminator = user.discriminator;
    this.publicFlags = user.public_flags;
    this.flags = new Flags(user.flags);
    this.bot = user.bot;
    this.email = user.email;
    this.verified = user.verified;
  }
}

module.exports = User;
