const globals = require('../src/globals');
const Message = require('./Message');
const User = require('./User');

class PrivateChannel {
  constructor(channel) {
    this.id = channel.id;
    this.last_message_id = channel.last_message_id;
    this.name = channel.name;
    this.recipients = {};
    this.type = channel.type;
    this.messageQueue = [];

    channel.recipients.forEach((user) => {
      if (!globals.users[user.id]) {
        globals.users[user.id] = new User(user);
      }

      this.recipients[user.id] = globals.users[user.id];
    });
  }

  getPermissionOverwrite() {
    return true;
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

  sendMessage(message, tts = false, callback = () => {}) {
    if (message.length < 1 || message.length > 2000) {
      callback(1);
      return;
    }

    if (this.type === PrivateChannel.types.GUILD_VOICE
      || this.type === PrivateChannel.types.GUILD_STORE) {
      callback(2);
      return;
    }

    this.messageQueue.push({ message, callback, tts });
    this.drainQueue();
  }

  getMessages(count = 50, callback = () => { }) {
    globals.requests.getMessages(this.id, count, (messages) => {
      if (messages) {
        callback(messages.map((message) => new Message(message)));
      }
    });
  }

  delete(callback = () => {}) {
    globals.requests.deleteChannel(this.id, callback);
  }
}

PrivateChannel.types = {
  GUILD_TEXT: 0,
  DM: 1,
  GUILD_VOICE: 2,
  GROUP_DM: 3,
  GUILD_CATEGORY: 4,
  GUILD_NEWS: 5,
  GUILD_STORE: 6,
};

module.exports = PrivateChannel;
