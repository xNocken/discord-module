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

  getPermissionOverwrite(member) {
    const parentServer = globals.guilds[this.guildId];
    let perms = parentServer.everyoneRole.permissions.getPermissionNumber();

    if (!member.user) {
      throw Error('Invalid user given');
    }

    if (parentServer.userIsAdmin(member.user.id) || parentServer.userIsOwner(member.user.id)) {
      return new Permissions(Permissions.allPermissions);
    }

    member.roles.forEach((role) => {
      perms |= role.permissions.getPermissionNumber();
    });

    Object.values(this.permission_overwrites).forEach((overWrite) => {
      if ((overWrite.type === 'role' && parentServer.userHasRole(member.user.id, overWrite.id.id))) {
        perms &= ~overWrite.deny.getPermissionNumber();
        perms |= overWrite.allow.getPermissionNumber();
      }
    });

    Object.values(this.permission_overwrites).forEach((overWrite) => {
      if ((overWrite.type === 'member' && overWrite.id.id === member.user.id)) {
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
      await globals.requests.sendMessage(this.id, message.message, message.tts, (response) => {
        if (response.retry_after) {
          this.messageQueue.unshift(message);
        } else {
          message.callback(new Message(response));
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

  createInvite(options, callback) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.CREATE_INSTANT_INVITE) {
      callback(7);
      return;
    }

    globals.requests.createInvite(this.id, options, callback);
  }

  sendMessage(message, tts = false, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.SEND_MESSAGES) {
      callback(7);
      return;
    }

    if (tts && !perms.SEND_TTS_MESSAGES) {
      callback(7);
      return;
    }

    if (message.length < 1 || message.length > 2000) {
      callback(1);
      return;
    }

    if (this.type === Channel.types.GUILD_VOICE || this.type === Channel.types.GUILD_STORE) {
      callback(2);
      return;
    }

    this.messageQueue.push({ message, callback, tts });
    this.drainQueue();
  }

  getMessages(count = 50, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.VIEW_CHANNEL || !perms.READ_MESSAGE_HISTORY) {
      callback(7);
      return;
    }

    globals.requests.getMessages(this.id, count, (messages) => {
      if (messages) {
        callback(messages.map((message) => new Message(message)));
      } else {
        callback(messages);
      }
    });
  }

  getMessage(messageId, callback) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.VIEW_CHANNEL || !perms.READ_MESSAGE_HISTORY) {
      callback(7);
      return;
    }

    globals.requests.getMessage(this.id, messageId, (message) => {
      callback(new Message(message));
    });
  }

  setName(name = '', callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    if (!name || name.length < 2 || name.length > 100) {
      callback(1);

      return;
    }

    this.name = name;

    globals.requests.updateChannel(this.id, { name }, callback);
  }

  setPosition(position = '', callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    this.position = position;

    globals.requests.updateChannel(this.id, { position }, callback);
  }

  setType(type, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

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
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    if (topic.length < 0 || topic.length > 1024) {
      callback(1);
      return;
    }

    this.topic = topic;

    globals.requests.updateChannel(this.id, { topic }, callback);
  }

  setNsfw(nsfw, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    if (Number(nsfw) !== 0 && Number(nsfw) !== 1) {
      callback(1);
      return;
    }

    this.nsfw = nsfw;

    globals.requests.updateChannel(this.id, { nsfw }, callback);
  }

  setRateLimitperUser(rateLimitperUser, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    if (rateLimitperUser < 0 || rateLimitperUser > 21600) {
      callback(1);
      return;
    }

    this.rate_limit_per_user = rateLimitperUser;

    globals.requests.updateChannel(this.id, { rate_limit_per_user: rateLimitperUser }, callback);
  }

  setBitrate(bitrate, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

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
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    if (UserLimit < 0 || UserLimit > 99) {
      callback(1);
      return;
    }

    this.user_limit = UserLimit;

    globals.requests.updateChannel(this.id, { user_limit: UserLimit }, callback);
  }

  setPermissionOverwrites(permissionOverwrites, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    this.permission_overwrites = permissionOverwrites;

    globals.requests.updateChannel(this.id, {
      permission_overwrites: permissionOverwrites,
    }, callback);
  }

  setParentId(parentId, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    if (parentId.toString().length !== 18) {
      callback(4);
      return;
    }

    this.parent_id = parentId;

    globals.requests.updateChannel(this.id, { parent_id: parentId }, callback);
  }

  delete(callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    globals.requests.deleteChannel(this.id, callback);
  }

  typing() {
    globals.requests.typing(this.id);
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
