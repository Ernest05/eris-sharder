'use strict';

const { ClusterManager } = require('../src/index');

new ClusterManager('Your Discord bot token', "/main.js", {
    name: 'Testing robot',
    clientOptions: {
        reconnectAttempts: 3,
        defaultImageFormat: 'png'
    },
    clusterCount: 1,
    shardCount: 1,
    webhook: {
        id: 'Logging webhook ID',
        token: 'Logging webhook token'
    },
    game: 'Testing robot'
}).launch();
