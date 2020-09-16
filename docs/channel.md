# Channel

## Values

- [Snowflake] id
- [Snowflake] lastMessageId
- [String] name
- [Snowflake] parentId
- [Number] position
- [Number] rateLimitPerUser
- [String] topic
- [Number] type
- [Object -> [Permissions](./permissions.md)] permissionOverwrites
- [Snowflake] guildId

## Methods

getPermissionOverwrite(member): [Permissions](./permissions.md)

```javascript
message.getChannel().getPermissionOverwrite(discordModule.getGuildById(Snowflake).getMemberById(Snowflake));
```

createInvite(options, callback): Object

```javascript
const options = {
  max_age: 100, // seconds
  max_uses: 10,
  temporary: false,
  unique: false,
  target_user: '713465139377995867', // User id
  target_user_type: 0,
};

message.getChannel().createInvite(options, (invite) => {
  console.log(invite);
});
```

sendMessage(content, textToSpeech, attachment, callback): [Message](./message.md)

```javascript
message.getChannel().sendMessage('Content', false, (message) => {
  console.log(message);
});
```

sendMessageBody(body, callback): [Message](./message.md)

```javascript
const body = {
  content: 'Text',
  tts: false,
  file: file,
}

message.getChannel().sendMessage(body, (message) => {
  console.log(message);
});
```

getMessages(amount, before): Array -> [Message](./message.md)

```javascript
message.getChannel().getMessages(10, '723483706404241468', (messages) => {
  messages.forEach((messageGet) => {
    console.log(messageGet);
  });
});
```

getMessage(messageId, callback): [Message](./message.md)

```javascript
message.getChannel().getMessage('723483706404241468', (messageGet) => {
  console.log(messageGet);
});
```

delete(callback): [Channel](./channel.md)

```javascript
message.getChannel().delete((response) => {
  console.log(response)
});
```

typing(): undefined

```javascript
message.getChannel().typing();
```

## Set methods

- setName
- setPosition
- setType
- setTopic
- setNsfw
- setRateLimitPerUser
- setBitrate
- setUserLimit
- setPermissionOverwrites
- setParentId

retuns [Channel](./channel.md)

```javascript
message.getChannel().setName('new name', (channel) => {
  console.log(channel);
});
```

## Prototypes

Channel types

- GUILD_TEXT: 0
- DM: 1
- GUILD_VOICE: 2
- GROUP_DM: 3
- GUILD_CATEGORY: 4
- GUILD_NEWS: 5
- GUILD_STORE: 6

```javascript
message.getChannel().setType(Channel.types.GUILD_VOICE);
```
