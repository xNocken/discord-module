const WebSocket = require('ws');
const Requests = require('./src/Requests');
const globals = require('./src/globals');
const handler = require('./src/handler');

class Discord extends Requests {
  constructor(authKey) {
    super();
    globals.discord = this;
    this.key = authKey;
    this.bot = false;
    this.sessionId = '';
    this.seq = 0;
    this.onmessage = null;

    this.gateway = new WebSocket('wss://gateway.discord.gg/');
    this.gateway.onopen = () => {
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
    };

    this.heartbeatInteval = setInterval(() => {
      this.gateway.send('{"op":1,"d":638}');
    }, 30000);

    this.gateway.onmessage = handler;
  }

  getGuilds() {
    return globals.guilds;
  }
}

module.exports = Discord;
