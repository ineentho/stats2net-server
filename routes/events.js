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
            co(function *() {
                const attacker = yield database.Player.getPlayer(data.attacker);
                const victim = yield database.Player.getPlayer(data.victim);

                const eloChange = getEloChange(attacker, victim);

                attacker.elo += eloChange;
                attacker.kills++;
                victim.elo -= eloChange;
                victim.deaths++;


                io.emit('kill', {
                    attacker: {
                        displayName: attacker.displayName,
                        elo: Math.round(attacker.elo * 100) / 100
                    },
                    victim: {
                        displayName: victim.displayName,
                        elo: Math.round(victim.elo * 100) / 100
                    },
                    eloChange: Math.round(eloChange * 100) / 100
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
            client.emit('map', state.get('map'));
        });
    }).catch(function (err) {
        console.error(err.stack);
    })

};