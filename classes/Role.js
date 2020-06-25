const globals = require('../src/globals');
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
    this.name = role.name;
    this.guildId = guildId;
  }

  update() {
    const { discord } = globals;
    const permissions = this.permissions.getPermissionNumber();

    discord.requests.updateRole(this.guildId, this.id, {
      color: this.color,
      hoist: this.hoist,
      mentionable: this.mentionable,
      name: this.name,
      permissions,
    });

    // TODO: Success validation
  }

  addPermissions(permArray) {
    this.permissions.addPermissions(permArray);

    this.update();
  }

  removePermissions(permArray) {
    this.permissions.removePermissions(permArray);

    this.update();
  }

  delete(callback) {
    globals.requests.deleteRole(this.guildId, this.id, callback);
  }
}

module.exports = Role;
