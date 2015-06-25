const Router   = require('koa-router'),
      socketIO = require('socket.io');


const server = module.exports.router = new Router({
    prefix: '/server'
});

module.exports.socketServer = function (events, server) {
    const io = socketIO(server);

    events.on('kill', function (data) {
        io.emit('kill', data);
    });

    events.on('serverstart', function () {
        console.log('Server started');
    });
};

server.get('/', function *(next) {
    this.body = 'Server';
});