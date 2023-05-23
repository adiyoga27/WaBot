const TelegramLogger = require('node-telegram-logger')
const process = require('process');
require('dotenv').config()
let tg = new TelegramLogger(process.env.TELEGRAM_API, process.env.TELEGRAM_CHANNEL)

 const emergecyLog = function (message){
    tg.sendMessage('====== '+process.env.APP_NAME+'======\n\n'+message+'\n','EMERGENCY')

}

 const infoLog = function (message){

    tg.sendMessage('======'+process.env.APP_NAME+" : "+'======\n\n'+message+'\n','INFO')
}

module.exports = {
    infoLog, emergecyLog
}