# Discord Module

Discord module is made to make bots very simple. You can send messages, create channels and everything else you need. If you need something we doesnt have, create an issue and let us know

## Requirements

- [Node.js](https://nodejs.org)
- [A Discord Bot](https://discord.com/developers/applications)

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

const options = {
  token: 'Authorization token',
};

const discord = new DiscordModule(options);

discord.message('Channel id', 'Message', callback);
```

## Features



## License
[MIT](https://choosealicense.com/licenses/mit/)
