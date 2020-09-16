# Guild

## Values

- [String] name
- [Snowflake] id
- [Number] premium_tier
- [String] icon
- [String] region
- [String] banner
- [Array] emojis
- [Number] max_video_channel_users
- [Array] features
- [Number] mfa_level
- [Number] verification_level
- [String] preferred_locale
- [Snowflake] afk_channel_id
- [Boolean] unavailable
- [Snowflake] owner_id
- [Snowflake] system_channel_id
- [Snowflake] rules_channel_id
- [Number] member_count
- [Number] system_channel_flags
- [Array] presences
- [Number] explicit_content_filter
- [String] description
- [Boolean] large
- [Array] voice_states
- [Number] afk_timeout
- [Number] members
- [Object -> [Role](./role.md)] roles
- [Object -> [Channel](./channel.md)] channels

## Methods

getChannelById(channelId): [Channel](./channel.md)

```javascript
const channel = guild.getChannelById('715981804196069477');
```

getChannels(): Array -> [Channel](./channel.md)

```javascript
const channels = guild.getChannels();

channels.forEach(() => {});
```

getUserById(userId): Member

member.user = [User](./user.md)

```javascript
const member = guild.getUserById('713465139377995867');

console.log('roles', member.roles);
console.log('Username', member.user.username);
```

getUsers(): Array -> Member

member.user = [User](./user.md)

```javascript
const members = guild.getUsers();

members.forEach((member) => {
  console.log('roles', member.roles);
  console.log('Username', member.user.username);
})
```

userHasRole(userId, roleId): Boolean

```javascript
if (guild.userHasRole('713465139377995867', '704128785922129970')) {
  console.log('User has role :D');
}
```

userIsAdmin(userId): Boolean || Throws ReferenceError

```javascript
  if (guild.userIdAdmin('713465139377995867')) {
    console.log('User is admin :D');
  }
```

userIsOwner(userId): Boolean || Throws ReferenceError

```javascript
  if (guild.userIdOwner('713465139377995867')) {
    console.log('User is Owner :D');
  }
```

userHasPermissions(userId, permissions): Boolean || Throws ReferenceError

```javascript
  if (guild.userHasPermissions('713465139377995867', ['VIEW_CHANNEL', 'SEND_MESSAGES'])) {
    console.log('User has permissions :D');
  }
```

banUser(userId, reason, deleteMessageDays, callback): 204 Empty response

```javascript
guild.banUser('713465139377995867', 'Likes onions', 7, (response) => {
  console.log(response);
});
```

kickUser(userId, callback): 204 Empty response

```javascript
guild.kickUser('713465139377995867', (response) => {
  console.log(response);
});
```

userAddRoles(userId|user, roles, callback): 204 Empty response

```javascript
guild.userAddRoles(message.author || '713465139377995867', ['704128785922129970', '703455840933249034'], (response) => {
  console.log(response);
});
```

userRemoveRoles(userId|user, roles, callback): 204 Empty response

```javascript
guild.userRemoveRoles(message.author || '713465139377995867', ['704128785922129970', '703455840933249034'], (response) => {
  console.log(response);
});
```

createRole(name, permissions, color, hoist, mentionable, callback): [Role](role.md)

```javascript
const perms = new Permissions();

perms.addPermissions(['READ_MESSAGE_HISTORY', 'SEND_MESSAGES']);
guild.createRole('New role', perms.getPermissionNumber(), 0, true, false, (response) => {
  console.log(response);
});
```

createChannel(name, type, callback): [Channel](channel.md)

```javascript
guild.createChannel('Nice channel', Guild.types.GUILD_TEXT, (response) => {
  console.log(response);
});
```

## Set Methods

TODO
