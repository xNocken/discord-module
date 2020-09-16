# PrivateChannel

## Values

- id
- last_message_id
- name
- recipients
- type

## Methods

sendMessage(content, textToSpeech, attachment, callback): [Message](./message.md)

```javascript
message.getChannel().sendMessage('Content', false, (message) => {
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

## Prototypes

Channel types

- GUILD_TEXT: 0
- DM: 1
- GUILD_VOICE: 2
- GROUP_DM: 3
- GUILD_CATEGORY: 4
- GUILD_NEWS: 5
- GUILD_STORE: 6
