'use strict';

const co    = require('co'),
      State = require('./state');


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
            io.emit('kill', data);
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