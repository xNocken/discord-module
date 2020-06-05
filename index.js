const WebSocket = require('ws');
const Requests = require('./src/Requests');
const settings = require('./src/settings');
const handler = require('./src/handler');

class Discord extends Requests {
  constructor(authKey) {
    super();
    settings.discord = this;
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
    return settings.guilds;
  }
}

module.exports = Discord;
