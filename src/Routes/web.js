const express = require('express')
const {infoLog, emergecyLog} = require('../Services/telegram')
const routerWeb = express.Router()

routerWeb.get('/', (req, res) => {
    console.log('adsdas')
    infoLog('asdasda')
    res.sendFile('../Views/index.html', {
      root: __dirname
    });
  });

  module.exports = {
    routerWeb
  } 