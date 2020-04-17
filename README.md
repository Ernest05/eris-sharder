<div align="center">
  <img src="https://cdn.discordapp.com/attachments/318948997672992770/363798031771893761/Eris_Sharder_2.png" width="546" alt="eris-sharder" />
  <p>
    <a href="https://discord.gg/X63yXwM" target="_blank"><img src="https://discordapp.com/api/guilds/532201922690678784/embed.png" alt="Discord support server"></a>
  </p>
</div>

# About

Eris-sharder is a powerful sharding manager for the Discord Eris library. It uses Node.js's cluster module to spread shards evenly among all the cores.

# Installation and usage
## Download eris-sharder:
```md
# Installation using Yarn:
yarn add Ernest05/eris-sharder

# Installation using NPM:
npm install Ernest05/eris-sharder
```

To use eris-sharder, simply copy this code and place it in a file, in the same directory that you ran the npm install in:

```javascript
const { ClusterManager } = require('eris-sharder');
const sharder = new ClusterManager(token, pathToMainFile, options);
```

## Options:
<table>
  <tr>
    <td>Name</td>
    <td>Type</td>
    <td>Description</td>
    <td>Optional?</td>
  </tr>
  <tr>
    <td>token</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">String</a></td>
    <td>Your Discord bot token. Used to calculate to number of shards to spawn, and to log the bot on the Discord API.</td>
    <td>No</td>
  </tr>
  <tr>
    <td>pathToMainFile</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">String</a></td>
    <td>Path to your main bot file.</td>
    <td>No</td>
  </tr>
  <tr>
    <td>options</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">Object</a></td>
    <td>Object of ClusterManager options.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>options.name</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">String</a></td>
    <td>The name of your bot, to print it on startup. Default: eris-sharder.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>options.clientOptions</td>
    <td><a href="https://github.com/abalabahaha/eris/blob/27bb9cd02ae990606ab50b32ac186da53d8ca45a/index.d.ts#L733">ErisClientOptions</a></td>
    <td>Eris client options to assign to your bot.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>options.clusterCount</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a></td>
    <td>Total amount of clusters. Default: amount of cores on the processor.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>options.clusterTimeout</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a></td>
    <td>Number of milliseconds between starting up clusters. Values lower than 5000ms (5 seconds) may lead to an Invalid Session on first shard.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>options.shardCount</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a></td>
    <td>The total amount of shards. Default: the Discord gateway calculates how many shards the bot needs</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>options.guildsPerShard</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a></td>
    <td>The maximal amount of guilds on a shard. Default: 1000. Useless if the bot only has one shard.</td>
    <td>Yes</td>
  </tr>
  <tr>
    <td>options.firstShardID</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a></td>
    <td>The ID of the first shard. Default: 0.</td>
    <td>Yes</td>
  <tr>
  <tr>
    <td>options.lastShardID</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a></td>
    <td>The ID of the last shard. Default: options.shardCount - 1.</td>
    <td>Yes</td>
  <tr>
  <tr>
    <td>options.stats</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean">Boolean</a></td>
    <td>If enabled, it allows clusters & shards statistics output. Default: false.</td>
    <td>Yes</td>
  <tr>
  <tr>
    <td>options.statsInterval</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Number">Number</a></td>
    <td>If established, it will post clusters & shards statistics every amount of milliseconds you wish. Default: 60000ms (one minute).</td>
    <td>Yes</td>
  <tr>
  <tr>
    <td>options.debug</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Boolean">Boolean</a></td>
    <td>If enabled, it allows to enable debug logging. Default: false.</td>
    <td>Yes</td>
  <tr>
  <tr>
    <td>options.webhook</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object">Object</a></td>
    <td>If set, it enables to send clusters & shards logs by the way of a Discord webhook. Default: {}.</td>
    <td>Yes</td>
  <tr>
  <tr>
    <td>options.webhook.id</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">String</a></td>
    <td>The ID of the webhook.</td>
    <td>Only if you don't want to enabled webhook logging system.</td>
  <tr>
  <tr>
    <td>options.webhook.token</td>
    <td><a href="https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String">String</a></td>
    <td>The token of the webhook.</td>
    <td>Only if you don't want to enabled webhook logging system.</td>
  <tr>
</table>

# IPC
Eris-sharder supports a variety of IPC events. You can use them such as this:
```JS
process.send({
  type: 'event'
});
```

## Logging
eris-sharder supports the following IPC logging events:

<table>
  <tr>
    <td>Name</td>
    <td>Description</td>
    <td>Example</td>
  </tr>
  <tr>
    <td>log</td>
    <td>Sends a message in the console with default color (white).</td>
    <td><code>process.send({ name: 'log', msg: 'My message' });</code></td>
  </tr>
  <tr>
    <td>info</td>
    <td>Sends a message in the console with green color.</td>
    <td><code>process.send({ name: 'info', msg: 'My message' });</code></td>
  </tr>
  <tr>
    <td>warn</td>
    <td>Sends a message in the console with yellow color.</td>
    <td><code>process.send({ name: 'warn', msg: 'My message' });</code></td>
  </tr>
  <tr>
    <td>error</td>
    <td>Sends a message in the console with red color.</td>
    <td><code>process.send({ name: 'error', msg: 'My message' });</code></td>
  </tr>
  <tr>
    <td>debug</td>
    <td>Sends a message in the console with gray color (only works if debug property in the ClusterManager options object is set to true).</td>
    <td><code>process.send({ name: 'debug', msg: 'My message' });</code></td>
  </tr>
</table>

## Info
In every cluster when your code is loaded, if you extend the Base class you get access to `this.bot`, `this.clusterID`, and  `this.ipc`. `this.ipc` has a couple methods which you can find very useful.

<table>
  <tr>
    <td>Name</td>
    <td>Description</td>
    <td>Example</td>
  </tr>
  <tr>
    <td>register</td>
    <td>Using this you can register to listen for events and a callback that will handle them.</td>
    <td><code>this.ipc.register(event, callback);</code></td>
  </tr>
  <tr>
    <td>unregister</td>
    <td>Use this to unregister for an event.</td>
    <td><code>this.ipc.unregister(event);</code></td>
  </tr>
  <tr>
    <td>broadcast</td>
    <td>Using this you can send a custom message to every cluster.</td>
    <td><code>this.ipc.broadcast(name, message);</code></td>
  </tr>
  <tr>
    <td>sendTo</td>
    <td>Using this you can send a message to a specific cluster.</td>
    <td><code>this.ipc.sendTo(clusterID, name, message);</code></td>
  </tr>
  <tr>
    <td>fetchUser</td>
    <td>Using this you can get a user by his ID on all clusters.</td>
    <td><code>await this.ipc.fetchUser(userID);</code></td>
  </tr>
  <tr>
    <td>fetchGuild</td>
    <td>Using this you can get a guild by his ID on all clusters.</td>
    <td><code>await this.ipc.fetchGuild(guildID);</code></td>
  </tr>
  <tr>
    <td>fetchChannel</td>
    <td>Using this you can get a channel by his ID on all clusters.</td>
    <td><code>await this.ipc.fetchChannel(channelID);</code></td>
  </tr>
</table>

# Example
You can found an example bot to use eris-sharder at <a href="https://github.com/Ernest05/eris-sharder/tree/master/tests">/src/tests</a>.

# Start the script

```md
# Using node:
node sharder.js

# Using PM2:
pm2 start sharder.js --name sharder && pm2 logs sharder
```

# NOTICE

If you're using pm2, to run your script add the `-- --colors` flag to enable the colorful logging.
