const globals = require('../src/globals');
const User = require('./User');
const Role = require('./Role');
const Channel = require('./Channel');

class Guild {
  constructor(guild) {
    this.name = guild.name;
    this.id = guild.id;
    this.premium_tier = guild.premium_tier;
    this.icon = guild.icon;
    this.region = guild.region;
    this.banner = guild.banner;
    this.emojis = guild.emojis;
    this.max_video_channel_users = guild.max_video_channel_users;
    this.features = guild.features;
    this.mfa_level = guild.mfa_level;
    this.verification_level = guild.verification_level;
    this.preferred_locale = guild.preferred_locale;
    this.afk_channel_id = guild.afk_channel_id;
    this.unavailable = guild.unavailable;
    this.owner_id = guild.owner_id;
    this.system_channel_id = guild.system_channel_id;
    this.rules_channel_id = guild.rules_channel_id;
    this.member_count = guild.member_count;
    this.system_channel_flags = guild.system_channel_flags;
    this.presences = guild.presences; // with users
    this.explicit_content_filter = guild.explicit_content_filter;
    this.description = guild.description;
    this.large = guild.large;
    this.voice_states = guild.voice_states;
    this.afk_timeout = guild.afk_timeout;
    this.members = [];
    this.roles = [];
    this.channels = [];

    guild.roles.forEach((role) => {
      globals.roles[role.id] = new Role(role, this.id);
      this.roles[role.id] = globals.roles[role.id];

      if (role.name === '@everyone') {
        this.everyoneRole = globals.roles[role.id];
      }
    });

    if (guild.members) {
      guild.members.forEach((member) => {
        if (!globals.users[member.user.id]) {
          const user = new User(member.user);

          globals.users[member.user.id] = user;
        }

        this.members[member.user.id] = {
          ...member,
          user: globals.users[member.user.id],
          roles: member.roles.map((role) => this.roles[role]),
        };
      });
    }

    guild.channels.forEach((channel) => {
      globals.channels[channel.id] = new Channel(channel, this.id);
      this.channels[channel.id] = globals.channels[channel.id];
    });

    guild.presences.forEach((user) => {
      globals.users[user.user.id].setPresence(user);
    });
  }

  getChannelById(id) {
    return this.channels[id] || false;
  }

  getUserById(id) {
    return this.members[id] || false;
  }

  userHasRole(userId, roleId) {
    let hasRole = false;

    if (!this.members[userId]) {
      throw ReferenceError('User not found on this server');
    }

    this.members[userId].roles.forEach((role) => {
      if (role.id === roleId) {
        hasRole = true;
      }
    });

    return hasRole;
  }

  userIsAdmin(userId) {
    if (!this.members[userId]) {
      throw ReferenceError('User not found on this server');
    }

    return this.userHasPermissions(userId, ['ADMINISTRATOR']);
  }

  userHasPermissions(userId, permissions) {
    const permission = {};
    let isAdmin = false;

    if (!this.members[userId]) {
      throw ReferenceError('User not found on this server');
    }

    permissions.forEach((perm) => {
      this.members[userId].roles.forEach((role) => {
        if (role.permissions[perm]) {
          permission[perm] = true;
        } else if (role.permissions.ADMINISTRATOR) {
          isAdmin = true;
        }
      });
    });

    if (isAdmin) {
      return true;
    }

    let hasAll = Object.values(permission).length !== 0;

    Object.values(permission).forEach((perm) => {
      if (!perm) {
        hasAll = false;
      }
    });

    return hasAll;
  }

  userIsOwner(userId) {
    return this.owner_id === userId;
  }

  banUser(user, reason = '', deleteMessagesDays = 0, callback) {
    if (!this.userHasPermissions(globals.user.id, ['BAN_MEMBERS'])) {
      callback(7);
      return;
    }

    const id = user.id || user;
    globals.requests.banUser(this.id, id, deleteMessagesDays, reason, callback);
  }

  kickUser(user, callback) {
    if (!this.userHasPermissions(globals.user.id, ['KICK_MEMBERS'])) {
      callback(7);
      return;
    }

    const id = user.id || user;
    globals.requests.kickUser(this.id, id, callback);
  }

  updateUser(user) {
    globals.users[user.user.id] = new User(user.user);
    this.members[user.user.id] = {
      ...user,
      user: globals.users[user.user.id],
      roles: user.roles.map((role) => globals.roles[role]),
    };
  }

  userAddRoles(user, roles = [], callback = () => { }) {
    if (!this.userHasPermissions(globals.user.id, ['MANAGE_ROLES'])) {
      callback(7);
      return;
    }

    const userId = user.id || user;

    const userObj = this.members[userId];

    if (!userObj) {
      callback(false);
      return;
    }

    globals.requests.setRoles(this.id, userId, [
      ...userObj.roles.map((role) => role.id),
      ...roles,
    ], callback);
  }

  userRemoveRoles(user, roles = [], callback = () => { }) {
    if (!this.userHasPermissions(globals.user.id, ['MANAGE_ROLES'])) {
      callback(7);
      return;
    }

    const userId = user.id || user;

    const userObj = this.members[userId];

    if (!userObj) {
      callback(false);
    }

    const roless = userObj.roles.map((role) => role.id);

    roles.forEach((removeRole) => {
      roless.forEach((role, index) => {
        if (role === removeRole) {
          roless.splice(index, 1);
        }
      });
    });

    globals.requests.setRoles(this.id, userId, roless, callback);
  }

  createRole(name, permissions, color, hoist, mentionable, callback) {
    globals.requests.createRole({
      name,
      permissions,
      color,
      hoist,
      mentionable,
    }, this.id, (response) => {
      callback(new Role(response, this.id));
    });
  }

  createChannel(name, type, callback) {
    globals.requests.createChannel(this.id, {
      name,
      type,
    }, (response) => {
      callback(new Channel(response), this.id);
    });
  }
}

module.exports = Guild;
