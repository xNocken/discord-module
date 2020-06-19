# Getting Started

Import the module and create an instance of it

```javascript
const DiscordModule = require('discord-module');

const options = {
  token: 'your token',
};

const discord = new DiscordModule(options);
```

Now you can do whatever you want

## Getting the user

```javascript
const user = discord.getUser();
```

## Getting all Guilds

```javascript
const guilds = discord.getGuilds();
```

## Gettings a specific guild

```javascript
const guild = discord.getGuildById(guildId)
```

## Gettings users

```javascript
const guild = discord.getUsers()
```

## Getting specific users

```javascript
const guild = discord.getGuildById(guildId)
```

## Listen on messages

```javascript
discord.onMessage = (message, reply) => {
  if (message.content === 'Say Hi') {
    reply('Hi');
  }
}
```

## Listen on gateway events

```javascript
discord.on('GUILD_CREATE', (guildData) => {
  console.log('new guild', guildData.name)
});
```

## Create gateway state listener

```javascript
discord.onDisconnect = (close) => { console.log('Disconnect', close); };
discord.onResumed = () => { console.log('Resumed'); };
discord.onSessionInvalid = () => { console.log('Invalid session. Setting up new connection.'); };
```
