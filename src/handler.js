const settings = require('./settings');
const User = require('../classes/User');
const Role = require('../classes/Role');
const Guild = require('../classes/Guild');

module.exports = (e) => {
  const { discord } = settings;
  const response = JSON.parse(e.data);

  if (response.t === 'READY') {
    discord.sessionId = response.d.session_id;

    settings.users[response.d.user.id] = new User(response.d.user);

    settings.user = settings.users[response.d.user.id];
  }

  if (response.t === 'GUILD_CREATE' || response.t === 'GUILD_UPDATE') {
    const guild = new Guild(response.d);

    settings.guilds[response.d.id] = guild;
  }

  if (response.t === 'GUILD_ROLE_UPDATE') {
    settings.guilds[response.d.guild_id].roles[response.d.role.id] = new Role(response.d.role);
  }

  if (response.t === 'MESSAGE_CREATE') {
    if (discord.onmessage) {
      discord.onmessage(response.d);
    }
  }
};
