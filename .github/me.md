# Me

## Values

- [Snowflake] id
- [String] username
- [String] avatar
- [Number] discriminator
- [[Flags](flags.md)] publicFlags
- [[Flags](flags.md)] flags
- [boolean] bot
- [String] email

## Methods

TODO

## Set Methods

setStatus([status](https://discord.com/developers/docs/rich-presence/how-to#updating-presence-update-presence-payload-fields), afk): undefined

```javascript
const status = {
   type:0,
   timestamps:{
      start:1591973514000,
   },
   state:"Waiting for match",
   party:{
      size:[
         1,
         4
      ],
      id:"6cbf55e526064c9dae5cd8d9d74ef323",
   },
   name:"Super nice game",
   id:"a41f539826f364d4",
   details:"SOLOOOOOOO",
   created_at:1591973532835,
   assets:{
      small_text:"Small picture",
      small_image:"443127519386927104",
      large_image: "Big Pictrue",
      large_image:"679093624100749331",
   },
   application_id:"432980957394370572",
};

discord.getUser().setStatus(status, false);
```

setGame(gameName): undefined

```javascript
discord.getUser().setGame('Super nice game');
```
