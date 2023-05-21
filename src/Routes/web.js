const express = require('express');
const routerWeb = express.Router();

routerWeb.get('/', (req, res) => {
    console.log('adsdas')
    res.sendFile('../Views/index.html', {
      root: __dirname
    });
  });

  module.exports = {
    routerWeb
  } 