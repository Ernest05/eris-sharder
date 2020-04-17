'use strict';

const { EventEmitter } = require('eventemitter3');
const { name, version } = require('../../package.json');
const clusterCount = require('os').cpus().length;
const Queue = require('../utils/Queue.js');
const { Client } = require('eris');
const master = require('cluster');
const Logger = require('../utils/Logger.js');
const logger = new Logger();
const logo = require('asciiart-logo');
const { yellow, green, red } = {
    yellow: 0xE7E108,
    green: 0x0DD330,
    red: 0xF32C2A
};
const getDate = require('../utils/getDate');
const Cluster = require('./Cluster.js');

/**
 * ClusterManager class
 * @class ClusterManager
 * @extends {EventEmitter}
 */
module.exports = class ClusterManager extends EventEmitter {
    /**
     * Options definition type
     * @typedef {Object} ClusterManagerOptions
     * @property {string} [name] Bot name to print when the bot starts
     * @property {import('eris').ClientOptions} [clientOptions] Eris client options
     * @property {number} [clusterCount] The total amount of clusters
     * @property {number} [clusterTimeout] Number of milliseconds between starting up each cluster
     * @property {number} [shardCount] The total amount of shards
     * @property {number} [guildsPerShard] The maximal amount of guilds on each shard
     * @property {number} [firstShardID] The ID of the first shard
     * @property {number} [lastShardID] The ID of the last shard
     * @property {boolean} [stats] Enables or not stats event
     * @property {number} [statsInterval] Number of milliseconds to wait before posting shards & clusters stats again
     * @property {boolean} [debug] Enables debug logging or not
     * @property {Object} [webhook] Webhook object which contains webhook ID & token
     * @property {string} webhook.id Webhook ID
     * @property {string} webhook.token Webhook token
     * @property {string} [game] Game to set on the bot
     */

    // eslint-disable-next-line valid-jsdoc
    /**
     * Creates an instance of ClusterManager
     * @constructor
     * @param {string} token Bot token
     * @param {string} mainFile Bot main file
     * @param {ClusterManagerOptions} options ClusterManagerOptions
     * @property {string} name Bot name to print when the bot starts
     * @property {import('eris').ClientOptions} clientOptions Eris client options
     * @property {number} clusterCount The total amount of clusters
     * @property {number} clusterTimeout Number of milliseconds between starting up each cluster
     * @property {number} shardCount The total amount of shards
     * @property {number} guildsPerShard The maximal amount of guilds on each shard
     * @property {number} firstShardID The ID of the first shard
     * @property {number} lastShardID The ID of the last shard
     * @property {boolean} isStats Checks if the the task which consists to returns clusters & shards statistics has to be executed or not
     * @property {number} statsInterval Number of milliseconds to wait before posting shards & clusters stats again
     * @property {boolean} debug Enables debug logging or not
     * @property {Map} clusters Map which stores clusters
     * @property {Map} workers Map which stores workers
     * @property {Queue} queue Queue system
     * @property {Map} callbacks Map which stores callbacks
     * @property {Object} webhook Webhook object which contains webhook ID & token
     * @property {string} webhook.id Webhook ID
     * @property {string} webhook.token Webhook token
     * @property {string} game Game to set on the bot
     * @property {Object} stats Clusters & shards statistics object
     * @property {Client} eris The Eris client
     */
    constructor(token, mainFile, options = {}) {
        super();

        if (!token || typeof token !== 'string') {
            throw new Error('Please indicate a valid token!');
        }
        if (!mainFile || typeof mainFile !== 'string') {
            throw new Error('Please indicate a valid path for the main file!');
        }

        this.token = token;
        this.mainFile = mainFile;
        this.name = options.name || name;
        this.clientOptions = options.clientOptions || {};
        this.clusterCount = options.clusterCount || clusterCount;
        this.clusterTimeout = options.clusterTimeout || 10000;
        this.shardCount = options.shardCount || 0;
        this.guildsPerShard = options.guildsPerShard || 1000;
        this.firstShardID = options.firstShardID || 0;
        this.lastShardID = options.lastShardID || this.shardCount - 1;
        this.isStats = options.stats || false;
        this.statsInterval = options.statsInterval || 60000;
        this.debug = options.debug || false;
        this.clusters = new Map();
        this.workers = new Map();
        this.queue = new Queue();
        this.callbacks = new Map();
        this.webhook = options.webhook || {};
        this.game = options.game || undefined;

        if (this.isStats) {
            this.stats = {
                guilds: 0,
                exclusiveGuilds: 0,
                largeGuilds: 0,
                users: 0,
                voice: 0,
                totalMem: 0,
                clusters: [],
                clustersCounted: 0
            };
        }

        this.eris = new Client(token, this.clientOptions);
    }

    /**
     * Returns if the process is the master process or not
     * @returns {boolean} Process is the master process, or not
     */
    get isMaster () {
        return master.isMaster;
    }

    /**
     * Starts the task of sending clusters & shards statistics
     * @returns {void}
     */
    startStats () {
        if (this.statsInterval !== null) {
            setInterval(() => {
                this.stats.guilds = 0;
                this.stats.exclusiveGuilds = 0;
                this.stats.largeGuilds = 0;
                this.stats.users = 0;
                this.stats.voice = 0;
                this.stats.totalMem = 0;
                this.stats.clusters = [];
                this.stats.clustersCounted = 0;

                const clusters = Object.entries(master.workers);

                this.executeStats(clusters, 0);
            }, this.statsInterval);
        }
    }

    /**
     * Executes actions on clusters to get clusters & shards statistics
     * @param {Array} clusters Array of clusters
     * @param {number} start Start index number
     * @returns {void}
     */
    executeStats (clusters, start) {
        const clusterToRequest = clusters.filter(cluster => cluster[1].state === 'online')[start];

        if (clusterToRequest) {
            let cluster = clusterToRequest[1];

            cluster.send({
                name: 'stats'
            });

            this.executeStats(clusters, start + 1);
        }
    }

    /**
     * Launches the cluster manager
     * @returns {void}
     */
    launch () {
        if (master.isMaster) {
            process.on('uncaughtException', error => {
                logger.error('Cluster Manager', error.stack);
            });

            console.log(
                logo({
                    name: this.name,
                    font: 'Big',
                    lineChars: 15,
                    padding: 5,
                    margin: 2
                })
                    .emptyLine()
                    .right(`${name} v${version}`)
                    .render()
            );

            process.nextTick(async () => {
                logger.info('Cluster Manager', 'Cluster Manager has been started.');

                const shards = await this.calculateShards();

                this.shardCount = shards;
                this.lastShardID = this.shardCount - 1;

                logger.warn('Cluster Manager', `Trying to start ${this.shardCount} shard(s) in ${this.clusterCount} cluster(s)...`);
                this.sendWebhook([{
                    color: yellow,
                    title: 'Cluster manager',
                    description: `Trying to start ${this.shardCount} shard(s) in ${this.clusterCount} cluster(s)...`,
                    footer: {
                        text: getDate()
                    }
                }]);

                master.setupMaster({
                    silent: true
                });

                this.start(0);
            });
        } else if (master.isWorker) {
            const cluster = new Cluster();

            cluster.spawn();
        }

        master.on('message', (worker, message) => {
            if (message.name) {
                const clusterID = this.workers.get(worker.id);

                switch (message.name) {
                    case 'log': {
                        return logger.log(`Cluster ${clusterID}`, `${message.msg}`);
                    }

                    case 'info': {
                        return logger.info(`Cluster ${clusterID}`, `${message.msg}`);
                    }

                    case 'warn': {
                        return logger.warn(`Cluster ${clusterID}`, `${message.msg}`);
                    }

                    case 'error': {
                        return logger.error(`Cluster ${clusterID}`, `${message.msg}`);
                    }

                    case 'debug': {
                        if (this.debug) {
                            logger.debug(`Cluster ${clusterID}`, `${message.msg}`);
                        }
                    }

                    case 'shardsStarted': {
                        this.queue.queue.splice(0, 1);

                        if (this.queue.queue.length > 0) {
                            setTimeout(() => this.queue.executeQueue(), this.clusterTimeout);
                        }

                        return;
                    }

                    case 'stats': {
                        this.stats.guilds += message.stats.guilds;
                        this.stats.exclusiveGuilds += message.stats.exclusiveGuilds;
                        this.stats.largeGuilds += message.stats.largeGuilds;
                        this.stats.users += message.stats.users;
                        this.stats.voice += message.stats.voice;
                        this.stats.totalMem += message.stats.ram;
                        this.stats.clusters.push({
                            clusterID: clusterID,
                            shards: message.stats.shards,
                            guilds: message.stats.guilds,
                            exclusiveGuilds: message.stats.exclusiveGuilds,
                            largeGuilds: message.stats.largeGuilds,
                            users: message.stats.users,
                            voice: message.stats.voice,
                            ram: message.stats.ram,
                            uptime: message.stats.uptime,
                            shardsStats: message.stats.shardsStats
                        });
                        this.stats.clustersCounted += 1;

                        if (this.stats.clustersCounted === this.clusters.size) {
                            function compare(a, b) {
                                if (a.cluster < b.cluster) {
                                    return -1;
                                }
                                if (a.cluster > b.cluster) {
                                    return 1;
                                }

                                return 0;
                            }

                            const clusters = this.stats.clusters.sort(compare);

                            /**
                             * Emitted when the process has to post clusters & shards stats
                             * @event ClusterManager#stats
                             * @type {Object}
                             * @property {number} guilds Number of guilds
                             * @property {number} exclusiveGuilds Number of exclusive guilds
                             * @property {number} largeGuilds Number of large guilds
                             * @property {number} users Number of users
                             * @property {number} voice Number of voice sessions
                             * @property {number} totalMem RSS memory used by the process
                             * @property {Array} clusters Array of clusters
                             */
                            this.emit('stats', {
                                guilds: this.stats.guilds,
                                exclusiveGuilds: this.stats.exclusiveGuilds,
                                largeGuilds: this.stats.largeGuilds,
                                users: this.stats.users,
                                voice: this.stats.voice,
                                totalMem: this.stats.totalMem,
                                clusters: clusters
                            });
                        }

                        return;
                    }

                    case 'fetchUser': {
                        this.fetchInfo(0, 'fetchUser', message.id);
                        this.callbacks.set(message.id, clusterID);

                        return;
                    }

                    case 'fetchGuild': {
                        this.fetchInfo(0, 'fetchGuild', message.id);
                        this.callbacks.set(message.id, clusterID);

                        return;
                    }

                    case 'fetchChannel': {
                        this.fetchInfo(0, 'fetchChannel', message.id);
                        this.callbacks.set(message.id, clusterID);

                        return;
                    }

                    case 'fetchReturn': {
                        const callback = this.callbacks.get(message.value.id);
                        const cluster = this.clusters.get(callback);

                        if (cluster) {
                            master.workers[cluster.workerID].send({
                                name: 'fetchReturn',
                                id: message.value.id,
                                value: message.value
                            });

                            this.callbacks.delete(message.value.id);
                        }

                        return;
                    }

                    case 'broadcast': {
                        return this.broadcast(0, message.msg);
                    }

                    case 'send': {
                        return this.sendTo(message.cluster, message.msg);
                    }

                    case 'webhook': {
                        this.sendWebhook(message.embeds);
                    }
                }
            }
        });
        master.on('disconnect', worker => {
            const clusterID = this.workers.get(worker.id);

            logger.error('Cluster Manager', `cluster ${clusterID} has been disconnected.`);
            this.sendWebhook([{
                color: red,
                title: 'Cluster manager',
                description: `Cluster ${clusterID} has been disconnected.`,
                footer: {
                    text: getDate()
                }
            }]);
        });
        master.on('exit', (worker, code, signal) => {
            this.restartCluster(worker, code, signal);
        });

        this.queue.on('execute', item => {
            const cluster = this.clusters.get(item.item);

            if (cluster) {
                master.workers[cluster.workerID].send(item.value);
            }
        });
    }

    /**
     * Starts a cluster
     * @param {number} clusterID The ID of the concerned cluster
     * @returns {void}
     */
    start (clusterID) {
        if (clusterID === this.clusterCount) {
            logger.info('Cluster Manager', `${this.clusterCount} clusters have been launched.`);
            this.sendWebhook([{
                color: green,
                title: 'Cluster manager',
                description: `${this.clusterCount} clusters have been launched.`,
                footer: {
                    text: getDate()
                }
            }]);

            const shards = [];

            for (let i = this.firstShardID; i <= this.lastShardID; i += 1) {
                shards.push(i);
            }

            const chunkedShards = this.chunk(shards, this.clusterCount);

            chunkedShards.forEach((chunk, clusterID) => {
                const cluster = this.clusters.get(clusterID);

                this.clusters.set(clusterID, Object.assign(cluster, {
                    firstShardID: Math.min(...chunk),
                    lastShardID: Math.max(...chunk)
                }));
            });

            this.connectShards();
        } else {
            const worker = master.fork();

            this.clusters.set(clusterID, {
                workerID: worker.id
            });
            this.workers.set(worker.id, clusterID);

            logger.warn('Cluster Manager', `Trying to launch cluster ${clusterID}...`);
            this.sendWebhook([{
                color: yellow,
                title: 'Cluster manager',
                description: `Trying to launch cluster ${clusterID}...`,
                footer: {
                    text: getDate()
                }
            }]);

            clusterID += 1;

            this.start(clusterID);
        }
    }

    /**
     * Chunks shards
     * @param {Array} shards Array of shards
     * @param {number} clusterCount Total amount of clusters
     * @returns {Array} Out array
     */
    chunk (shards, clusterCount) {

        if (clusterCount < 2) {
            return [shards];
        }

        const len = shards.length;
        const out = [];
        let i = 0;
        let size;

        if (len % clusterCount === 0) {
            size = Math.floor(len / clusterCount);

            while (i < len) {
                out.push(shards.slice(i, i += size));
            }
        } else {
            while (i < len) {
                size = Math.ceil((len - i) / clusterCount--);
                out.push(shards.slice(i, i += size));
            }
        }

        return out;
    }

    /**
     * Connects shards to the Discord gateway
     * @returns {void}
     */
    connectShards () {
        for (let clusterID in [...Array(this.clusterCount).keys()]) {
            clusterID = parseInt(clusterID);

            const cluster = this.clusters.get(clusterID);

            if (!cluster.hasOwnProperty('firstShardID')) {
                break;
            }

            this.queue.queueItem({
                item: clusterID,
                value: {
                    id: clusterID,
                    clusterCount: this.clusterCount,
                    firstShardID: cluster.firstShardID,
                    lastShardID: cluster.lastShardID,
                    maxShards: this.shardCount,
                    token: this.token,
                    name: 'connect',
                    clientOptions: this.clientOptions,
                    game: this.game,
                    file: this.mainFile
                }
            });
        }

        logger.info('Cluster Manager', `${this.shardCount} shards have been spreaded.`);

        if (this.isStats) {
            this.startStats();
        }
    }

    /**
     * Restarts a cluster
     * @param {Object} worker Worker object
     * @param {number} code Code which indicated why the cluster restarts
     * @returns {void}
     */
    restartCluster (worker, code) {
        const clusterID = this.workers.get(worker.id);

        logger.error('Cluster Manager', `Cluster ${clusterID} has been killed with code ${code}.`);
        this.sendWebhook([{
            color: red,
            title: 'Cluster manager',
            description: `Cluster ${clusterID} has been killed.`,
            fields: [{
                name: 'Code',
                value: `\`\`\`JS\n${code}\`\`\``
            }],
            footer: {
                text: getDate()
            }
        }]);

        const cluster = this.clusters.get(clusterID);
        const shards = cluster.shardCount;
        const { id: newWorderID } = master.fork();

        this.workers.delete(worker.id);
        this.clusters.set(clusterID, Object.assign(cluster, {
            workerID: newWorderID
        }));
        this.workers.set(newWorderID, clusterID);

        logger.warn('Cluster Manager', `Trying to restart cluster ${clusterID}...`);
        this.sendWebhook([{
            color: yellow,
            title: 'Cluster manager',
            description: `Trying to restart cluster ${clusterID}...`,
            footer: {
                text: getDate()
            }
        }]);

        this.queue.queueItem({
            item: clusterID,
            value: {
                id: clusterID,
                clusterCount: this.clusterCount,
                shards: shards,
                firstShardID: cluster.firstShardID,
                lastShardID: cluster.lastShardID,
                maxShards: this.shardCount,
                token: this.token,
                name: 'connect',
                clientOptions: this.clientOptions,
                game: this.game,
                file: this.mainFile,
                test: this.test
            }
        });
    }

    /**
     * Calculates amount of shards to put on clusters
     * @returns {Promise<number>} The maximal amount of shards on a cluster
     */
    async calculateShards () {
        let shards = this.shardCount;

        if (shards !== 0) {
            return Promise.resolve(shards);
        }

        const res = await this.eris.getBotGateway();
        shards = res.shards;

        if (shards === 1) {
            return Promise.resolve(shards);
        } else {
            const guildCount = shards * 1000;
            const guildsPerShard = this.guildsPerShard;
            const shardsDecimal = guildCount / guildsPerShard;
            const finalShards = Math.ceil(shardsDecimal);

            return Promise.resolve(finalShards);
        }
    }

    /**
     * Fetches informations on a cluster
     * @param {number} start Start number
     * @param {string} type Type of the info
     * @param {*} value Value of the info
     * @returns {void}
     */
    fetchInfo(start, type, value) {
        const cluster = this.clusters.get(start);

        if (cluster) {
            master.workers[cluster.workerID].send({ name: type, value: value });
            this.fetchInfo(start + 1, type, value);
        }
    }

    /**
     * Broadcasts an action on a cluster
     * @param {number} start Start number
     * @param {*} message Message to send to the cluster
     * @returns {void}
     */
    broadcast (start, message) {
        const cluster = this.clusters.get(start);

        if (cluster) {
            master.workers[cluster.workerID].send(message);
            this.broadcast(start + 1, message);
        }
    }

    /**
     * Sends an action on a cluster
     * @param {number} clusterID The ID of the cluster
     * @param {*} message Message to send to the cluster
     * @returns {void}
     */
    sendTo (clusterID, message) {
        const worker = master.workers[this.clusters.get(clusterID).workerID];

        if (worker) {
            worker.send(message);
        }
    }

    /**
     * Sends webhook for clusters & shards
     * @param {Array<Object>} embeds Embeds to send by the way of the webhook
     * @returns {void}
     */
    sendWebhook (embeds) {
        if (this.webhook.id && this.webhook.token) {
            this.eris.executeWebhook(this.webhook.id, this.webhook.token, {
                embeds: embeds
            });
        }
    }
};
