const globals = require('./globals');
const Me = require('../classes/Me');
const Role = require('../classes/Role');
const Guild = require('../classes/Guild');
const Channel = require('../classes/Channel');
const PrivateChannel = require('../classes/PrivateChannel');

const createGuild = (response) => {
  if (response.unavailable) {
    return;
  }

  const guild = new Guild(response);

  globals.guilds[response.id] = guild;
};

module.exports = (e) => {
  const { discord } = globals;
  const response = JSON.parse(e.data);
  console.log(response);

  if (response.t === 'READY') {
    discord.sessionId = response.d.session_id;

    globals.users[response.d.user.id] = new Me(response.d.user);

    response.d.guilds.forEach((guild) => {
      createGuild(guild);
    });

    response.d.private_channels.forEach((channel) => {
      globals.privateChannels[channel.id] = new PrivateChannel(channel);
    });

    globals.user = globals.users[response.d.user.id];
  }

  if (response.t === 'GUILD_CREATE' || response.t === 'GUILD_UPDATE') {
    createGuild(response.d);
  }

  if (response.t === 'CHANNEL_CREATE') {
    globals.channels[response.d.id] = new Channel(response.d);

    globals.guilds[response.d.guild_id].channels[response.d.id] = globals.channels[response.d.id];
  }

  if (response.t === 'GUILD_ROLE_UPDATE') {
    globals.guilds[response.d.guild_id].roles[response.d.role.id] = new Role(response.d.role);
  }

  if (response.t === 'PRESENCE_UPDATE') {
    if (globals.users[response.d.user.id]) {
      globals.users[response.d.user.id].setPresence(response.d);
    }
  }

  if (response.t === 'MESSAGE_CREATE') {
    const reply = (message, channelId) => {
      let channel = globals.channels[channelId || response.d.channel_id];

      if (!channel) {
        channel = globals.privateChannels[channelId || response.d.channel_id];
      }

      channel.sendMessage(message, console.log);
    };

    if (globals.discord.onmessage) {
      globals.discord.onmessage(response.d, reply);
    }
  }

  if (globals.events[response.t]) {
    globals.events[response.t](response.d);
  } else if (globals.events[response.op]) {
    globals.events[response.op](response.op);
  }
};