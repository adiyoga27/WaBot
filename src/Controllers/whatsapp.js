const { Client, LocalAuth, MessageMedia  } = require('whatsapp-web.js')
const {allClientReady, deleteClient} = require('../Configs/database');
const fs = require('fs');

const qrcode = require('qrcode-terminal');
const whatsapp = new Map()  

const init = function(apiKey) {
    whatsapp.set(apiKey, {
        ready: false,
        client: new Client({
            restartOnAuthFail: true,
            puppeteer: {
                executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
                // executablePath: '/usr/bin/google-chrome-stable',
                headless: true,
                args: [
                  '--no-sandbox',
                  '--disable-setuid-sandbox',
                  '--disable-dev-shm-usage',
                  '--disable-accelerated-2d-canvas',
                  '--no-first-run',
                  '--no-zygote',
                  '--single-process', // <- this one doesn't works in Windows
                  '--disable-gpu'
                ],
              },
            authStrategy: new LocalAuth({
                clientId: apiKey,
                
            })
        }),
        
    });
    const wa = whatsapp.get(apiKey);
    const client = wa.client;
  

    client.on('qr', (qr) => {
        qrcode.generate(qr, {small:true})
        console.log('QR RECEIVED', qr)
    });

    client.on('ready', () => {
        wa.ready = true;
        whatsapp.set(apiKey, wa)
        console.log('Client is ready!')
    });

    client.initialize();

}
const gettingStarted = function(apiKey) {
    allClientReady().then((response) => {
        response.forEach((res) => {
            init(res.api_key);
        });
    })
}

const logoutDevice = async function(apiKey) {
 
    try {
        base_path = './.wwebjs_auth';
        path = `${base_path}/session-${apiKey}`;
        whatsapp.get(apiKey).client.logout();
        if (!fs.existsSync(path)) return false;
    
        fs.rmSync(path, { recursive: true, force: true });
        console.log(path);
        init(apiKey);
    
        return true;
    } catch (error) {
        return error;
    }
 
}


module.exports = {
    init, whatsapp, gettingStarted, logoutDevice, MessageMedia
}
