const koa    = require('koa'),
      http   = require('http'),
      server = require('./routes/server'),
      addon  = require('./routes/addon');

const app = koa();


app.use(addon.router.routes());
app.use(server.router.routes());

const koaServer = http.Server(app.callback());
server.socketServer(addon.csEvents, koaServer);

const port = process.env.port || 3000;
koaServer.listen(3000);
console.log('Server listening on port ' + port);
