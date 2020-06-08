const globals = require('../src/globals');
const Permissions = require('./Permissions');
const Message = require('./Message');

const maxBitratePerLevel = [
  96000,
  1280000,
  256000,
  384000,
];

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
      this.permission_overwrites[permissionOverwrite.id] = {
        allow: new Permissions(permissionOverwrite.allow),
        deny: new Permissions(permissionOverwrite.deny),
        id: globals[permissionOverwrite.type === 'role' ? 'roles' : 'users'][permissionOverwrite.id],
        type: permissionOverwrite.type,
      };
    });
  }

  getPermissionOverwrite(user) {
    const parentServer = globals.guilds[this.guildId];
    let perms = parentServer.everyoneRole.permissions.getPermissionNumber();

    if (!user.user) {
      throw Error('Invalid user given');
    }

    if (parentServer.userIsAdmin(user.user.id) || parentServer.userIsOwner(user.user.id)) {
      return new Permissions(Permissions.allPermissions);
    }

    user.roles.forEach((role) => {
      perms |= role.permissions.getPermissionNumber();
    });

    Object.values(this.permission_overwrites).forEach((overWrite) => {
      if ((overWrite.type === 'role' && parentServer.userHasRole(user.user.id, overWrite.id.id))
       || (overWrite.type === 'member' && overWrite.id.id === user.user.id)) {
        perms &= ~overWrite.deny.getPermissionNumber();
        perms |= overWrite.allow.getPermissionNumber();
      }
    });

    return new Permissions(perms);
  }

  getMessages(count = 50, callback = () => { }) {
    const { discord } = globals;

    discord.getMessages(this.id, count, (messages) => {
      if (messages) {
        callback(messages.map((message) => new Message(message)));
      }
    });
  }

  setName(name = '', callback = () => {}) {
    const { discord } = globals;

    if (!name || name.length < 2 || name.length > 100) {
      callback(1);

      return;
    }

    this.name = name;

    discord.updateChannel(this.id, { name }, callback);
  }

  setPosition(position = '', callback = () => {}) {
    const { discord } = globals;

    this.position = position;

    discord.updateChannel(this.id, { position }, callback);
  }

  setType(type, callback = () => {}) {
    const { discord } = globals;

    if (type !== Channel.types.GUILD_TEXT && type !== Channel.types.GUILD_NEWS) {
      callback(2);
      return;
    }

    if (this.type !== Channel.types.GUILD_TEXT && this.type !== Channel.types.GUILD_NEWS) {
      callback(3);
      return;
    }

    this.type = type;

    discord.updateChannel(this.id, { type }, callback);
  }

  setTopic(topic, callback = () => {}) {
    const { discord } = globals;

    if (topic.length < 0 || topic.length > 1024) {
      callback(1);
      return;
    }

    this.topic = topic;

    discord.updateChannel(this.id, { topic }, callback);
  }

  setNsfw(nsfw, callback = () => {}) {
    const { discord } = globals;

    if (Number(nsfw) !== 0 && Number(nsfw) !== 1) {
      callback(1);
      return;
    }

    this.nsfw = nsfw;

    discord.updateChannel(this.id, { nsfw }, callback);
  }

  setRateLimitperUser(rateLimitperUser, callback = () => {}) {
    const { discord } = globals;

    if (rateLimitperUser < 0 || rateLimitperUser > 21600) {
      callback(1);
      return;
    }

    this.rate_limit_per_user = rateLimitperUser;

    discord.updateChannel(this.id, { rate_limit_per_user: rateLimitperUser }, callback);
  }

  setBitrate(bitrate, callback = () => {}) {
    const { discord } = globals;

    if (this.type !== Channel.types.GUILD_VOICE) {
      callback(2);
      return;
    }

    if (bitrate < 8000 || bitrate > maxBitratePerLevel[globals.guilds[this.guildId].premium_tier]) {
      callback(1);
      return;
    }

    this.bitrate = bitrate;

    discord.updateChannel(this.id, { bitrate }, callback);
  }

  setUserLimit(UserLimit, callback = () => {}) {
    const { discord } = globals;

    if (UserLimit < 0 || UserLimit > 99) {
      callback(1);
      return;
    }

    this.user_limit = UserLimit;

    discord.updateChannel(this.id, { user_limit: UserLimit }, callback);
  }

  setpermissionOverwrites(permissionOverwrites, callback = () => {}) {
    const { discord } = globals;

    this.permission_overwrites = permissionOverwrites;

    discord.updateChannel(this.id, { permission_overwrites: permissionOverwrites }, callback);
  }

  setParentId(parentId, callback = () => {}) {
    const { discord } = globals;

    if (parentId.toString().length !== 18) {
      callback(4);
      return;
    }

    this.parent_id = parentId;

    discord.updateChannel(this.id, { parent_id: parentId }, callback);
  }
}

Channel.types = {
  GUILD_TEXT: 0,
  DM: 1,
  GUILD_VOICE: 2,
  GROUP_DM: 3,
  GUILD_CATEGORY: 4,
  GUILD_NEWS: 5,
  GUILD_STORE: 6,
};

module.exports = Channel;
