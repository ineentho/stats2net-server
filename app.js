'use strict';

const koa       = require('koa'),
      http      = require('http'),
      Sequelize = require('sequelize'),
      co        = require('co'),
      events    = require('events'),
      database  = require('./database');

co(function *() {
    /**
     * Create a global event emitter that will be used to pass game
     * events around internally
     */
    const gameEvents = new events.EventEmitter();

    /**
     * Find appropriate host and port depending on environment variables
     */
    const port = process.env.NODE_PORT || process.env.PORT || 8080;
    const ip = process.env.NODE_IP || undefined;

    /**
     * Sync the database
     */
    yield database.sync();

    /**
     * Register the koa routes
     */
    const app = koa();

    const routeAddon  = require('./routes/addon')(database, gameEvents),
          routeServer = require('./routes/server')(database, gameEvents);

    app.use(routeAddon.router.routes());
    app.use(routeServer.router.routes());

    /**
     * Create a custom HTTP server so we can attach socket.io events to it
     */
    const server = http.Server(app.callback());
    routeServer.startSocketServer(server);

    /**
     * Finally start the server
     */
    server.listen(port, ip);
    console.log('Server listening on ' + (ip ? ip : '0.0.0.0') + ':' + port);

}).catch(function (err) {
    console.error(err.stack);
});
