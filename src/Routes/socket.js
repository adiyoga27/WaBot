const {whatsapp, init} = require('../Controllers/whatsapp')
const {checkClientId} = require('../Configs/database');
const { response } = require('express');

const initSocket = function (io) {
   
    io.on('connection', function(socket) {
        // console.log('Create session: ' );
        socket.on('init', function(data) {
           const client =  whatsapp.get(data.api_key)?.client;
           if(client?.info?.me){
            io.emit('device', {
                status : 'connected',
                api_key: data.api_key,
                ready :  true,
                name : client.info.me.user,
                phone: client.info.pushname,
                message: `Your whatsapp already connected +${client.info.me.user} / ${client.info.pushname}`
            });
           }
        
        })
        socket.on('status', function(data) {
            
            const apiKey = data.api_key
            setLoading(io, apiKey);
            const client =  whatsapp.get(data.apikey)?.client;
            if(client?.info?.me){
                io.emit('device', {
                    status : 'connected',
                    api_key: apiKey,
                    ready :  true,
                    name : client.info.me.user,
                    phone: client.info.pushname,
                    message: `Your whatsapp already connected +${client.info.me.user} / ${client.info.pushname}`
                });
            }
           
        });
        socket.on('logout', function(data) {
            const apiKey = data.api_key
            setLoading(io, apiKey);
           const client =  whatsapp.get(data.api_key)?.client;
           client.logout();
           init(apiKey, io);
            
            io.emit('device', {
                status : 'logout',
                api_key: apiKey,
                ready :  false,
                message: `Your device success for logout`
            });

           
        });
        socket.on('scan', function(data) {
            const apiKey = data.api_key
            setLoading(io, apiKey);

            
        });
        socket.on('service', function(data) {
            const apiKey = data.api_key
            const isActive = data.is_active
            setLoading(io, apiKey);


        });

        socket.on('find', function(data){
            const apiKey = data.api_key
            setLoading(io, apiKey);
            checkClientId(apiKey).then((response)=>{
                if(!response){
                    io.emit('device', {
                        status : 'failed',
                        api_key: apiKey,
                        ready :  false,
                        message: `Your apikey not valid, check your apikey`
                    });
                }
            })
        })

    });
    
    
}

const setLoading = function(io, apiKey){
    io.emit('device', {
        status : 'loading',
        api_key: apiKey,
        ready :  false,
        message: 'Please waiting !!!'
    });
}

module.exports = {
    initSocket
}