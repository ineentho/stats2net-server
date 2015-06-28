'use strict';
const co    = require('co'),
      State = require('./state');


/**
 * How much ranking means, a low number means that players with only a little more ELO is
 * likely to win.
 */
const RANKING_IMPORTANCE = 1000;

/**
 * How much elo should be changed for each kill, higher means elo moves faster
 */
const ELO_SPEED = 6;

function getEloChange(attacker, victim) {
    const attackerProbability = 1 / (1 + Math.pow(10, (attacker.elo - victim.elo) / RANKING_IMPORTANCE));

    return attackerProbability * ELO_SPEED;

}

module.exports = function Events(gameEvents, database, io) {
    co(function *() {
        let state = new State({
            map: 'training1'
        });
        yield state.loadState();

        function setMap(map) {
            co(function *() {
                if (yield state.set('map', map)) {
                    console.log('Map changed to: ' + map);
                    io.emit('map', map);
                }
            }).catch(function (err) {
                console.error(err.stack);
            });
        }

        gameEvents.on('kill', function (data) {
            console.log(data);
            co(function *() {
                const attacker = yield database.Player.getPlayer(data.attacker);
                const victim = yield database.Player.getPlayer(data.victim);

                const eloChange = getEloChange(attacker, victim);

                attacker.elo += eloChange;
                attacker.kills++;
                attacker.displayName = data.attacker.name;
                victim.elo -= eloChange;
                victim.deaths++;
                victim.displayName = data.victim.name;


                io.emit('kill', {
                    attacker: {
                        displayName: attacker.displayName,
                        elo: Math.round(attacker.elo * 100) / 100,
                        bot: attacker.steamID.substr(0, 3) === 'BOT'
                    },
                    victim: {
                        displayName: victim.displayName,
                        elo: Math.round(victim.elo * 100) / 100,
                        bot: victim.steamID.substr(0, 3) === 'BOT'
                    },
                    eloChange: Math.round(eloChange * 100) / 100
                });

                io.emit('scoreboardchange', {
                    elo: Math.round(attacker.elo * 100) / 100,
                    displayName: attacker.displayName,
                    tag: attacker.steamID,
                    kills: attacker.kills,
                    deaths: attacker.deaths,
                    bot: attacker.steamID.substr(0, 3) === 'BOT'
                });

                io.emit('scoreboardchange', {
                    elo: Math.round(victim.elo * 100) / 100,
                    displayName: victim.displayName,
                    tag: victim.steamID,
                    kills: victim.kills,
                    deaths: victim.deaths,
                    bot: victim.steamID.substr(0, 3) === 'BOT'
                });


                yield attacker.save();
                yield victim.save();
            }).catch(function (err) {
                console.error(err.stack);
            });
        });

        gameEvents.on('map', function (map) {
            setMap(map);
        });

        io.on('connect', function (client) {
            co(function *() {
                client.emit('map', state.get('map'));

                const players = yield database.Player.findAll({
                    where: {
                        updatedAt: {
                            $gt: new Date(new Date() - 7 * 24 * 60 * 60 * 1000)
                        }
                    },
                    limit: 100,
                    order: [
                        ['elo', 'desc']
                    ]
                });
                players.forEach(function (player) {
                    client.emit('scoreboardchange', {
                        elo: Math.round(player.elo * 100) / 100,
                        displayName: player.displayName,
                        tag: player.steamID,
                        kills: player.kills,
                        deaths: player.deaths,
                        bot: player.steamID.substr(0, 3) === 'BOT'
                    });
                });
            }).catch(function (err) {
                console.error(err.stack);
            });
        });
    }).catch(function (err) {
        console.error(err.stack);
    })

};