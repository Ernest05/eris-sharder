'use strict';

const { EventEmitter } = require('eventemitter3');

/**
 * Queue class
 * @class Queue
 * @extends {EventEmitter}
 */
module.exports = class Queue extends EventEmitter {
    /**
     * @constructor
     * @property {Array} queue
     */
    constructor () {
        super();
        this.queue = [];
    }

    /**
     * Executes the queue system
     * @returns {void}
     */
    executeQueue () {
        const item = this.queue[0];

        if (!item) {
            return;
        }

        /**
         * Emitted when queue system is executed
         * @event Queue#execute
         * @param {*} item Queue item
         */
        this.emit('execute', item);
    }

    /**
     * Pushes an item into the queue
     * @param {*} item Queue item
     * @returns {void}
     */
    queueItem (item) {
        if (this.queue.length === 0) {
            this.queue.push(item);
            this.executeQueue();
        } else {
            this.queue.push(item);
        }
    }
};
