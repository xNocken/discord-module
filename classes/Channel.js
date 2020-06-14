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
    this.messageQueue = [];

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

  async drainQueue() {
    if (this.isDraining) {
      return;
    }

    this.isDraining = true;
    const send = async (message) => {
      await globals.requests.sendMessage(this.id, message.message, (response) => {
        if (response.retry_after) {
          this.messageQueue.unshift(message);
        } else {
          message.callback();
        }

        if (!this.messageQueue.length) {
          this.isDraining = false;
          return;
        }

        setTimeout(() => {
          send(this.messageQueue.splice(0, 1)[0]);
        }, response.retry_after || 0);
      });
    };

    send(this.messageQueue.splice(0, 1)[0]);
  }

  sendMessage(message, callback = () => { }) {
    if (message.length < 1 || message.length > 2000) {
      callback(1);
      return;
    }

    if (this.type === Channel.types.GUILD_VOICE || this.type === Channel.types.GUILD_STORE) {
      callback(2);
      return;
    }

    this.messageQueue.push({ message, callback });
    this.drainQueue();
  }

  getMessages(count = 50, callback = () => { }) {
    globals.requests.getMessages(this.id, count, (messages) => {
      if (messages) {
        callback(messages.map((message) => new Message(message)));
      }
    });
  }

  setName(name = '', callback = () => { }) {
    if (!name || name.length < 2 || name.length > 100) {
      callback(1);

      return;
    }

    this.name = name;

    globals.requests.updateChannel(this.id, { name }, callback);
  }

  setPosition(position = '', callback = () => { }) {
    this.position = position;

    globals.requests.updateChannel(this.id, { position }, callback);
  }

  setType(type, callback = () => { }) {
    if (type !== Channel.types.GUILD_TEXT && type !== Channel.types.GUILD_NEWS) {
      callback(2);
      return;
    }

    if (this.type !== Channel.types.GUILD_TEXT && this.type !== Channel.types.GUILD_NEWS) {
      callback(3);
      return;
    }

    this.type = type;

    globals.requests.updateChannel(this.id, { type }, callback);
  }

  setTopic(topic, callback = () => { }) {
    if (topic.length < 0 || topic.length > 1024) {
      callback(1);
      return;
    }

    this.topic = topic;

    globals.requests.updateChannel(this.id, { topic }, callback);
  }

  setNsfw(nsfw, callback = () => { }) {
    if (Number(nsfw) !== 0 && Number(nsfw) !== 1) {
      callback(1);
      return;
    }

    this.nsfw = nsfw;

    globals.requests.updateChannel(this.id, { nsfw }, callback);
  }

  setRateLimitperUser(rateLimitperUser, callback = () => { }) {
    if (rateLimitperUser < 0 || rateLimitperUser > 21600) {
      callback(1);
      return;
    }

    this.rate_limit_per_user = rateLimitperUser;

    globals.requests.updateChannel(this.id, { rate_limit_per_user: rateLimitperUser }, callback);
  }

  setBitrate(bitrate, callback = () => { }) {
    if (this.type !== Channel.types.GUILD_VOICE) {
      callback(2);
      return;
    }

    if (bitrate < 8000 || bitrate > maxBitratePerLevel[globals.guilds[this.guildId].premium_tier]) {
      callback(1);
      return;
    }

    this.bitrate = bitrate;

    globals.requests.updateChannel(this.id, { bitrate }, callback);
  }

  setUserLimit(UserLimit, callback = () => { }) {
    if (UserLimit < 0 || UserLimit > 99) {
      callback(1);
      return;
    }

    this.user_limit = UserLimit;

    globals.requests.updateChannel(this.id, { user_limit: UserLimit }, callback);
  }

  setpermissionOverwrites(permissionOverwrites, callback = () => { }) {
    this.permission_overwrites = permissionOverwrites;

    globals.requests.updateChannel(this.id, {
      permission_overwrites: permissionOverwrites,
    }, callback);
  }

  setParentId(parentId, callback = () => { }) {
    if (parentId.toString().length !== 18) {
      callback(4);
      return;
    }

    this.parent_id = parentId;

    globals.requests.updateChannel(this.id, { parent_id: parentId }, callback);
  }

  delete(callback = () => { }) {
    globals.requests.deleteChannel(this.id, callback);
  }

  createInvite(options, callback) {
    globals.requests.createInvite(this.guildId, options, callback);
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
