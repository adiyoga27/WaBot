const { Client, LocalAuth, MessageMedia, ClientInfo  } = require('whatsapp-web.js')
const {allClientReady, deleteClient} = require('../Configs/database');
const {infoLog, emergecyLog} = require('../Services/telegram');

const fs = require('fs');

const qrcode = require('qrcode');
const qrcodeTerminal = require('qrcode-terminal');
const whatsapp = new Map()  

const init = function(apiKey, io) {
    whatsapp.set(apiKey, {
        ready: false,
        client: new Client({
            restartOnAuthFail: true,
            puppeteer: {
                // executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
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
              takeoverOnConflict: true,
            authStrategy: new LocalAuth({
                clientId: apiKey,
                
            })
        }),
        
    });
    const wa = whatsapp.get(apiKey);
    const client = wa.client;

    client.on('qr', (qr) => {
   
        qrcode.toDataURL(qr, (err, url) => {
            io.emit('device', {
                status : 'scan_qr',
                api_key: apiKey,
                ready :  false,
                qr: url,
                message: 'Please scan your whatsapp !!!'
    
            });
          });
        qrcode.generate(qr, {small:true})
        qrcodeTerminal
        console.log('QR RECEIVED', qr)
    });
    client.on('authenticated', async () => {
        console.log()
        io.emit('device', {
            status : 'connected',
            api_key: apiKey,
            ready :  true,
            // name : client.contact.name,
            // phone: client.contact.number,
            // message: `Your whatsapp already connected ${client.contact.name} / ${client.contact.number}`
        });
      });
    
    
      client.on('auth_failure', function() {
        io.emit('message', { id: apiKey, text: 'Auth failure, restarting...' });
        io.emit('device', {
            status : 'disconnected',
            api_key: apiKey,
            ready :  false,
            message: 'Auth failure, restarting...'
        });
      });
      client.on('disconnected', (reason) => {
        io.emit('message', { id: apiKey, text: 'Whatsapp is disconnected!' });
        client.destroy();
        client.initialize();
    
        // Menghapus pada file sessions
       
    
      });    
      client.on('change_state', state => { 
        console.log(`Client ${apiKey} state changed to ${state}`)
      });
    client.on('ready', () => {
        wa.ready = true;
        whatsapp.set(apiKey, wa)
        io.emit('device', {
            status : 'connected',
            api_key: apiKey,
            ready :  true,
            name : client.info.me.user,
            phone: client.info.pushname,
            message: `Your whatsapp already connected +${client.info.me.user} / ${client.info.pushname}`
        });
        console.log('Client is ready!')
    });

    client.initialize();

}
const gettingStarted = function(io) {
    allClientReady('').then((response) => {
        
        response.forEach((res) => {
            init(res.api_key, io);
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
        init(apiKey, io);
    
        return true;
    } catch (error) {
        emergecyLog(error)
        return error;
    }
 
}


module.exports = {
    init, whatsapp, gettingStarted, logoutDevice, MessageMedia
}
