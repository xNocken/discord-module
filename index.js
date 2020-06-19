const WebSocket = require('ws');
const yargs = require('yargs');
const Requests = require('./src/Requests');
const globals = require('./src/globals');
const handler = require('./src/handler');
const User = require('./classes/User');

process.argv = yargs.alias('help', 'h').argv;

class Discord {
  constructor(config) {
    globals.discord = this;
    globals.requests = new Requests(config.token);
    this.key = config.token;
    this.shard = config.shard || null;
    this.config = config;
    this.sessionId = '';
    this.seq = null;
    this.onmessage = null;

    this.gateway = this.createGateway();
  }

  createGateway(reconnect) {
    const handleDisconnect = (response) => {
      if (this.onDisconnect) {
        this.onDisconnect(response);
      }

      clearInterval(this.heartbeatIntevall);
      this.gateway = undefined;
      this.gateway = this.createGateway(response.code !== 1002);
    };

    globals.requests.getWSUrl((url) => {
      this.gateway = new WebSocket(url.url);

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
              properties: {
                $os: process.platform,
                $browser: process.argv.useragent || 'discord-module (https://www.npmjs.com/package/discord-module, 2.0)',
                $device: '',
              },
              ...this.config,
            },
          }));
        }
      };

      this.gateway.onmessage = handler;
      this.gateway.onclose = handleDisconnect;
      this.gateway.onerror = handleDisconnect;
    });
  }

  createKeepAlive(ms) {
    this.lastHeartbeat = (new Date()).getTime();
    this.gateway.send(`{"op":1,"d":${this.seq}}`);

    this.heartbeatInteval = setInterval(() => {
      if ((new Date()).getTime() - this.lastHeartbeat > ms) {
        this.lastHeartbeat = (new Date()).getTime();
        this.gateway.send(`{"op":1,"d":${this.seq}}`);
      }
    }, 1000);
  }

  getGuilds() {
    return globals.guilds;
  }

  getGuildById(id) {
    return globals.guilds[id] || false;
  }

  getChannels() {
    return globals.channels;
  }

  getChannelById(id) {
    return globals.channels[id] || globals.privateChannels[id] || false;
  }

  getUsers() {
    return globals.users;
  }

  getUserById(id) {
    return globals.users[id] || false;
  }

  getGlobals() {
    return globals;
  }

  getUser() {
    return globals.user;
  }

  on(event, callback) {
    if (!event || !callback) {
      return false;
    }

    globals.events[event] = callback;

    return true;
  }
}

Discord.User = User;

module.exports = Discord;
