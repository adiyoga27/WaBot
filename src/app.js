const {init, gettingStarted} = require('./Controllers/whatsapp')
const express = require('express');
const {routerWithAuth, routerWithOutAuth} = require('./Routes/api');

const bodyParser = require('body-parser') 
const process = require('process');
const socketIO = require('socket.io');
const http = require('http');
const port = process.env.APP_PORT || 8001;

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
    allowEIO3: true // false by default
});
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
app.use('/', routerWithAuth);
app.use('/', routerWithOutAuth);


gettingStarted();


server.listen(port, function() {
    console.log('App running on *: ' + port);
  });
