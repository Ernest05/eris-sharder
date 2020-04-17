'use strict';

const { ErisBaseClient } = require('../src/index');

/**
 * Bot instance
 * @class Main
 * @extends {ErisBaseClient}
 */
module.exports = class Main extends ErisBaseClient {
    /**
     * @constructor
     * @param {Object} bot The Eris client
     */
    constructor (bot) {
        super(bot);
    }

    launch() {
        // Put in this method event, command handler, etc...
    }
};
