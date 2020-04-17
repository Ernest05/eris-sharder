'use strict';

const { inspect } = require('util');
const { Client } = require('eris');
const { yellow, green, red } = {
    yellow: 0xE7E108,
    green: 0x0DD330,
    red: 0xF32C2A
};
const getDate = require('../utils/getDate');
const ErisBaseClient = require('../structures/ErisBaseClient.js');

/**
 * Cluster class
 * @class Cluster
 * @extends {EventEmitter}
 */
module.exports = class Cluster {
    /**
     * Creates an instance of Cluster.
     * @constructor
     * @property {number} shards The total amount of shards
     * @property {number} maxShards The maximal amount of shards
     * @property {number} firstShardID The ID of the first shard
     * @property {number} lastShardID The ID of the last shard
     * @property {string | null} mainFile The path to the main bot file
     * @property {number} clusterID The ID of the concerned cluster
     * @property {number} clusterCount The maximal amount of clusters
     * @property {number} guilds The total amount of guilds
     * @property {number} users The total amount of users
     * @property {number} uptime The global uptime of the bot
     * @property {number} exclusiveGuilds The total amount of exclusive guilds
     * @property {number} largeGuilds The total amount of large guilds
     * @property {number} voiceChannel The total amount of joined voice channels
     * @property {Array} shardsStats Shards statistics
     * @property {Object} App Bot application file
     * @property {Client} bot The Eris client
     * @property {boolean} test
     */
    constructor () {
        this.shards = 0;
        this.maxShards = 0;
        this.firstShardID = 0;
        this.lastShardID = 0;
        this.mainFile = null;
        this.clusterID = 0;
        this.clusterCount = 0;
        this.guilds = 0;
        this.users = 0;
        this.uptime = 0;
        this.exclusiveGuilds = 0;
        this.largeGuilds = 0;
        this.voiceChannels = 0;
        this.shardsStats = [];
        this.App = null;
        this.bot = null;
        this.test = false;

        console.log = (...message) => process.send({
            name: 'log',
            msg: this.convertString(message)
        });
        console.error = (...message) => process.send({
            name: 'error',
            msg: this.convertString(message)
        });
        console.warn = (...message) => process.send({
            name: 'warn',
            msg: this.convertString(message)
        });
        console.info = (...message) => process.send({
            name: 'info',
            msg: this.convertString(message)
        });
        console.debug = (...message) => process.send({
            name: 'debug',
            msg: this.convertString(message)
        });
    }

    /**
     * Converts objects to strings
     * @param {string | Object} message The message to send in the console
     * @returns {string} The message in string format
     */
    convertString (message) {
        switch (typeof message) {
            case 'object': {
                return inspect(message);
            }

            case 'string': {
                return message;
            }
        }
    }

    /**
     * Spawns a cluster
     * @returns {void}
     */
    spawn () {
        process.on('uncaughtException', error => {
            process.send({
                name: 'error',
                msg: error.stack
            });
        });
        process.on('unhandledRejection', (reason, p) => {
            process.send({
                name: 'error',
                msg: `Unhandled rejection at: Promise ${p} reason: ${reason.stack}`
            });
        });
        process.on('message', message => {
            if (message.name) {
                switch (message.name) {
                    case 'connect': {
                        this.firstShardID = message.firstShardID;
                        this.lastShardID = message.lastShardID;
                        this.mainFile = message.file;
                        this.clusterID = message.id;
                        this.clusterCount = message.clusterCount;
                        this.shards = (this.lastShardID - this.firstShardID) + 1;
                        this.maxShards = message.maxShards;

                        if (this.shards < 1) {
                            return;
                        }
                        if (message.test) {
                            this.test = true;
                        }

                        return this.connect(message.firstShardID, message.lastShardID, this.maxShards, message.token, 'connect', message.clientOptions, message.game);
                    }

                    case 'stats': {
                        return process.send({
                            name: 'stats',
                            stats: {
                                guilds: this.guilds,
                                users: this.users,
                                uptime: this.uptime,
                                ram: process.memoryUsage().rss,
                                shards: this.shards,
                                exclusiveGuilds: this.exclusiveGuilds,
                                largeGuilds: this.largeGuilds,
                                voice: this.voiceChannels,
                                shardsStats: this.shardsStats
                            }
                        });
                    }

                    case 'fetchUser': {
                        const userID = message.value;
                        const user = this.bot.users.get(userID);

                        if (user) {
                            return process.send({
                                name: 'fetchReturn',
                                value: user
                            });
                        }

                        return;
                    }

                    case 'fetchChannel': {
                        const channelID = message.value;
                        const channel = this.bot.getChannel(channelID);

                        if (channel) {
                            return process.send({
                                name: 'fetchReturn',
                                value: channel
                            });
                        }

                        return;
                    }

                    case 'fetchGuild': {
                        const guildID = message.value;
                        const guild = this.bot.guilds.get(guildID);

                        if (guild) {
                            return process.send({
                                name: 'fetchReturn',
                                value: guild
                            });
                        }

                        return;
                    }

                    case 'fetchReturn': {
                        return this.ipc.emit(message.id, message.value);
                    }

                    case 'restart': {
                        return process.exit(1);
                    }
                }
            }
        });
    }

    /**
     * Connects a cluster
     * @param {number} firstShardID The ID of the first shard
     * @param {number} lastShardID The ID of the last shard
     * @param {number} maxShards The maximal amout of shards
     * @param {string} token The bot token
     * @param {*} type Any
     * @param {Object} clientOptions Eris client options
     * @param {string} game Game to set on the bot
     * @returns {void}
     */
    connect (firstShardID, lastShardID, maxShards, token, type, clientOptions, game) {
        process.send({
            name: 'warn',
            msg: `Trying to connect ${this.shards} shard(s)...`
        });
        process.send({
            name: 'webhook',
            embeds: [{
                color: yellow,
                title: 'Shard',
                description: `Trying to connect ${this.shards} shard(s) on cluster ${this.clusterID}...`,
                footer: {
                    text: getDate()
                }
            }]
        });

        const options = {
            autoreconnect: true,
            firstShardID: firstShardID,
            lastShardID: lastShardID,
            maxShards: maxShards 
        };

        Object.keys(options).forEach(key => {
            delete clientOptions[key];
        });
        Object.assign(options, clientOptions);

        this.bot = new Client(token, options);

        this.bot.on('connect', shardID => {
            process.send({
                name: 'info',
                msg: `shard ${shardID} is connected.`
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: green,
                    title: 'Shard',
                    description: `Cluster ${this.clusterID}: shard ${shardID} is connected.`,
                    footer: {
                        text: getDate()
                    }
                }]
            });
        });
        this.bot.on('disconnect', () => {
            process.send({
                name: 'error',
                msg: 'All shards have been disconnected.'
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: red,
                    title: 'Shard',
                    description: `All shards have been disconnected on cluster ${this.clusterID}.`,
                    footer: {
                        text: getDate()
                    }
                }]
            });
        });
        this.bot.on('shardDisconnect', (error, shardID) => {
            process.send({
                name: 'error',
                msg: `Shard ${shardID} has been disconnected with the following error: ${error.stack}`
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: red,
                    title: 'Shard',
                    description: `Cluster ${this.clusterID}: shard ${shardID} has been disconnected.`,
                    fields: [{
                        name: 'Error',
                        value: `\`\`\`JS\n${error}\n\`\`\``
                    }],
                    footer: {
                        text: getDate()
                    }
                }]
            });
        });
        this.bot.on('shardReady', shardID => {
            process.send({
                name: 'info',
                msg: `Shard ${shardID} is ready.`
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: green,
                    title: 'Shard',
                    description: `Cluster ${this.clusterID}: shard ${shardID} is ready.`,
                    footer: {
                        text: getDate()
                    }
                }]
            });

            if (game) {
                const shard = this.bot.shards.get(shardID);

                shard.editStatus('online', {
                    name: `${game} | Shard ${shardID}`
                });
            }
        });
        this.bot.on('shardResume', shardID => {
            process.send({
                name: 'info',
                msg: `Shard ${shardID} has been resumed.`
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: green,
                    title: 'Shard',
                    description: `Cluster ${this.clusterID}: shard ${shardID} has been resumed.`,
                    footer: {
                        text: getDate()
                    }
                }]
            });

            if (game) {
                const shard = this.bot.shards.get(shardID);

                shard.editStatus('online', {
                    name: `${game} | Shard ${shardID}`
                });
            }
        });
        this.bot.on('warn', (message, shardID) => {
            process.send({
                name: 'warn',
                msg: `Shard ${shardID} has received a warning: ${message}`
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: yellow,
                    title: 'Shard',
                    description: `Cluster ${this.clusterID}: shard ${shardID} has received a warning.`,
                    fields: [{
                        name: 'Warning',
                        value: `\`\`\`JS\n${message}\n\`\`\``
                    }],
                    footer: {
                        text: getDate()
                    }
                }]
            });
        });
        this.bot.on('error', (error, shardID) => {
            process.send({
                name: 'error',
                msg: `Shard ${shardID} has received an error: ${error.stack}`
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: red,
                    title: 'Shard',
                    description: `Cluster ${this.clusterID}: shard ${shardID} has received an error.`,
                    fields: [{
                        name: 'Warning',
                        value: `\`\`\`JS\n${error}\n\`\`\``
                    }],
                    footer: {
                        text: getDate()
                    }
                }]
            });
        });
        this.bot.once('ready', () => {
            this.loadCode();
            this.startStats();
        });
        this.bot.on('ready', () => {
            process.send({
                name: 'info',
                msg: `${this.bot.user.username}#${this.bot.user.discriminator} is now ready on all shards.`
            });
            process.send({
                name: 'webhook',
                embeds: [{
                    color: green,
                    title: 'Cluster manager',
                    description: `Cluster ${this.clusterID} is ready.`,
                    footer: {
                        text: getDate()
                    }
                }]
            });
            process.send({
                name: 'shardsStarted'
            });
        });

        if (!this.test) {
            this.bot.connect();
        } else {
            process.send({
                name: 'shardsStarted'
            });

            this.loadCode();
        }
    }

    /**
     * Loads the main file of the bot
     * @returns {void}
     */
    loadCode () {
        const rootPath = process.cwd().replace(/[\\]/gi, '/');
        const path = `${rootPath}${this.mainFile}`;
        const App = require(path);

        if (App.prototype instanceof ErisBaseClient) {
            this.App = new App({
                bot: this.bot,
                clusterID: this.clusterID
            });
            this.ipc = this.App.ipc;
            this.App.launch();
        } else {
            throw new Error('Your code has not been loaded! This is due to it not extending the ErisBaseClient class. Please extend the ErisBaseClient class!');
        }
    }

    /**
     * Starts the task of statistics update
     * @returns {void}
     */
    startStats () {
        setInterval(() => {
            this.guilds = this.bot.guilds.size;
            this.users = this.bot.users.size;
            this.uptime = this.bot.uptime;
            this.voiceChannels = this.bot.voiceConnections.size;
            this.largeGuilds = this.bot.guilds.filter(guild => guild.large).length;
            this.exclusiveGuilds = this.bot.guilds.filter(guild => guild.members.filter(member => member.bot).length === 1).length;
            this.shardsStats = [];
            
            this.bot.shards.forEach(shard => {
                this.shardsStats.push({
                    id: shard.id,
                    ready: shard.ready,
                    latency: shard.latency,
                    status: shard.status
                });
            });
        }, 5000);
    }
};
