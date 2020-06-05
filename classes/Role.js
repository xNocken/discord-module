const settings = require('../src/settings');
const Permissions = require('./Permissions');

class Role {
  constructor(role, guildId) {
    this.color = role.color;
    this.hoist = role.hoist;
    this.id = role.id;
    this.managed = role.managed;
    this.mentionable = role.mentionable;
    this.position = role.position;
    this.permissions = new Permissions(role.permissions);
    console.log(role.permissions, this.permissions.getPermissionNumber());
    this.name = role.name;
    this.guildId = guildId;
  }

  update() {
    const { discord } = settings;
    const permissions = this.permissions.getPermissionNumber();

    discord.updateRole(this.guildId, this.id, {
      color: this.color,
      hoist: this.hoist,
      mentionable: this.mentionable,
      name: this.name,
      permissions,
    }, console.log);
  }

  addPermissions(permArray) {
    this.permissions.addPermissions(permArray);

    this.update();
  }

  removePermissions(permArray) {
    this.permissions.removePermissions(permArray);

    this.update();
  }
}

module.exports = Role;
