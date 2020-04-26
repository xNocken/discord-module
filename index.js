const request = require('request');
const WebSocket = require('ws');
const image2base64 = require('image-to-base64');

class Discord {
  constructor(authKey) {
    this.key = authKey;
  }
}

Discord.prototype.raw = function(content = '', url = '', method = 'post', callback = () => {}) {
  this.sendRequest(content, url, method, callback)
}

Discord.prototype.guildInfo = function(guild_id = '', callback = () => {}) {
  const url = `https://discordapp.com/api/v6/guilds/${guild_id}`;

  this.sendRequest('', url, 'GET', callback);
}

Discord.prototype.guildChannels = function(guild_id = '', callback = () => {}) {
  const url = `https://discordapp.com/api/v6/guilds/${guild_id}/channeös`;

  this.sendRequest('', url, 'GET', callback);
}

Discord.prototype.changeHypesquad = function(squadid = 1, callback = () => {}) {
  const url = "https://discordapp.com/api/v6/hypesquad/online";
  const body = {
    house_id: squadid,
  }

  this.sendRequest(JSON.stringify(body), url, 'POST', callback)
}

Discord.prototype.uploadEmoji = function(pathToEmoji = '', guild_id = '', emojiName = '', callback = function() {}) {
  image2base64(pathToEmoji).then(function(response) {
    const url = `https://discordapp.com/api/v6/guilds/${guild_id}/emojis`;
    const body = {
      image: 'data:image/png;base64,' + response,
      name: emojiName,
    }

    this.sendRequest(JSON.stringify(body), url, 'POST', callback);
  });
}

Discord.prototype.message = function(server = '', content = '', callback = () => {}) {
  if (!server) {
    console.error('Server is needed');
    return;
  }

  const body = {
    content: content,
    nonce: String(Math.random()),
    tts: 'false',
  }

  const url = `https://discordapp.com/api/v6/channels/${server}/messages`;

  this.sendRequest(JSON.stringify(body), url, 'POST', callback)
}

Discord.prototype.embed = function(server = '', embed = {}, callback = () => {}) {
  if (!server) {
    console.error('Server is needed');
    return;
  }

  const body = {
    nonce: String(Math.random()),
    tts: 'false',
    embed,
  }
  const url = `https://discordapp.com/api/v6/channels/${(server)}/messages`;

  this.sendRequest(JSON.stringify(body), url, 'POST', callback)
}

Discord.prototype.deleteMessage = function(channelId = '', messageId = '', callback = () => {}) {
  const url = `https://discordapp.com/api/v6/channels/${channelId}/messages/${ messageId } `;

  this.sendRequest('', url, 'DELETE', callback);
}

Discord.prototype.getMessages = function(server = '', count = 0, callback = () => {}) {
  const url = `https://discordapp.com/api/v6/channels/${server}/messages?limit=${count}`;

  this.sendRequest('', url, 'GET', callback);
}

Discord.prototype.typing = function(server = '') {
  const url = `https://discordapp.com/api/v6/channels/${server}/typing`;
  this.sendRequest('', url, 'POST')
}

Discord.prototype.invites = function(server = '', max_age = 0, max_uses = 0, temporary = false, callback = () => {}) {
  const body = {
    max_age,
    max_uses,
    temporary,
  }

  const url = `https://discordapp.com/api/v6/channels/${server}/invites`;

  this.sendRequest(JSON.stringify(body), url, 'POST', callback);
}

Discord.prototype.science = function(token = '', events = {}) {
  const body = {
    events,
    token,
  }

  this.sendRequest(JSON.stringify(body), 'https://discordapp.com/api/v6/science', 'POST');
}

Discord.prototype.changeRole = function(server = '', user = '', roles =[], callback = () => {}) {
  const url = `https://discordapp.com/api/v6/guilds/${server}/members/${user}`;
  this.sendRequest(JSON.stringify({ roles }), url, 'PATCH', callback)
}

Discord.prototype.  checkInvite = function(code = '', callback = () => { }) {
  const url = `https://discordapp.com/api/v6/invites/${code}`;
  this.sendRequest('', url, 'POST', callback)
}

Discord.prototype.getUserInfo = function(userId = '', callback = () => {}) {
  const url = `https://discordapp.com/api/v6/users/${userId} `;

  this.sendRequest('', url, 'GET', callback)
}

Discord.prototype.redeemCode = function(code = '', callback = () => { }) {
  const url = `https://discordapp.com/api/v6/entitlements/gift-codes/${code}/redeem`;

  this.sendRequest('{"channel_id":null,"payment_source_id":null}', url, 'POST', callback)
}

Discord.prototype.sendRequest = function(body = '', url = '', method = '', callback = () => {}) {
  var settings = {
    url,
    method,
    "headers": {
      "authorization": this.key,
      "Content-Type": "application/json",
    },
    body,
  }

  request(settings, function (err, res, body) {
    callback(body);
  });
}


Discord.prototype.connectGateway = function(onopen = () => {}, plattform = 'Windows') {
  this.gateway = new WebSocket('wss://gateway.discord.gg/');

  this.gateway.onopen = () => {
    this.gateway.send(`{"op":2,"d":{"token":"${this.key} ","properties":{"os":"${plattform} ","browser":"Chrome","device":"","browser_user_agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/81.0.4044.122 Safari/537.36","browser_version":"81.0.4044.122","os_version":"10","referrer":"https://discord.app/","referring_domain":"discord.app","referrer_current":"https://discord.app/","referring_domain_current":"discord.app","release_channel":"stable","client_build_number":58583,"client_event_source":null},"presence":{"status":"online","since":0,"activities":[],"afk":true},"compress":false}}`);

    setInterval(() => {
      this.gateway.send('{"op":1,"d":638}');
    }, 30000);
    onopen();
  };

  return this.gateway;
}

module.exports = Discord;
