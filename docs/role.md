# Role

## Values

- [Number] color
- [Boolean] hoist
- [Snowflake] id
- [Boolean] managed
- [Boolean] mentionable
- [Number] position
- [[Permissions](permissions.md)] permissions
- [String] name
- [Snowflake] guildId

## Methods

addPermissions(permissions): undefined

```javascript
role.addPermission(['ADMINISTRATOR', 'SEND_MESSAGES']);
```

removePermissions(permissions): undefined

```javascript
role.removePermission(['ADMINISTRATOR', 'SEND_MESSAGES']);
```

delete(callback): 204 no response

```javascript
role.removePermission((err) => {
  if (err) {
    console.log(err);
  }
});
```
