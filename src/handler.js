const globals = require('./globals');
const Me = require('../classes/Me');
const Role = require('../classes/Role');
const Guild = require('../classes/Guild');
const Message = require('../classes/Message');
const Channel = require('../classes/Channel');
const PrivateChannel = require('../classes/PrivateChannel');
const User = require('../classes/User');

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

  discord.seq = response.s || discord.seq;

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

  if (response.t === 'CHANNEL_CREATE' || response.t === 'CHANNEL_UPDATE') {
    if (response.d.guild_id) {
      globals.channels[response.d.id] = new Channel(response.d, response.d.guild_id);

      globals.guilds[response.d.guild_id].channels[response.d.id] = globals.channels[response.d.id];
    } else {
      globals.privateChannels[response.d.id] = new PrivateChannel(response.d);
    }
  }

  if (response.t === 'GUILD_ROLE_UPDATE' || response.t === 'GUILD_ROLE_CREATE') {
    globals.roles[response.d.role.id] = new Role(response.d.role, response.d.guild_id);
    globals.guilds[response.d.guild_id].roles[response.d.role.id] = globals.roles[response.d.role.id];
  }

  if (response.t === 'GUILD_MEMBER_ADD') {
    globals.users[response.d.user.id] = new User(response.d.user);
    globals.guilds[response.d.guild_id].members[response.d.user.id] = {
      ...response.d,
      user: globals.users[response.d.user.id],
    };
  }

  if (response.t === 'GUILD_MEMBER_UPDATE') {
    globals.guilds[response.d.guild_id].updateUser(response.d);
  }

  if (response.t === 'PRESENCE_UPDATE') {
    if (globals.users[response.d.user.id]) {
      globals.users[response.d.user.id].setPresence(response.d);
    }
  }

  if (response.t === 'MESSAGE_CREATE') {
    const reply = (message, channelId, callback) => {
      let channel = globals.channels[channelId || response.d.channel_id];

      if (!channel) {
        channel = globals.privateChannels[channelId || response.d.channel_id];
      }

      channel.sendMessage(message, false, callback);
    };

    if (globals.discord.onmessage) {
      globals.discord.onmessage(new Message(response.d), reply);
    }
  }

  if (response.t === 'RESUMED') {
    if (discord.onResumed) {
      discord.onResumed(response);
    }
  }

  if (response.op === 9) {
    if (discord.onSessionInvalid) {
      discord.onSessionInvalid();
    }

    discord.gateway.close(1002);
  }

  if (response.op === 10) {
    discord.createKeepAlive(response.d.heartbeat_interval);
  }

  if (globals.events[response.t]) {
    globals.events[response.t](response.d);
  } else if (globals.events[response.op]) {
    globals.events[response.op](response.op);
  } else if (response.d && globals.events[response.d.nonce]) {
    globals.events[response.d.none](response.d);
  }
};
