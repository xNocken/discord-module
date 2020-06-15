const image2base64 = require('image-to-base64');
const request = require('request');
const globals = require('./globals');

const URL_REGEX = /https?:\/\/(\w+:?\w*@)?(\S+)(:\d+)?((?<=\.)\w+)+(\/([\w#!:.?+=&%@!\-/])*)?/gi;
const METHOD_REGEX = /(GET|PATCH|POST|PUT|DELETE)/gi;

const apiVersion = 6;
const apiUrl = `https://discordapp.com/api/v${apiVersion}`;
const profileUrl = `${apiUrl}/users/@me`;

class Requests {
  constructor(key) {
    this.key = key;
  }

  sendRequest(body = '', url = '', method = '', callback = () => {}) {
    if (!url || !method || !method.match(METHOD_REGEX) || !url.match(URL_REGEX)) {
      throw new TypeError('Invalid/No URL or method provided');
    }

    let headers = {};

    if (globals.user) {
      headers = {
        authorization: (globals.user.bot ? 'Bot ' : '') + this.key,
        'user-agent': 'discord-module (https://www.npmjs.com/package/discord-module, 2.0)',
      };
    }

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const requestSettings = {
      url,
      method,
      headers,
      body,
    };

    request(requestSettings, (err, res, bodyR) => callback(JSON.parse(bodyR || null), err));
  }

  getWSUrl(callback = () => {}) {
    this.sendRequest('', `${apiUrl}/gateway`, 'GET', callback);
  }

  banUser(guildId, userId, deleteMessageDays, reason, callback = () => {}) {
    this.sendRequest(JSON.stringify({ 'delete-message-days': deleteMessageDays, reason }), `${apiUrl}/guilds/${guildId}/bans/${userId}`, 'PUT', callback);
  }

  updateChannel(channelId, data, callback) {
    if (!channelId || !data || typeof channelId !== 'string' || typeof data !== 'object') {
      throw new TypeError('Invalid/No channelId or data provided');
    }

    this.sendRequest(JSON.stringify(data), `${apiUrl}/channels/${channelId}`, 'PATCH', callback);
  }

  guildInfo(guildId = '', callback = () => {}) {
    if (!guildId || typeof guildId !== 'string') {
      throw new TypeError('Invalid/No guildId provided');
    }

    this.sendRequest('', `${apiUrl}/guilds/${guildId}`, 'GET', callback);
  }

  deleteChannel(channelId = '', callback = () => {}) {
    if (!channelId || typeof channelId !== 'string') {
      throw new TypeError('Invalid/No channelId provided');
    }

    this.sendRequest('', `${apiUrl}/channels/${channelId}`, 'DELETE', callback);
  }

  guildChannels(guildId = '', callback = () => {}) {
    if (!guildId || typeof guildId !== 'string') {
      throw new TypeError('Invalid/No guildId provided');
    }

    this.sendRequest('', `${apiUrl}/guilds/${guildId}/channels`, 'GET', callback);
  }

  changeHypesquad(squadId = 0, callback = () => {}) {
    let method = 'POST';

    if (squadId === 0 || squadId === null) {
      method = 'DELETE';
    }

    const body = {
      house_id: squadId,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/hypesquad/online`, method, callback);
  }

  uploadEmoji(emojiPath = '', guildId = '', emojiName = '', callback = () => {}) {
    image2base64(emojiPath).then((response) => {
      const body = {
        image: `data:image/png;base64,${response}`,
        name: emojiName,
      };

      this.sendRequest(JSON.stringify(body), `${apiUrl}/guilds/${guildId}/emojis`, 'POST', callback);
    });
  }

  changeAvatar(url = '', callback = () => {}) {
    this.sendRequest('', profileUrl, 'GET', (body) => {
      const {
        email,
        username,
      } = JSON.parse(body);

      image2base64(url).then((response) => {
        const requestBody = JSON.stringify({
          email,
          username,
          password: '',
          avatar: `data:image/png;base64,${response}`,
        });

        this.sendRequest(requestBody, profileUrl, 'PATCH', callback);
      });
    });
  }

  sendMessage(channelId = '', content = '', tts = false, callback = () => {}) {
    if (!channelId || !content || typeof channelId !== 'string' || typeof content !== 'string') {
      throw new TypeError('Invalid/No channelId or content provided');
    }

    const body = {
      content,
      tts,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/channels/${channelId}/messages`, 'POST', callback);
  }

  embed(guildId = '', embed = {}, callback = () => {}) {
    if (!guildId || !embed || typeof guildId !== 'string' || typeof embed !== 'object') {
      throw new TypeError('Invalid/No guildId or embed provided');
    }

    const body = {
      nonce: String(Math.random()),
      tts: 'false',
      embed,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/channels/${guildId}/messages`, 'POST', callback);
  }

  deleteMessage(channelId = '', messageId = '', callback = () => {}) {
    if (!channelId || !messageId || typeof channelId !== 'string' || typeof messageId !== 'string') {
      throw new TypeError('Invalid/No channelId or messageId provided');
    }

    this.sendRequest('', `${apiUrl}/channels/${channelId}/messages/${messageId} `, 'DELETE', callback);
  }

  getMessages(guildId = '', count = 0, callback = () => {}) {
    if (!guildId || !count || typeof guildId !== 'string' || typeof count !== 'string') {
      throw new TypeError('Invalid/No guildId or count provided');
    }

    this.sendRequest('', `${apiUrl}/channels/${guildId}/messages?limit=${count}`, 'GET', callback);
  }

  typing(guildId = '', callback = () => {}) {
    if (!guildId || typeof guildId !== 'string') {
      throw new TypeError('Invalid/No guildId provided');
    }

    this.sendRequest('', `${apiUrl}/channels/${guildId}/typing`, 'POST', callback);
  }

  channelInfo(channelId = '', callback = () => {}) {
    this.sendRequest('', `${apiUrl}/channels/${channelId}`, 'GET', callback);
  }

  createChannel(guildId = '', body, callback = () => {}) {
    if (!guildId || typeof guildId !== 'string') {
      throw new TypeError('Invalid/No guildId provided');
    }

    this.sendRequest(body, `${apiUrl}/guilds/${guildId}/channels`, 'POST', callback);
  }

  copyChannel(guildId = '', channelId = '', callback = () => {}) {
    if (!guildId || !channelId || typeof guildId !== 'string' || typeof channelId !== 'string') {
      throw new TypeError('Invalid/No guildId or channelId provided');
    }

    this.channelInfo(channelId, (channelData) => {
      const channel = JSON.parse(channelData);

      delete channel.id;
      delete channel.last_message_id;

      this.createChannel(guildId, JSON.stringify(channel), callback);
    });
  }

  createInvite(guildId = '', options = {}, callback = () => {}) {
    const body = {
      max_age: 0,
      max_uses: 0,
      temporary: true,
      ...options,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/channels/${guildId}/invites`, 'POST', callback);
  }

  changeRole(guildId = '', user = '', roles = [], callback = () => {}) {
    this.sendRequest(JSON.stringify({
      roles,
    }), `${apiUrl}/guilds/${guildId}/members/${user}`, 'PATCH', callback);
  }

  checkInvite(code = '', callback = () => {}) {
    this.sendRequest('', `${apiUrl}/invites/${code}`, 'GET', callback);
  }

  getUserInfo(userId = '', callback = () => {}) {
    this.sendRequest('', `${apiUrl}/users/${userId}`, 'GET', callback);
  }

  redeemCode(code = '', callback = () => {}) {
    this.sendRequest('{"channel_id": null,"payment_source_id": null}', `${apiUrl}/entitlements/gift-codes/${code}/redeem`, 'POST', callback);
  }

  react(channelId = '', messageId = '', emoji = '', callback = () => {}) {
    this.sendRequest('', `${apiUrl}/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, 'PUT', callback);
  }

  updateRole(guildId, roleId, roleSettings, callback = () => {}) {
    this.sendRequest(JSON.stringify(roleSettings), `${apiUrl}/guilds/${guildId}/roles/${roleId}`, 'PATCH', callback);
  }
}

module.exports = Requests;
