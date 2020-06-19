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
```

[More Infos to that](.github/gettingstarted.md)

## Features

[Channel](./.github/channel.md)

[Flags](./.github/flags.md)

[Guild](./.github/guild.md)

[Me](./.github/me.md)

[Message](./.github/message.md)

[MessageFlags](./.github/messageflags.md)

[Permissions](./.github/permissions.md)

[PrivateChannel](./.github/privatechannel.md)

[Role](./.github/role.md)

[User](./.github/user.md)

## Infos

[Errorcodes](.github/errorcodes.md)

## Contributing

If you want to contribute to this project you need to follow this rules:

- Eslint is required
- Every Function needs a test command in the test.js file
- Every Function needs to be added on the readme (or mention it in the pull request that its not in the readme)
- No console.logs in the project itself (you can use them in the test.js file)

## License

[MIT](https://choosealicense.com/licenses/mit/)
