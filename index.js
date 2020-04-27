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

Discord.prototype.deleteChannel = function(channel_id = '', callback = () => {}) {
  const url = `https://discordapp.com/api/v6/channels/${channel_id}`;

  this.sendRequest('', url, 'DELETE', callback);
}

Discord.prototype.guildChannels = function(guild_id = '', callback = () => {}) {
  const url = `https://discordapp.com/api/v6/guilds/${guild_id}/channels`;

  this.sendRequest('', url, 'GET', callback);
}

Discord.prototype.changeHypesquad = function(squadid = 1, callback = () => {}) {
  let method = 'POST';
  const url = "https://discordapp.com/api/v6/hypesquad/online";
  const body = {
    house_id: squadid,
  }
  if (squadid === 0) {
    method = 'DELETE';
  }

  this.sendRequest(JSON.stringify(body), url, method, callback)
}

Discord.prototype.uploadEmoji = function(pathToEmoji = '', guild_id = '', emojiName = '', callback = function() {}) {
  const thiss = this;
  image2base64(pathToEmoji).then(function(response) {
    const url = `https://discordapp.com/api/v6/guilds/${guild_id}/emojis`;
    const body = {
      image: 'data:image/png;base64,' + response,
      name: emojiName,
    }

    thiss.sendRequest(JSON.stringify(body), url, 'POST', callback);
  });
}

Discord.prototype.setav = function(link = '', callback = function() {}) {
  const thiss = this;
  thiss.sendRequest('', 'https://discordapp.com/api/v6/users/@me', 'GET', (body) => {
  const email = JSON.parse(body).email;
  const name = JSON.parse(body).username;
  image2base64(link).then(function(response) {
    const profile_url = 'https://discordapp.com/api/v6/users/@me';
    const body = JSON.stringify({
      "username": name,
      "email": email,
      "password":"",
      "avatar": 'data:image/png;base64,' + response
    });
    thiss.sendRequest(body, profile_url, 'PATCH');
  })
  })
}

Discord.prototype.fakecon = function(con = '', name = '', callback = () => {}) {
  const thiss = this;
  if(con === 'lol') con = 'leagueoflegends'; 
  let ID = Math.floor(Math.random() * 100000000000000000);
  thiss.sendRequest(`{"name": "${name}","visibility": 1}`, `https://discordapp.com/api/v6/users/@me/connections/${con}/${ID}`, 'PUT');
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

Discord.prototype.typing = function(server = '', callback = function(){}) {
  const url = `https://discordapp.com/api/v6/channels/${server}/typing`;
  this.sendRequest('', url, 'POST', callback)
}

Discord.prototype.channelInfo = function(channel = '', callback = function(){}) {
  const url = `https://discordapp.com/api/v6/channels/${channel}`;
  this.sendRequest('', url, 'GET', callback)
}

Discord.prototype.createChannel = function(server = '', body, callback = function(){}) {
  const url = `https://discordapp.com/api/v6/guilds/${server}/channels`;
  this.sendRequest(body, url, 'POST', callback);
}

Discord.prototype.copyChannel = function(server = '', channel_id = '', callback = function(){}) {
  this.channelInfo(channel_id, (channeldata) => {
    const channel = JSON.parse(channeldata);

    delete channel.id;
    delete channel.last_message_id;

    this.createChannel(server, JSON.stringify(channel), callback);
  })
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

  this.sendRequest('{"channel_id": null,"payment_source_id": null}', url, 'POST', callback);
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

  request(settings, function (err, res, bodyR) {
    callback(bodyR);
  });
}


Discord.prototype.connectGateway = function(onopen = () => {}) {
  this.gateway = new WebSocket('wss://gateway.discord.gg/');

  this.gateway.onopen = () => {
    this.gateway.send(JSON.stringify({
      "op": 2,
      "d": {
        "token": this.key,
        "properties": {
          "$os": "windows",
          "$browser": "Ie1",
          "$device": "Marcs freshes device"
        }
      }
    }));

    setInterval(() => {
      this.gateway.send('{"op":1,"d":638}');
    }, 30000);
    onopen();
  };

  return this.gateway;
}

module.exports = Discord;
