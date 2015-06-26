const Router = require('koa-router'),
      events = require('events');

const addon = module.exports.router = new Router({
    prefix: '/addon'
});

const csEvents = module.exports.csEvents = new events.EventEmitter();

addon.get('/action', function *(next) {
    var q = this.query;
    if (q.type === 'kill') {
        q.test = 'test';
        csEvents.emit('kill', q);
    }
});

addon.get('/2', function *(next) {
    this.body = 'Addon 2';
});