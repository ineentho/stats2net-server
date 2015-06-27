'use strict';

const Router   = require('koa-router'),
      socketIO = require('socket.io');

module.exports = function Server(database, events) {

    /**
     * Start the socket.io server responsible for redirecting events to the
     * websocket connection
     */
    function startSocketServer(server) {
        const io = socketIO(server);

        events.on('kill', function (data) {
            io.emit('kill', data);
        });

        events.on('serverstart', function () {
            console.log('Server started');
        });
    }

    /**
     * Create the HTTP router
     */
    const router = new Router({
        prefix: '/server'
    });

    router.get('/', function *() {
        this.body = 'Server';
    });

    return {
        router: router,
        startSocketServer: startSocketServer
    }
};