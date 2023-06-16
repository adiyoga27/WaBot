const {init, gettingStarted} = require('./Controllers/whatsapp')
const express = require('express');
const {routerWithAuth, routerWithOutAuth} = require('./Routes/api');
const {routerWeb} = require('./Routes/web');
const { initSocket } = require('./Routes/socket')
const socketIO = require('socket.io');
const bodyParser = require('body-parser') 
const process = require('process');
const http = require('http');
const fs = require('fs');
const cors = require('cors');

const {infoLog, emergecyLog} = require('./Services/telegram');
const { info } = require('console');
require('dotenv').config()
process.setMaxListeners(0);
const port = process.env.APP_PORT || 2929;

const app = express();
let server;
if (process.env.APP_PROTOCOL === "https") {
  // Certificate
  const credentials = {
    key: fs.readFileSync(
      "/etc/letsencrypt/live/wabot.galkasoft.id/privkey.pem",
      "utf8"
    ),
    cert: fs.readFileSync(
      "/etc/letsencrypt/live/wabot.galkasoft.id/cert.pem",
      "utf8"
    ),
    ca: fs.readFileSync(
      "/etc/letsencrypt/live/wabot.galkasoft.id/chain.pem",
      "utf8"
    ),
  };
  let http = require("https");

  server = http.createServer(credentials, app);
} else {
  let http = require("http");
  server = http.createServer(app);
}
// const server = http.createServer(app);

const io = socketIO(server, {
    allowEIO3: true // false by default
});
gettingStarted(io);
app.set('socketio', io);
app.use(
  cors({
    credentials: true,
    origin: [
      "http://localhost",
      "http://127.0.0.1",
      "http://localhost:7991",
      "http://127.0.0.1:7991",
      "http://wabot.galkasoft.id:7991",
      "https://wabot.galkasoft.id:7991",
    ],
  }),
  bodyParser.urlencoded({
    extended: true,
  }),
  bodyParser.json()
);
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


