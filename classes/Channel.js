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
    this.lastMessageId = channel.last_message_id;
    this.name = channel.name;
    this.parentId = channel.parent_id;
    this.position = channel.position;
    this.rateLimitPerUser = channel.rate_limit_per_user;
    this.topic = channel.topic;
    this.type = channel.type;
    this.permissionOverwrites = [];
    this.guildId = guildId;
    this.messageQueue = [];

    channel.permission_overwrites.forEach((permissionOverwrite) => {
      this.permissionOverwrites[permissionOverwrite.id] = {
        allow: new Permissions(permissionOverwrite.allow),
        deny: new Permissions(permissionOverwrite.deny),
        id: globals[permissionOverwrite.type === 'role' ? 'roles' : 'users'][permissionOverwrite.id],
        type: permissionOverwrite.type,
      };
    });
  }

  getPermissionOverwrite(member) {
    let realMember = member;
    if (!realMember.user) {
      realMember = globals.guilds[this.guildId].members[member];
    }

    const parentServer = globals.guilds[this.guildId];
    let perms = parentServer.everyoneRole.permissions.getPermissionNumber();

    if (!realMember.user) {
      throw Error('Invalid user given');
    }

    if (parentServer.userIsAdmin(realMember.user.id) || parentServer.userIsOwner(realMember.user.id)) {
      return new Permissions(Permissions.allPermissions);
    }

    realMember.roles.forEach((role) => {
      perms |= role.permissions.getPermissionNumber();
    });

    Object.values(this.permissionOverwrites).forEach((overWrite) => {
      if ((overWrite.type === 'role' && parentServer.userHasRole(realMember.user.id, overWrite.id.id))) {
        perms &= ~overWrite.deny.getPermissionNumber();
        perms |= overWrite.allow.getPermissionNumber();
      }
    });

    Object.values(this.permissionOverwrites).forEach((overWrite) => {
      if ((overWrite.type === 'member' && overWrite.id.id === realMember.user.id)) {
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
      const callback = (response) => {
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
        }, (response.retry_after || 0) + 850);
      };

      if (typeof message.message === 'object') {
        await globals.requests.sendEmbed(this.id, message.message, message.tts, callback);
      } else if (message.message) {
        await globals.requests.sendMessage(this.id, message.message, message.tts, callback);
      } else {
        await globals.requests.sendMessageBody(this.id, message.body, callback);
      }
    };

    send(this.messageQueue.splice(0, 1)[0]);
  }

  emptyQueue() {
    this.messageQueue = [];
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

    if (this.type === Channel.types.GUILD_VOICE || this.type === Channel.types.GUILD_STORE) {
      callback(2);
      return;
    }

    if (typeof message === 'object') {
      this.messageQueue.push({ message, callback, tts });
    } else {
      const messageSplit = message.split('');

      do {
        this.messageQueue.push({ message: messageSplit.splice(0, 1999).join('').replace(/@everyone/g, '@3veryone'), callback, tts });
      } while (messageSplit.length > 1);
    }

    this.drainQueue();
  }

  sendMessageBody(body, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.SEND_MESSAGES) {
      callback(7);
      return;
    }

    if (this.type === Channel.types.GUILD_VOICE || this.type === Channel.types.GUILD_STORE) {
      callback(2);
      return;
    }

    this.messageQueue.push({ body, callback });

    this.drainQueue();
  }

  getMessages(count = 50, before = null, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.VIEW_CHANNEL || !perms.READ_MESSAGE_HISTORY) {
      callback(7);
      return;
    }

    globals.requests.getMessages(this.id, count, before, (messages) => {
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

    globals.requests.updateChannel(this.id, { name }, (newChannel) => {
      callback(new Channel(newChannel));
    });
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

    globals.requests.updateChannel(this.id, { position }, (newChannel) => {
      callback(new Channel(newChannel));
    });
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

    globals.requests.updateChannel(this.id, { type }, (newChannel) => {
      callback(new Channel(newChannel));
    });
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

    globals.requests.updateChannel(this.id, { topic }, (newChannel) => {
      callback(new Channel(newChannel));
    });
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

    globals.requests.updateChannel(this.id, { nsfw }, (newChannel) => {
      callback(new Channel(newChannel));
    });
  }

  setRateLimitPerUser(rateLimitperUser, callback = () => { }) {
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

    this.rateLimitPerUser = rateLimitperUser;

    globals.requests.updateChannel(this.id, {
      rate_limit_per_user: rateLimitperUser,
    }, (newChannel) => {
      callback(new Channel(newChannel));
    });
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

    globals.requests.updateChannel(this.id, { bitrate }, (newChannel) => {
      callback(new Channel(newChannel));
    });
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

    globals.requests.updateChannel(this.id, { user_limit: UserLimit }, (newChannel) => {
      callback(new Channel(newChannel));
    });
  }

  setPermissionOverwrites(permissionOverwrites, callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    this.permissionOverwrites = permissionOverwrites;

    globals.requests.updateChannel(this.id, {
      permission_overwrites: permissionOverwrites,
    }, (newChannel) => {
      callback(new Channel(newChannel));
    });
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

    this.parentId = parentId;

    globals.requests.updateChannel(this.id, { parent_id: parentId }, (newChannel) => {
      callback(new Channel(newChannel));
    });
  }

  delete(callback = () => { }) {
    const perms = this.getPermissionOverwrite(
      globals.guilds[this.guildId].getUserById(globals.user.id),
    );

    if (!perms.MANAGE_CHANNELS) {
      callback(7);
      return;
    }

    globals.requests.deleteChannel(this.id, (response) => {
      callback(new Channel(response));
    });
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
