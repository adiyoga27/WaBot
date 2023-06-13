const {whatsapp, init, logoutDevice, MessageMedia} = require('../Controllers/whatsapp')
const {authenticateMiddleware} = require('../Middleware/authenticate_middleware')
const {sendMessageSchema, sendMediaSchema, validationScheme} = require('../Validations/whatsapp.schema')
const {phoneNumberFormatter} = require('../Helpers/formatter')
const express = require('express');
const routerWithAuth = express.Router();
const routerWithOutAuth = express.Router();
routerWithAuth.use(authenticateMiddleware);
const {createClientId, deleteClient, allClientReady, checkClientWithClientId, updateClientId} = require('../Configs/database');
const {infoLog, emergecyLog} = require('../Services/telegram');

routerWithAuth.post('/check-whatsapp', async (req, res) => {
  validationScheme(req, res);

  const number = phoneNumberFormatter(req.body.number);
  const wa = whatsapp.get(req.headers.authorization);
  const client = wa?.client;
    // Make sure the sender is exists & ready
    if (!wa?.ready) {
      return res.status(422).json({
        code : 400100,
        status: false,
        message: `Your whatsapp not ready, check your whatsapp !!!`
      })
    }
    const isRegisteredNumber = await client.isRegisteredUser(number);
    if (!isRegisteredNumber) {
      return res.status(200).json({
        code : 400101,
        status: false,
        message: 'The number is not registered'
      });
    }
    return res.status(200).json({
      code : 200000,
      status: true,
      message: 'Whatsapp registered',
      data: isRegisteredNumber
    });
  
   
});
routerWithAuth.post('/send-message', sendMessageSchema, async (req, res) => {
    validationScheme(req, res);

    const number = phoneNumberFormatter(req.body.number);
    const message = req.body.message;
    const wa = whatsapp.get(req.headers.authorization);
    const client = wa?.client;
      // Make sure the sender is exists & ready
      if (!wa?.ready) {
        return res.status(400).json({
          code: 400100,
          status: false,
          message: `Your whatsapp not ready, check your whatsapp !!!`
        })
      }
      const isRegisteredNumber = await client.isRegisteredUser(number);
      if (!isRegisteredNumber) {
        return res.status(422).json({
          code: 422100,
          status: false,
          message: 'The number is not registered'
        });
      }
    
      client.sendMessage(number, message).then(response => {
        res.status(200).json({
          code: 200100,

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
        emergecyLog(err)
        return res.status(500).json({
          code: 500100,
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
  const client = wa?.client;
    // Make sure the sender is exists & ready
    if (!wa.ready) {
      return res.status(300).json({
        code: 400200,
        status: false,
        message: `The whatsapp not ready!`
      })
    }
    const isRegisteredNumber = await client.isRegisteredUser(number);
    if (!isRegisteredNumber) {
      return res.status(422).json({
        code: 422201,
        status: false,
        message: 'The number is not registered'
      });
    }
    const media = await MessageMedia.fromUrl(url);
    client.sendMessage(number, media, {caption: caption}).then(response => {
      res.status(200).json({
        code:200200,
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
      emergecyLog(err);
     return res.status(500).json({
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
        emergecyLog(error);
        return res.status(200).json({
          status: false,
          message: error,
        });
      })
    })

routerWithOutAuth.post('/create-client', async (req, res) => {
  checkClientWithClientId(req.body.client_id).then((result)=>{
if(!result){
  createClientId({
    client_id : req.body.client_id,
    name : req.body.name,
    description: req.body.description,
    expired_at : req.body.expired_at
  }).then((response) => {
    const io = req.app.get('socketio');
    init(response.api_key, io);
    return res.status(200).json({
        status: true,
        message: "success",
        data: response
      });
  }).catch((error) => {
    emergecyLog(error);
    return res.status(400).json({
      status: false,
      message: "Gagal create client",
      data: error
    });
  })
}else{
  return res.status(500).json({
    status: false,
    message: "Your client id is exists",
    data: result
  });
}
  });
     
    })

    routerWithOutAuth.put('/update-client/:client_id', async (req, res) => {
      checkClientWithClientId(req.params.client_id).then((result)=>{
    if(result){
      updateClientId({
        client_id : req.params.client_id,
        expired_at : req.body.expired_at
      }).then((response) => {
 
        return res.status(200).json({
            status: true,
            message: "success",
            data: response
          });
      }).catch((error) => {
        return res.status(400).json({
          status: false,
          message: "Gagal create client",
          data: error
        });
      })
    }else{
      return res.status(500).json({
        status: false,
        message: "Your client id not found",
        data: result
      });
    }
      });
         
 })

    routerWithOutAuth.get('/client/:client_id', async (req, res) => {
    const clientID = req.params.client_id;
// get url parameters
      allClientReady(clientID).then((response) => {
        console.log(res);
        // add client();
        return res.status(200).json({
            status: true,
            message: "success",
            data: response
          });
      }).catch((error) => {
        return res.status(500).json({
          status: false,
          message: "Not Found Client ID",
          data: error
        });
      })
    })
    routerWithOutAuth.get('/client', async (req, res) => {
      const clientID = '';
  // get url parameters
        allClientReady(clientID).then((response) => {
          console.log(res);
          // add client();
          return res.status(200).json({
              status: true,
              message: "success",
              data: response
            });
        }).catch((error) => {
          return res.status(500).json({
            status: false,
            message: "Not Found Client ID",
            data: error
          });
        })
      })

    module.exports = {
      routerWithAuth, routerWithOutAuth
    } 