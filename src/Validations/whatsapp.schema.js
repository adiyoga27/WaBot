const { checkSchema,  body, validationResult  } = require('express-validator');

 const sendMessageSchema = checkSchema({

  number: {
    notEmpty: {
      bail: true,
      errorMessage: "Number is required",
    },
  },
  message: {
    notEmpty: {
      bail: true,
      errorMessage: "Message is required",
    },
  },
  
});

 const sendMediaSchema = checkSchema({
  number: {
    notEmpty: {
      bail: true,
      errorMessage: "Number is required",
    },
  },
  url: {
    notEmpty: {
      bail: true,
      errorMessage: "Upload your link image / video / audio",
    },
  },
});

const validationScheme = function(req, res) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      status: false,
      message: errors.array()[0]["msg"] ?? "Error Validator !!",
      errors: errors.array(),
    });
  }
} 

module.exports = {
  sendMessageSchema, sendMediaSchema, validationScheme
}