const WebSocket = require('ws');
const Requests = require('./src/Requests');
const globals = require('./src/globals');
const handler = require('./src/handler');

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
              $os: process.platform,
              $browser: process.argv[2].match(/(?<=-ua)(.+)/i).toString() || 'discord-module (https://www.npmjs.com/package/discord-module, 2.0)',
              $device: 'PC',
            },
          },
        }));
      };

      this.heartbeatInteval = setInterval(() => {
        this.gateway.send('{"op":1,"d":638}');
      }, 30000);
D
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

module.exports = Discord;
