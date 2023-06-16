const {init, gettingStarted} = require('./Controllers/whatsapp')
const express = require('express');
const {routerWithAuth, routerWithOutAuth} = require('./Routes/api');
const {routerWeb} = require('./Routes/web');
const { initSocket } = require('./Routes/socket')
const socketIO = require('socket.io');
const bodyParser = require('body-parser') 
const process = require('process');
const http = require('http');
const {infoLog, emergecyLog} = require('./Services/telegram');
const { info } = require('console');
require('dotenv').config()
process.setMaxListeners(0);
const port = process.env.APP_PORT || 2929;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    allowEIO3: true // false by default
});
gettingStarted(io);
app.set('socketio', io);

app.use(express.json());
app.use(express.urlencoded({
  extended: true
}));
app.use(

    bodyParser.urlencoded({
      extended: true,
    }),
    bodyParser.json()
  );
  app.get('/', (req, res) => {

    res.sendFile('Views/index.html', {
      root: __dirname
    });
  });
// app.use('/',routerWeb);
app.use('/', routerWithAuth);
app.use('/', routerWithOutAuth);
initSocket(io);

server.listen(port, function() {
    infoLog('Server Getting Started Restart');
    console.log('App running on *: ' + port);
  });


