# User

## Values

- [Snowflake] id
- [String] username
- [String] avatar
- [Number] discriminator
- [[Flags](flags.md)] publicFlags
- [[Flags](flags.md)] flags
- [Boolean] bot

## Methods

getPrivateChannelId(callback): Snowflake

```javascript
user.getPrivateChannelId((id) => {
  discord.getChannelById(id).sendMessage('Hello user :D');
});
```

getAccountCreateDate(): Date

```javascript
console.log(user.getAccountCreateDate());
```

## Static methods

getUserById(id, callback): [User](user.md)

```javascript
User.getUserById('713465139377995867', (user) => {
  console.log(user);
});
```
