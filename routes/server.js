'use strict';

const Router   = require('koa-router'),
      socketIO = require('socket.io'),
      events   = require('./events');

module.exports = function Server(database, gameEvents) {
    /**
     * Start the socket.io server responsible for redirecting events to the
     * websocket connection
     */
    function startSocketServer(server) {
        const io = socketIO(server);
        events(gameEvents, database, io);
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