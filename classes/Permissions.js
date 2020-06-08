class Permissions {
  constructor(perm) {
    this.CREATE_INSTANT_INVITE = (perm >> 0) & 1;
    this.KICK_MEMBERS = (perm >> 1) & 1;
    this.BAN_MEMBERS = (perm >> 2) & 1;
    this.ADMINISTRATOR = (perm >> 3) & 1;
    this.MANAGE_CHANNELS = (perm >> 4) & 1;
    this.MANAGE_GUILD = (perm >> 5) & 1;
    this.ADD_REACTIONS = (perm >> 6) & 1;
    this.VIEW_AUDIT_LOG = (perm >> 7) & 1;
    this.PRIORITY_SPEAKER = (perm >> 8) & 1;
    this.STREAM = (perm >> 9) & 1;
    this.VIEW_CHANNEL = (perm >> 10) & 1;
    this.SEND_MESSAGES = (perm >> 11) & 1;
    this.SEND_TTS_MESSAGES = (perm >> 12) & 1;
    this.MANAGE_MESSAGES = (perm >> 13) & 1;
    this.EMBED_LINKS = (perm >> 14) & 1;
    this.ATTACH_FILES = (perm >> 15) & 1;
    this.READ_MESSAGE_HISTORY = (perm >> 16) & 1;
    this.MENTION_EVERYONE = (perm >> 17) & 1;
    this.USE_EXTERNAL_EMOJIS = (perm >> 18) & 1;
    this.VIEW_GUILD_INSIGHTS = (perm >> 19) & 1;
    this.CONNECT = (perm >> 20) & 1;
    this.SPEAK = (perm >> 21) & 1;
    this.MUTE_MEMBERS = (perm >> 22) & 1;
    this.DEAFEN_MEMBERS = (perm >> 23) & 1;
    this.MOVE_MEMBERS = (perm >> 24) & 1;
    this.USE_VAD = (perm >> 25) & 1;
    this.CHANGE_NICKNAME = (perm >> 26) & 1;
    this.MANAGE_NICKNAMES = (perm >> 27) & 1;
    this.MANAGE_ROLES = (perm >> 28) & 1;
    this.MANAGE_WEBHOOKS = (perm >> 29) & 1;
    this.MANAGE_EMOJIS = (perm >> 30) & 1;
  }

  getPermissionNumber() {
    let number = 0;

    number += this.MANAGE_EMOJIS;
    number <<= 1;
    number += this.MANAGE_WEBHOOKS;
    number <<= 1;
    number += this.MANAGE_ROLES;
    number <<= 1;
    number += this.MANAGE_NICKNAMES;
    number <<= 1;
    number += this.CHANGE_NICKNAME;
    number <<= 1;
    number += this.USE_VAD;
    number <<= 1;
    number += this.MOVE_MEMBERS;
    number <<= 1;
    number += this.DEAFEN_MEMBERS;
    number <<= 1;
    number += this.MUTE_MEMBERS;
    number <<= 1;
    number += this.SPEAK;
    number <<= 1;
    number += this.CONNECT;
    number <<= 1;
    number += this.VIEW_GUILD_INSIGHTS;
    number <<= 1;
    number += this.USE_EXTERNAL_EMOJIS;
    number <<= 1;
    number += this.MENTION_EVERYONE;
    number <<= 1;
    number += this.READ_MESSAGE_HISTORY;
    number <<= 1;
    number += this.ATTACH_FILES;
    number <<= 1;
    number += this.EMBED_LINKS;
    number <<= 1;
    number += this.MANAGE_MESSAGES;
    number <<= 1;
    number += this.SEND_TTS_MESSAGES;
    number <<= 1;
    number += this.SEND_MESSAGES;
    number <<= 1;
    number += this.VIEW_CHANNEL;
    number <<= 1;
    number += this.STREAM;
    number <<= 1;
    number += this.PRIORITY_SPEAKER;
    number <<= 1;
    number += this.VIEW_AUDIT_LOG;
    number <<= 1;
    number += this.ADD_REACTIONS;
    number <<= 1;
    number += this.MANAGE_GUILD;
    number <<= 1;
    number += this.MANAGE_CHANNELS;
    number <<= 1;
    number += this.ADMINISTRATOR;
    number <<= 1;
    number += this.BAN_MEMBERS;
    number <<= 1;
    number += this.KICK_MEMBERS;
    number <<= 1;
    number += this.CREATE_INSTANT_INVITE;

    return number;
  }

  addPermissions(permArray) {
    permArray.forEach((perm) => {
      if (typeof this[perm] === 'number') {
        this[perm] = 1;
      } else {
        throw new Error('Invalid permission given. ');
      }
    });
  }

  removePermissions(permArray) {
    permArray.forEach((perm) => {
      if (typeof this[perm] === 'number') {
        this[perm] = 0;
      } else {
        throw new Error('Invalid permission given. ');
      }
    });
  }
}

Permissions.allPermissions = 2147483647;

module.exports = Permissions;
