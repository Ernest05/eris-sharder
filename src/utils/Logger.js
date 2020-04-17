'use strict';

const { white, green, yellow, red, magenta, gray } = require('chalk');
const getDate = require('./getDate');

/**
 * Logger class
 * @class Logger
 */
module.exports = class Logger {
    /**
     * Sends a message into the console using white color
     * @param {string} source The source where the log comes from
     * @param {string} message The message to display in the console
     * @returns {void}
     */
    log (source, message) {
        console.log(white(`[${getDate()}] [${source}] ${message}`));
    }

    /**
     * Sends a message into the console using green color
     * @param {string} source The source where the log comes from
     * @param {string} message The message to display in the console
     * @returns {void}
     */
    info (source, message) {
        console.log(green(`[${getDate()}] [${source}] ${message}`));
    }

    /**
     * Sends a message into the console using yellow color
     * @param {string} source The source where the log comes from
     * @param {string} message The message to display in the console
     * @returns {void}
     */
    warn (source, message) {
        console.log(yellow(`[${getDate()}] [${source}] ${message}`));
    }

    /**
     * Sends a message into the console using red color
     * @param {string} source The source where the log comes from
     * @param {string} message The message to display in the console
     * @returns {void}
     */
    error (source, message) {
        console.log(red(`[${getDate()}] [${source}] ${message}`));
    }

    /**
     * Sends a message into the console using magenta color
     * @param {string} source The source where the log comes from
     * @param {string} message The message to display in the console
     * @returns {void}
     */
    data (source, message) {
        console.log(magenta(`[${getDate()}] [${source}] ${message}`));
    }

    /**
     * Sends a message into the console using gray color
     * @param {string} source The source where the log comes from
     * @param {string} message The message to display in the console
     * @returns {void}
     */
    debug (source, message) {
        console.log(gray(`[${getDate()}] [${source}] ${message}`));
    }
};
