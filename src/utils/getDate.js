'use strict';

/**
 * Gets a date
 * @returns {string} The date, with the DD/MM/YYYY HH:MM:SS format
 */
module.exports = () => {
    const day = new Date().getDate() >= 10 ? new Date().getDate() : `0${new Date().getDate()}`;
    const month = new Date().getMonth() + 1 >= 10 ? new Date().getMonth() + 1 : `0${new Date().getMonth() + 1}`;
    const year = new Date().getFullYear();
    const hours = new Date().getHours() >= 10 ? new Date().getHours() : `0${new Date().getHours()}`;
    const minutes = new Date().getMinutes() >= 10 ? new Date().getMinutes() : `0${new Date().getMinutes()}`;
    const seconds = new Date().getSeconds() >= 10 ? new Date().getSeconds() : `0${new Date().getSeconds()}`;

    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
};
