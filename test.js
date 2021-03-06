const fs = require('fs');

const Discord = require('./index');
const token = require('./token');

const { Message } = Discord;

const discord = new Discord({
  token,
});

discord.onmessage = (message = new Message(), reply) => {
  if (!message.author || message.author.bot) {
    return;
  }

  const args = message.content.split(' ');

  args.splice(0, 1);
  if (message.content === '#debug log') {
    console.log(discord.getGlobals());
  }

  if (message.content === '#close') {
    discord.getGlobals().discord.gateway.close();
  }

  if (message.content === '#empty') {
    reply('', message.channel.id, console.log);
  }

  if (message.content.startsWith('#status')) {
    discord.getUser().setGame(JSON.parse(message.content.split(' ').splice(1, 1000).join(' ')));
  }

  if (message.content.startsWith('#users disc')) {
    message.getChannel().typing();
    const discs = Array.from({ length: 10000 }).map(() => 0);

    Object.values(discord.getUsers()).forEach((user) => {
      discs[parseInt(user.discriminator, 10) % 5] += 1;
    });

    let messagee = '';

    discs.forEach((disc, index) => {
      if (disc) {
        messagee += `\n${index}: ${disc}`;
      }
    });

    reply(messagee);
  }

  if (message.content.startsWith('#numberspam')) {
    for (let i = 0; i < 100; i += 1) {
      reply(i.toString());
    }
  }

  if (message.content.startsWith('#users playing')) {
    const users = discord.getUsers();

    Object.entries(users).forEach((user) => {
      if (user && user.game && user.game.name.toLowerCase().match((message.content.split(' ')[2].toLowerCase()))) {
        reply(`<@!${user.id}>`);
      }
    });
  }

  if (message.content.startsWith('#spam')) {
    for (let i = 0; i < 10; i += 1) {
      reply('spam');
    }
  }

  if (message.content.startsWith('#kick')) {
    discord.getGuildById(message.channel.guildId).kickUser('4452', console.log);
  }

  if (message.content.startsWith('#deleteme')) {
    message.delete();
  }

  if (message.content.startsWith('#image')) {
    message.getChannel().sendMessage('', false, fs.createReadStream('testimage.png'), console.log);
  }

  if (message.content.startsWith('#invite')) {
    discord.getChannelById(args[0]).createInvite({}, (invite) => {
      if (invite === 7) {
        reply('No permissions');
      } else {
        reply(`https://discord.gg/${invite.code}`);
      }
    });
  }

  if (message.content.startsWith('#react')) {
    message.react(args[0].match(/([a-zA-Z]{1,}.\d{18})/) ? RegExp.$1 : args[0], (ok) => {
      if (ok) {
        reply(ok.message || ok);
      }
    });
  }

  if (message.content.startsWith('#crash')) {
    discord.gateway.send('fwef');
  }

  if (message.content.startsWith('#addrole')) {
    args.splice(0, 1)[0].match(/(\d{18})/);
    discord.getGuildById(message.channel.guildId).userAddRoles(RegExp.$1, args.map((role) => role.match(/\d{18}/)[0]), console.log);
  }

  if (message.content.startsWith('#privatechannelid')) {
    args.splice(0, 1)[0].match(/(\d{18})/);
    discord.getUserById(RegExp.$1).getPrivateChannelId(reply);
  }

  if (message.content.startsWith('#removerole')) {
    args.splice(0, 1)[0].match(/(\d{18})/);
    discord.getGuildById(message.channel.guildId).userRemoveRoles(RegExp.$1, args.map((role) => role.match(/\d{18}/)[0]), console.log);
  }

  if (message.content.startsWith('#typing')) {
    message.getChannel().typing();

    setTimeout(() => {
      reply('belastend');
    }, 3000);
  }

  if (message.content.startsWith('#users online')) {
    let online = 0;
    Object.values(discord.getUsers()).forEach((user) => {
      if (user.status) {
        online += 1;
      }
    });

    reply(`${online} von ${Object.values(discord.getUsers()).length}`);
  }

  if (message.content.startsWith('#edit')) {
    message.getChannel().getMessage(args[0], (messag) => {
      if (!messag.code) {
        messag.editMessage(args.splice(1, 1000).join(' '), console.log);
      } else {
        console.log(messag);
      }
    });
  }

  if (message.content.startsWith('#supressembed')) {
    message.getChannel().getMessage(args[0], (messag) => {
      messag.supressEmbed();
    });
  }

  if (message.content.startsWith('#messages')) {
    message.getChannel().getMessages(10, null, (messages) => {
      if (typeof messages === 'object') {
        messages.forEach((messag) => {
          reply(`${messag.author.username}: ${messag.content}`);
        });
      } else {
        reply(messages);
      }
    });
  }

  if (message.content.startsWith('#referenced')) {
    reply(JSON.stringify(message.referencedMessage));
  }
};

discord.onReady = (nice) => console.log(`Ready as ${nice.user.username}#${nice.user.discriminator} (${nice.user.id})`);
discord.onDisconnect = (close) => { console.log('Disconnect', close); };
discord.onResumed = () => { console.log('Resumed'); };
discord.onSessionInvalid = () => { console.log('Invalid session. Setting up new connection.'); };
