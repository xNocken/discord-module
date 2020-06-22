# Message

## Values

- [[User](./user.md)] author
- [String] content
- [[Channel](./channel.md)] channel
- [Array] attachments
- [Date] edited
- [Date] time
- [Snowflake] id
- [Boolean] mentionEveryone
- [Array] mentionRoles
- [Array] mentionChannels
- [[MessageFlags](./messageFlags)] flags
- [Number] type
- [String] typeName
- [Snowflake] webhookId
- [MessageReference] messageReference
- [MessageApplication] application
- [MessageActivity] activity
- [Boolean] pinned

react(emoji, callback): 204 Empty response

```javascript
message.react('🚕', (error) => { // Standard emojis
  console.log(error);
});

message.react('dercoole:705848074349838439', (error) => { // Custom emojis
  console.log(error);
});
```

getChannel(): [Channel](./channel.md)

```javascript
const channel = message.getChannel();
```

suppressEmbed(callback): [Message](./message.md)

```javascript
message.supressEmbed((newMessage) => {
  console.log(newMessage.flags);
})
```

editMessage(content, callback): [Message](./message.md)

```javascript
message.editMessage('Better content', (newMessage) => {
  console.log(newMessage.content)
})
```

delete(callback): 204 No response

```javascript
message.delete((error) => {
  console.log(error);
});
```
