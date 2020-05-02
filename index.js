const request = require('request');
const WebSocket = require('ws');
const image2base64 = require('image-to-base64');

const apiVersion = 6;
const apiUrl = `https://discordapp.com/api/v${apiVersion}`;
const profileUrl = `${apiUrl}/users/@me`;

const Discord = class {
  constructor(authKey) {
    this.key = authKey;
    this.bot = false;
    this.sessionId = '';
    this.seq = 0;
  }
};

Discord.prototype.raw = function (content = '', url = '', method = 'POST', callback = () => {}) {
  this.sendRequest(content, url, method, callback);
};

Discord.prototype.guildInfo = function (guildId = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/guilds/${guildId}`, 'GET', callback);
};

Discord.prototype.deleteChannel = function (channelId = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/channels/${channelId}`, 'DELETE', callback);
};

Discord.prototype.guildChannels = function (guildId = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/guilds/${guildId}/channels`, 'GET', callback);
};

Discord.prototype.changeHypesquad = function (squadId = 1, callback = () => {}) {
  let method = 'POST';
  const body = {
    house_id: squadId,
  };

  if (squadId === 0) {
    method = 'DELETE';
  }

  this.sendRequest(JSON.stringify(body), `${apiUrl}/hypesquad/online`, method, callback);
};

Discord.prototype.uploadEmoji = function (pathToEmoji = '', guildId = '', emojiName = '', callback = () => {}) {
  image2base64(pathToEmoji).then((response) => {
    const body = {
      image: `data:image/png;base64,${response}`,
      name: emojiName,
    };

    this.sendRequest(JSON.stringify(body), `${apiUrl}/guilds/${guildId}/emojis`, 'POST', callback);
  });
};

Discord.prototype.setav = function (link = '', callback = () => {}) {
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
};

Discord.prototype.fakecon = function (theCon = '', name = '', callback = () => {}) {
  const id = Math.floor(Math.random() * 100000000000000000);
  let con = theCon;

  if (con === 'lol') {
    con = 'leagueoflegends';
  }

  this.sendRequest(`{"name": "${name}","visibility": 1}`, `${profileUrl}/connections/${con}/${id}`, 'PUT', callback);
};

Discord.prototype.message = function (server = '', content = '', callback = () => {}) {
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
};

Discord.prototype.embed = function (server = '', embed = {}, callback = () => {}) {
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
};

Discord.prototype.deleteMessage = function (channelId = '', messageId = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/channels/${channelId}/messages/${messageId} `, 'DELETE', callback);
};

Discord.prototype.getMessages = function (server = '', count = 0, callback = () => {}) {
  this.sendRequest('', `${apiUrl}/channels/${server}/messages?limit=${count}`, 'GET', callback);
};

Discord.prototype.typing = function (server = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/channels/${server}/typing`, 'POST', callback);
};

Discord.prototype.channelInfo = function (channelId = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/channels/${channelId}`, 'GET', callback);
};

Discord.prototype.createChannel = function (server = '', body, callback = () => {}) {
  this.sendRequest(body, `${apiUrl}/guilds/${server}/channels`, 'POST', callback);
};

Discord.prototype.copyChannel = function (server = '', channelId = '', callback = () => {}) {
  this.channelInfo(channelId, (channelData) => {
    const channel = JSON.parse(channelData);

    delete channel.id;
    delete channel.last_message_id;

    this.createChannel(server, JSON.stringify(channel), callback);
  });
};

Discord.prototype.invites = function (server = '', max_age = 0, max_uses = 0, temporary = false, callback = () => {}) {
  const body = {
    max_age,
    max_uses,
    temporary,
  };

  this.sendRequest(JSON.stringify(body), `${apiUrl}/channels/${server}/invites`, 'POST', callback);
};

Discord.prototype.science = function (token = '', events = {}) {
  const body = {
    events,
    token,
  };

  this.sendRequest(JSON.stringify(body), `${apiUrl}/science`, 'POST');
};

Discord.prototype.changeRole = function (server = '', user = '', roles = [], callback = () => {}) {
  this.sendRequest(JSON.stringify({ roles }), `${apiUrl}/guilds/${server}/members/${user}`, 'PATCH', callback);
};

Discord.prototype.checkInvite = function (code = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/invites/${code}`, 'POST', callback);
};

Discord.prototype.getUserInfo = function (userId = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/users/${userId}`, 'GET', callback);
};

Discord.prototype.redeemCode = function (code = '', callback = () => {}) {
  this.sendRequest('{"channel_id": null,"payment_source_id": null}', `${apiUrl}/entitlements/gift-codes/${code}/redeem`, 'POST', callback);
};

Discord.prototype.react = function (channelId = '', messageId = '', emoji = '', callback = () => {}) {
  this.sendRequest('', `${apiUrl}/channels/${channelId}/messages/${messageId}/reactions/${emoji}/@me`, 'PUT', callback);
};

Discord.prototype.sendRequest = function (body = '', url = '', method = '', callback = () => {}) {
  const headers = {
    authorization: (this.bot ? 'Bot ' : '') + this.key,
  };

  if (body) {
    headers['Content-Type'] = 'application/json';
  }

  const settings = {
    url,
    method,
    headers,
    body,
  };

  request(settings, (err, res, bodyR) => callback(bodyR, err));
};

Discord.prototype.connectGateway = function (onopen = () => {}, reconnect = false) {
  this.gateway = new WebSocket('wss://gateway.discord.gg/');

  this.gateway.onopen = () => {
    if (reconnect) {
      this.gateway.send(JSON.stringify({
        op: 6,
        d: {
          token: this.key,
          session_id: this.sessionId,
          seq: this.seq,
        },
      }));
    } else {
      this.gateway.send(JSON.stringify({
        op: 2,
        d: {
          token: this.key,
          properties: {
            $os: 'windows',
            $browser: 'Ie1',
            $device: 'Marcs freshes device',
          },
        },
      }));
    }

    this.heartbeatIntevall = setInterval(() => {
      this.gateway.send('{"op":1,"d":638}');
    }, 30000);
    onopen();
  };

  return this.gateway;
};

module.exports = Discord;
