const globals = require('../src/globals');
const MessageFlags = require('./MessageFlags');

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
    this.author = globals.users[message.author.id];
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
  }

  react(emoji, callback = () => { }) {
    globals.requests.react(this.channel.id, this.id, emoji, callback);
  }

  getChannel() {
    return this.channel;
  }

  supressEmbed(callback) {
    this.flags.SUPPRESS_EMBEDS = 1;
    const newFlags = this.flags.getFlagNumber();

    globals.requests.patchMessage(this.channel.id, this.id, { flags: newFlags }, callback);
  }

  editMessage(message, callback = () => { }) {
    if (this.author.id !== globals.user.id) {
      callback(6);
      return;
    }

    globals.requests.patchMessage(this.channel.id, this.id, { content: message }, callback);
  }
}

module.exports = Message;
