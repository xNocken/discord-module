const settings = require('../src/settings');
const Permissions = require('./Permissions');

class Channel {
  constructor(channel, guildId) {
    this.id = channel.id;
    this.last_message_id = channel.last_message_id;
    this.name = channel.name;
    this.parent_id = channel.parent_id;
    this.position = channel.position;
    this.rate_limit_per_user = channel.rate_limit_per_user;
    this.topic = channel.topic;
    this.type = channel.type;
    this.permission_overwrites = [];
    this.guildId = guildId;

    channel.permission_overwrites.forEach((permissionOverwrite) => {
      this.permission_overwrites.push({
        allow: new Permissions(permissionOverwrite.allow),
        deny: new Permissions(permissionOverwrite.deny),
        id: settings[permissionOverwrite.type === 'role' ? 'roles' : 'users'][permissionOverwrite.id],
        type: permissionOverwrite.type,
      });
    });
  }
}

module.exports = Channel;
