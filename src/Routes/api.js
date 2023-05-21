const {whatsapp, init, logoutDevice, MessageMedia} = require('../Controllers/whatsapp')
const {authenticateMiddleware} = require('../Middleware/authenticate_middleware')
const {sendMessageSchema, sendMediaSchema, validationScheme} = require('../Validations/whatsapp.schema')
const {phoneNumberFormatter} = require('../Helpers/formatter')
const express = require('express');
const routerWithAuth = express.Router();
const routerWithOutAuth = express.Router();
routerWithAuth.use(authenticateMiddleware);
const {createClientId, deleteClient} = require('../Configs/database');

routerWithAuth.post('/send-message', sendMessageSchema, async (req, res) => {
    validationScheme(req, res);

    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message;
    const wa = whatsapp.get(req.headers.authorization);
    const client = wa.client;
      // Make sure the sender is exists & ready
      if (!wa.ready) {
        return res.status(422).json({
          status: false,
          message: `The sender:  is not found!`
        })
      }
      const isRegisteredNumber = await client.isRegisteredUser(number);
      if (!isRegisteredNumber) {
        return res.status(422).json({
          status: false,
          message: 'The number is not registered'
        });
      }
    
      client.sendMessage(number, message).then(response => {
        res.status(200).json({
          status: true,
          message: "Sending message is successfuly",
          data: {
            from: response.from,
            to: response.to,
            ack: response.ack,
            type:response.type,
            hasMedia: response.hasMedia,
            body: response.body,
            deviceType: response.deviceType,
            timestamp: response.timestamp
          }
        });
      }).catch(err => {
        res.status(500).json({
          status: false,
          message: "Sending message is failed",
          data: err
        });
      });
});

routerWithAuth.post('/send-media', sendMediaSchema, async (req, res) => {
  validationScheme(req, res);

  const number = phoneNumberFormatter(req.body.number);
  const caption = req.body.caption;
  const url = req.body.url;
  const wa = whatsapp.get(req.headers.authorization);
  const client = wa.client;
    // Make sure the sender is exists & ready
    if (!wa.ready) {
      return res.status(422).json({
        status: false,
        message: `The sender:  is not found!`
      })
    }
    const isRegisteredNumber = await client.isRegisteredUser(number);
    if (!isRegisteredNumber) {
      return res.status(422).json({
        status: false,
        message: 'The number is not registered'
      });
    }
    const media = await MessageMedia.fromUrl(url);
    client.sendMessage(number, media, {caption: caption}).then(response => {
      res.status(200).json({
        status: true,
        message: "Sending message is successfuly",
        data:  {
          from: response.from,
          to: response.to,
          ack: response.ack,
          type:response.type,
          hasMedia: response.hasMedia,
          body: response.body,
          deviceType: response.deviceType,
          timestamp: response.timestamp
        }
      });
    }).catch(err => {
      res.status(500).json({
        status: false,
        message: "Sending message is failed",
        data: err
      });
    });
});

routerWithAuth.post('/logout-device', async (req, res) => {
      logoutDevice(req.headers.authorization).then((response)=>{
        
        // init(req.headers.authorization)
        return res.status(200).json({
          status: true,
          message: "success logout",
        });
      }).catch((error)=>{
        return res.status(200).json({
          status: false,
          message: error,
        });
      })
    })

routerWithOutAuth.post('/create-client', async (req, res) => {
      createClientId({
        client_id : req.body.client_id,
        name : req.body.name,
        description: req.body.description,
        expired_at : req.body.expired_at
      }).then((res) => {
        console.log(res);
        // add client();
        init(res.api_key);
        return res.status(200).json({
            status: true,
            message: "success",
            data: res
          });
      }).catch((error) => {
        return res.status(500).json({
          status: false,
          message: "Gagal create",
          data: error
        });
      })
    })

    module.exports = {
      routerWithAuth, routerWithOutAuth
    } 