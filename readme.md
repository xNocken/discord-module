# Discord Module

## Requirements

- Node.js
- A Discord Account

## Installation

Use Yarn to add the Package
```bash
yarn add discord-module
```
or npm
```bash
npm i discord-module
```

## Usage
```javascript
const DiscordModule = require('discord-module');

const discord = new DiscordModule('Authorization token');

discord.message('Channel id', 'Message', callback);
```

If you use a Bot account you need to add
```javascript
discord.bot = true;
```

## Features

Send messages
```javascript
discord.message('Channel id', 'Message', callback);
```

Delete message
```javascript
discord.message('Channel id', 'Message id', callback);
```

Get Messages
```javascript
discord.getMessages('Channel id', Count, callback);
```

Get Server infos
```javascript
discord.guildInfo('Server id', callback);
```

Delete Channel
```javascript
discord.deleteChannel('Channel id', callback);
```

List all Channels in a Server
```javascript
discord.guildChannels('Server id', callback);
```

Change your Hypesquad
```javascript
discord.changeHypesquad('Hypesquad id', callback);
```

Upload emojis to your server
```javascript
discord.uploadEmoji('Path to emoji (works with local files and urls)', 'Server id', 'Emoji name', callback);
```

Set your avatar
```javascript
discord.setav('Path to image (works with local files and urls)', callback);
```

Add linked Accounts
```javascript
discord.fakecon('Account type', 'Account name', callback);
```

Send messages with [Embeds](https://discordapp.com/developers/docs/resources/channel#embed-object)
```javascript
discord.embed('Channel id', 'embed', callback);
```

Send a "Typing..." text
```javascript
discord.typing('Channel id', callback);
```

Get Channel info
```javascript
discord.channelInfo('Channel id', callback);
```

Create channel [Body content](https://discordapp.com/developers/docs/resources/guild#create-guild-channel)
```javascript
discord.message('Server id', { Message body }, callback);
```

Copy a channel
```javascript
discord.copyChannel('Server id', 'Channel id', callback);
```

Create an Invite
```javascript
discord.invites('Server id', Max age, max uses, Temporary = true/false, callback);
```

Send a science request
```javascript
discord.science('Token', {events});
```

Set user roles
```javascript
discord.changeRole('Server id', 'User id', [ Roles ], callback);
```

Check invites
```javascript
discord.checkInvite('Channel id', 'Message', callback);
```

Get user infos
```javascript
discord.getUserInfo('User id', callback);
```

Redeem a gift code
```javascript
discord.redeemCode('Code', callback);
```

React to Message
```javascript
discord.react('Channel id', 'Message id', 'Emoji (url encoded)',  callback);
```

Send a request that isnt build in
```javascript
discord.raw('Body (json)', 'Url (full url)', 'Method', callback);
```


## Gateway

You can open a gateway connection to discord with
```javascript
const gateway = discord.connectGateway(callback (triggers on open));
```

To recieve the messages from Discord just add
```javascript
gateway.onmessage = (e) => {
  const response = JSON.stringify(e.data);

  console.log(response);
};
```

If you want to send something you can use
```javascript
gateway.send('json');
```

You can find Many functions for the gateway [here](https://discordapp.com/developers/docs/topics/gateway)

I recomend adding this in the onmessage function 

```javascript
gateway.onmessage = (e) => {
  const response = JSON.stringify(e.data);

  discord.bot = response.d.user.bot;
};
```

## Contributing

if you have to use the raw function then i would be happy if you would add it or at least show it in an issue

## License
[MIT](https://choosealicense.com/licenses/mit/)
