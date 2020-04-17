'use strict';

const { EventEmitter } = require('eventemitter3');

/**
 * Bot IPC class
 * @class IPC
 * @extends {EventEmitter}
 */
module.exports = class IPC extends EventEmitter {
    /**
     * @constructor
     */
    constructor () {
        super();

        this.events = new Map();

        process.on('message', message => {
            const event = this.events.get(message._eventName);

            if (event) {
                event.callback(message);
            }
        });
    }

    /**
     * Registers an event to the events map
     * @param {string} event The event name
     * @param {*} callback The callback for the event
     * @returns {boolean} The saved event
     */
    register (event, callback) {
        this.events.set(event, {
            callback: callback
        });
    }

    /**
     * Deletes an event from the events map
     * @param {string} name The event name
     * @returns {boolean} The deleted event
     */
    unregister (name) {
        this.events.delete(name);
    }

    /**
     * Sends an action to execute on all shards of the cluster
     * @param {string} name The action name
     * @param {Object} message The action to execute
     * @returns {void}
     */
    broadcast (name, message = {}) {
        message._eventName = name;

        process.send({
            name: 'broadcast',
            msg: message
        });
    }

    /**
     * Sends an action to execute on the concerned cluster
     * @param {number} clusterID The ID of the concerned cluster
     * @param {string} name The action name
     * @param {Object} message The action to execute
     * @returns {void}
     */
    sendTo (clusterID, name, message = {}) {
        message._eventName = name;

        process.send({
            name: 'send',
            cluster: clusterID,
            msg: message
        });
    }

    /**
     * Fetches a user on all bot clusters
     * @param {string} userID The ID of the Discord user
     * @returns {Object} The base of the user object
     */
    async fetchUser (userID) {
        process.send({
            name: 'fetchUser',
            id: userID
        });

        return new Promise(resolve => {
            const callback = user => {
                this.removeListener(userID, callback);

                resolve(user);
            };

            this.on(userID, callback);
        });
    }

    /**
     * Fetches a guild on all bot clusters
     * @param {string} guildID The ID of the Discord guild
     * @returns {Object} The base of the guild object
     */
    async fetchGuild (guildID) {
        process.send({
            name: 'fetchGuild',
            id: guildID
        });

        return new Promise(resolve => {
            const callback = guild => {
                this.removeListener(guildID, callback);

                resolve(guild);
            };

            this.on(guildID, callback);
        });
    }

    /**
     * Fetches a channel on all bot clusters
     * @param {string} channelID The ID of the Discord channel
     * @returns {Object} The base of the channel object
     */
    async fetchChannel (channelID) {
        process.send({
            name: 'fetchChannel',
            id: channelID
        });

        return new Promise(resolve => {
            const callback = channel => {
                this.removeListener(channelID, callback);

                resolve(channel);
            };

            this.on(channelID, callback);
        });
    }
};
