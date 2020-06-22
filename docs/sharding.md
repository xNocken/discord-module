# Sharding

## Usage

Sharding is used with the --shard and --shardmax attribute.

--shard: Current zero based index

--maxshards: count of all shards

## Example

```bash
node index.js --shard 0 --maxshards 5
node index.js --shard 1 --maxshards 5
node index.js --shard 2 --maxshards 5
node index.js --shard 3 --maxshards 5
node index.js --shard 4 --maxshards 5
```

Its easy to auto run all of them with a simple script

```javascript
const { exec } = require('child_process');

const shards = 5;

for (let i = 0; i < shards; i += 1) {
  exec(`node test.js --shard ${i} --maxshards ${shards}`, () => {});
}

```
