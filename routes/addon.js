'use strict';

const Router = require('koa-router');

module.exports = function Addon(database, events) {

    /**
     * Start the http router responsible for handling things sent by the
     * CS server
     */
    const router = new Router({
        prefix: '/addon'
    });

    /**
     * An in-game event has happened (such as a connection or a kill)
     */
    router.get('/action', function *(next) {
        var q = this.query;
        if (q.type === 'kill') {
            events.emit('kill', q);
        } else if (q.type === 'serverstart') {
            console.log('Plugin loaded');
            events.emit('map', q.map);
        } else if (q.type === 'map') {
            console.log('Map: ' + q.map);
            events.emit('map', q.map);
        }
        this.body = 'OK';
    });

    return {
        router: router
    }
};