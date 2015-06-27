'use strict';

const Sequelize = require('sequelize');

module.exports = function Player(sequelize) {
    return sequelize.define('Player', {
        displayName: Sequelize.STRING,
        steamID: Sequelize.STRING,
        kills: Sequelize.INTEGER,
        deaths: Sequelize.INTEGER
    });
};