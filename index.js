const WebSocket = require('ws');
const Requests = require('./src/Requests');
const globals = require('./src/globals');
const handler = require('./src/handler');
const User = require('./classes/User');

class Discord {
  constructor(authKey) {
    globals.discord = this;
    globals.requests = new Requests(authKey);
    this.key = authKey;
    this.sessionId = '';
    this.seq = 0;
    this.onmessage = null;

    globals.requests.getWSUrl((url) => {
      console.log(url);
      this.gateway = new WebSocket(url.url);

      this.gateway.onopen = () => {
        this.gateway.send(JSON.stringify({
          op: 2,
          d: {
            token: this.key,
            properties: {
              $os: 'windows',
              $browser: 'discord-module',
              $device: 'discord-module',
            },
          },
        }));
      };

      this.heartbeatInteval = setInterval(() => {
        this.gateway.send('{"op":1,"d":638}');
      }, 30000);

      this.gateway.onclose = console.log;

      this.gateway.onmessage = handler;
    });
  }

  getGuilds() {
    return globals.guilds;
  }

  getGuildById(id) {
    return globals.guilds[id] || false;
  }

  getUsers() {
    return globals.users;
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
