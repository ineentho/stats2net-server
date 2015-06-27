'use strict';

const Sequelize = require('sequelize');

function getPlayerID(name, steam) {
    if (steam === 'BOT') {
        return 'BOT-' + name;
    }
    return steam;
}

module.exports = function Player(sequelize) {
    let Player = sequelize.define('Player', {
        displayName: Sequelize.STRING,
        steamID: {type: Sequelize.STRING, unique: true},
        kills: {type: Sequelize.INTEGER, defaultValue: 0},
        deaths: {type: Sequelize.INTEGER, defaultValue: 0},
        elo: {type: Sequelize.INTEGER, defaultValue: 2000}
    });

    Player.getPlayer = function *(player) {
        const name = player.name;
        const steam = player.steam;
        const id = getPlayerID(name, steam);

        return (yield Player.findOrCreate({
            where: {steamID: id},
            defaults: {
                displayName: name
            }
        }))[0];
    };

    return Player;
};