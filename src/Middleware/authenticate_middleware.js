const {checkClientId} = require('../Configs/database');
const authenticateMiddleware = (req, res, next) => {
    // Check if the request is allowed
      // Request is allowed, proceed to the next middleware or route handler

      checkClientId(req.headers.authorization).then((result) => {


        next();

      }).catch((error) => {
        return res.status(401).json({ status: false,message: 'Api Key not Found' });

      });

 
};

module.exports = {
    authenticateMiddleware
}