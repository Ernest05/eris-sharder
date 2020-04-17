'use strict';

const { ClusterManager } = require('../src/index');

const clusterManager = new ClusterManager('Your Discord bot token', '/main.js', {
    name: 'Testing robot',
    clientOptions: {
        reconnectAttempts: 3,
        defaultImageFormat: 'png'
    },
    clusterCount: 1,
    shardCount: 1,
    stats: true,
    webhook: {
        id: 'Logging webhook ID',
        token: 'Logging webhook token'
    },
    game: 'Testing robot'
});

clusterManager.launch();
clusterManager.on('stats', stats => {
    console.log(JSON.stringify(stats, null, '\t'));
});
