const globals = require('../src/globals');
const MessageFlags = require('./MessageFlags');
const User = require('./User');

const messageTypes = [
  'DEFAULT',
  'RECIPIENT_ADD',
  'RECIPIENT_REMOVE',
  'CALL',
  'CHANNEL_NAME_CHANGE',
  'CHANNEL_ICON_CHANGE',
  'CHANNEL_PINNED_MESSAGE',
  'GUILD_MEMBER_JOIN',
  'USER_PREMIUM_GUILD_SUBSCRIPTION',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_1',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_2',
  'USER_PREMIUM_GUILD_SUBSCRIPTION_TIER_3',
  'CHANNEL_FOLLOW_ADD',
  'GUILD_DISCOVERY_DISQUALIFIED',
  'GUILD_DISCOVERY_REQUALIFIED',
];

class Message {
  constructor(message) {
    if (!globals.users[message.author.id]) {
      const user = new User(message.author);

      globals.users[message.author.id] = user;
    }
    this.author = globals.users[message.author.id];
    this.embeds = message.embeds;
    this.nonce = message.nonce;
    this.content = message.content;
    this.channel = globals.channels[message.channel_id]
      || globals.privateChannels[message.channel_id];
    this.attachments = message.attachments;
    this.edited = message.edited_timestamp ? new Date(message.edited_timestamp) : null;
    this.time = new Date(message.timestamp);
    this.id = message.id;
    this.mentionEveryone = message.mention_everyone;
    this.mentionRoles = message.mention_roles;
    this.mentionChannels = message.mention_channels;
    this.flags = new MessageFlags(message.flags);
    this.type = message.type;
    this.typeName = messageTypes[message.type];
    this.webhookId = message.webhook_id;
    this.messageReference = message.message_reference;
    this.application = message.application;
    this.activity = message.activity;
    this.pinned = message.pinned;
    this.referencedMessage = message.referenced_message;
  }

  react(emoji, callback = () => { }) {
    const perms = this.channel.getPermissionOverwrite(
      globals.guilds[this.channel.guildId].members[globals.user.id],
    );

    if (!perms.ADD_REACTIONS || !perms.READ_MESSAGE_HISTORY) {
      callback(7);
      return;
    }

    globals.requests.react(this.channel.id, this.id, emoji, callback);
  }

  getChannel() {
    return this.channel;
  }

  supressEmbed(callback) {
    const perms = this.channel.getPermissionOverwrite(
      globals.guilds[this.channel.guildId].members[global.user.id],
    );

    if (!perms.MANAGE_MESSAGES) {
      callback(7);
      return;
    }

    this.flags.SUPPRESS_EMBEDS = 1;
    const newFlags = this.flags.getFlagNumber();

    globals.requests.patchMessage(this.channel.id, this.id, { flags: newFlags }, (message) => {
      if (message.id) {
        callback(new Message(message));
      } else {
        callback(message);
      }
    });
  }

  editMessage(message, callback = () => { }) {
    if (this.author.id !== globals.user.id) {
      callback(6);
      return;
    }

    globals.requests.patchMessage(this.channel.id, this.id, { content: message }, (response) => {
      if (response.id) {
        callback(new Message(response));
      } else {
        callback(response);
      }
    });
  }

  delete(callback) {
    const perms = this.channel.getPermissionOverwrite(
      globals.guilds[this.channel.guildId].members[globals.user.id],
    );

    if (this.author.id === globals.user.id || !perms.MANAGE_MESSAGES) {
      callback(7);
      return;
    }

    globals.requests.deleteMessage(this.channel.id, this.id, callback);
  }
}

module.exports = Message;
