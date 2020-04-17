'use strict';

const IPC = require("./IPC.js");

/**
 * ErisBaseClient class
 * @class ErisBaseClient
 */
module.exports = class ErisBaseClient {
    // eslint-disable-next-line valid-jsdoc
    /**
     * @constructor
     * @param {Object} setup Bot setup
     * @param {import('eris').Client} setup.bot The Eris client
     * @param {number} setup.clusterID The current cluster ID
     * @property {import('eris').Client} bot The Eris client
     * @property {number} clusterID The current cluster ID
     * @property {IPC} IPC Bot IPC
     */
    constructor (setup) {
        this.bot = setup.bot;
        this.clusterID = setup.clusterID;
        this.ipc = new IPC();
    }

    /**
     * Restarts a cluster
     * @param {number} clusterID The ID of the concerned cluster
     * @returns {void}
     */
    restartCluster (clusterID) {
        this.ipc.sendTo(clusterID, 'restart', {
            name: 'restart'
        });
    }
};
