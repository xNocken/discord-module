const image2base64 = require('image-to-base64');
const request = require('request');
const globals = require('./globals');

const apiVersion = 6;
const apiUrl = `https://discordapp.com/api/v${apiVersion}`;
const profileUrl = `${apiUrl}/users/@me`;

class Requests {
  sendRequest(body = '', url = '', method = '', callback = () => { }) {
    const headers = {
      authorization: (globals.user.bot ? 'Bot ' : '') + this.key,
      'user-agent': 'discord-module (https://www.npmjs.com/package/discord-module, 2.0)',
    };

    if (body) {
      headers['Content-Type'] = 'application/json';
    }

    const requestSettings = {
      url,
      method,
      headers,
      body,
    };

    request(requestSettings, (err, res, bodyR) => callback(JSON.parse(bodyR), err));
  }

  raw(content = '', url = '', method = 'POST', callback = () => { }) {
    this.sendRequest(content, url, method, callback);
  }

  updateChannel(channelId, data, callback) {
    this.sendRequest(JSON.stringify(data), `${apiUrl}/channels/${channelId}`, 'PATCH', callback);
  }

  guildInfo(guildId = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/guilds/${guildId}`, 'GET', callback);
  }

  deleteChannel(channelId = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/channels/${channelId}`, 'DELETE', callback);
  }

  guildChannels(guildId = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/guilds/${guildId}/channels`, 'GET', callback);
  }

  changeHypesquad(squadId = 1, callback = () => { }) {
    let method = 'POST';
    const body = {
      house_id: squadId,
    };

    if (squadId === 0) {
      method = 'DELETE';
    }

    this.sendRequest(JSON.stringify(body), `${apiUrl}/hypesquad/online`, method, callback);
  }

  uploadEmoji(pathToEmoji = '', guildId = '', emojiName = '', callback = () => { }) {
    image2base64(pathToEmoji).then((response) => {
      const body = {
        image: `data:image/png;base64,${response}`,
        name: emojiName,
      };

      this.sendRequest(JSON.stringify(body), `${apiUrl}/guilds/${guildId}/emojis`, 'POST', callback);
    });
  }

  setav(link = '', callback = () => { }) {
    this.sendRequest('', profileUrl, 'GET', (body) => {
      const { email, username } = JSON.parse(body);

      image2base64(link).then((response) => {
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

  fakecon(theCon = '', name = '', callback = () => { }) {
    const id = Math.floor(Math.random() * 100000000000000000);
    let con = theCon;

    if (con === 'lol') {
      con = 'leagueoflegends';
    }

    this.sendRequest(`{"name": "${name}","visibility": 1}`, `${profileUrl}/connections/${con}/${id}`, 'PUT', callback);
  }

  message(server = '', content = '', callback = () => { }) {
    if (!server) {
      console.error('Server is needed');

      return;
    }

    const body = {
      content,
      nonce: String(Math.random()),
      tts: 'false',
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/channels/${server}/messages`, 'POST', callback);
  }

  embed(server = '', embed = {}, callback = () => { }) {
    if (!server) {
      console.error('Server is needed');

      return;
    }

    const body = {
      nonce: String(Math.random()),
      tts: 'false',
      embed,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/channels/${(server)}/messages`, 'POST', callback);
  }

  deleteMessage(channelId = '', messageId = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/channels/${channelId}/messages/${messageId} `, 'DELETE', callback);
  }

  getMessages(server = '', count = 0, callback = () => { }) {
    this.sendRequest('', `${apiUrl}/channels/${server}/messages?limit=${count}`, 'GET', callback);
  }

  typing(server = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/channels/${server}/typing`, 'POST', callback);
  }

  channelInfo(channelId = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/channels/${channelId}`, 'GET', callback);
  }

  createChannel(server = '', body, callback = () => { }) {
    this.sendRequest(body, `${apiUrl}/guilds/${server}/channels`, 'POST', callback);
  }

  copyChannel(server = '', channelId = '', callback = () => { }) {
    this.channelInfo(channelId, (channelData) => {
      const channel = JSON.parse(channelData);

      delete channel.id;
      delete channel.last_message_id;

      this.createChannel(server, JSON.stringify(channel), callback);
    });
  }

  invites(server = '', max_age = 0, max_uses = 0, temporary = false, callback = () => { }) {
    const body = {
      max_age,
      max_uses,
      temporary,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/channels/${server}/invites`, 'POST', callback);
  }

  science(token = '', events = {}) {
    const body = {
      events,
      token,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/science`, 'POST');
  }

  changeRole(server = '', user = '', roles = [], callback = () => { }) {
    this.sendRequest(JSON.stringify({ roles }), `${apiUrl}/guilds/${server}/members/${user}`, 'PATCH', callback);
  }

  checkInvite(code = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/invites/${code}`, 'POST', callback);
  }

  getUserInfo(userId = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/users/${userId}`, 'GET', callback);
  }

  redeemCode(code = '', callback = () => { }) {
    this.sendRequest('{"channel_id": null,"payment_source_id": null}', `${apiUrl}/entitlements/gift-codes/${code}/redeem`, 'POST', callback);
  }

  react(channelId = '', messageId = '', emoji = '', callback = () => { }) {
    this.sendRequest('', `${apiUrl}/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, 'PUT', callback);
  }

  updateRole(guildId, roleId, roleSettings, callback = () => {}) {
    this.sendRequest(JSON.stringify(roleSettings), `${apiUrl}/guilds/${guildId}/roles/${roleId}`, 'PATCH', callback);
  }
}

module.exports = Requests;
