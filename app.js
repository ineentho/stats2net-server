const koa    = require('koa'),
      http   = require('http'),
      server = require('./routes/server'),
      addon  = require('./routes/addon');

const app = koa();


app.use(addon.router.routes());
app.use(server.router.routes());

const koaServer = http.Server(app.callback());
server.socketServer(addon.csEvents, koaServer);

const port = process.env.OPENSHIFT_IOJS_PORT || process.env.PORT || 8080;
const ip = process.env.NODE_IP || "127.0.0.1";
koaServer.listen(port, ip);
console.log('Server listening on port ' + port);
