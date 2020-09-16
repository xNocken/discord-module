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
      const callback = (response, err) => {
        if (err) {
          message.callback(err);
        } else if (response.retry_after) {
          this.messageQueue.unshift(message);
        } else if (!response.message) {
          message.callback(new Message(response));
        } else {
          message.callback(response);
        }

        if (!this.messageQueue.length) {
          this.isDraining = false;
          return;
        }

        setTimeout(() => {
          send(this.messageQueue.shift());
        }, (response.retry_after || 0) + 850);
      };

      if (typeof message.message === 'object') {
        await globals.requests.sendEmbed(this.id, message.message, message.tts, callback);
      } else if (message.attachment !== null) {
        await globals.requests.sendAttachment(this.id, message.message, message.attachment, callback);
      } else if (message.message !== undefined) {
        await globals.requests.sendMessage(this.id, message.message, message.tts, callback);
      } else if (message.body) {
        await globals.requests.sendMessageBody(this.id, message.body, callback);
      } else {
        message.callback({ error: true, message: 'Invalid message' });
      }
    };

    send(this.messageQueue.shift());
  }

  sendMessage(message, tts = false, attachment = null, callback = () => { }) {
    if ((message.length < 1 || message.length > 2000) && !attachment) {
      callback(1);
      return;
    }

    if (this.type === PrivateChannel.types.GUILD_VOICE
      || this.type === PrivateChannel.types.GUILD_STORE) {
      callback(2);
      return;
    }

    if (typeof message === 'object') {
      this.messageQueue.push({
        message,
        callback,
        tts,
      });
    } else {
      const messageSplit = message.split('');

      do {
        this.messageQueue.push({
          message: messageSplit.splice(0, 1999).join(''),
          callback,
          tts,
          attachment,
        });
      } while (messageSplit.length > 1);
    }

    this.drainQueue();
  }

  getMessages(count = 50, callback = () => { }) {
    globals.requests.getMessages(this.id, count, (messages) => {
      if (messages) {
        callback(messages.map((message) => new Message(message)));
      }
    });
  }

  delete(callback = () => { }) {
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
