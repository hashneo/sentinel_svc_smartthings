'use strict';
require('array.prototype.find');

const EventEmitter = require('events').EventEmitter;
const Encoder = require('form-urlencoded').default;

function BearerTokenAuthenticator(token){
    this.getToken = () =>{
        return token;
    }
}

function SmartThingsClient(auth){

    const logger = require('sentinel-common').logger;

    const bent = require('bent');
    const endPointsUrl = 'https://graph.api.smartthings.com/api/smartapps/endpoints';

    let baseUri;

    async function _call(url, method, data){

        if (!baseUri && (url !== endPointsUrl) ){
            let d = await _call( endPointsUrl, 'GET');
            baseUri = d[0].uri;
        }

        return new Promise( async (fulfill, reject) => {

            const b = bent(method, [200,201]);

            if ( url !== endPointsUrl ){
                url = baseUri + url;
            }

            let headers = {
                Authorization : `Bearer ${auth.getToken()}`
            };

            let body = null;

            if ( data !== undefined ) {
                headers['Context-Type'] = 'application/json';
                //body = Encoder(data);
                /*
                let params = [];

                data.forEach( (arg) =>{
                    params.push( `arg=${arg}` );
                });

//                url += '?' + params.join('&');

                body = Encoder( { params } );
*/
                body = { args : data };
            }

            logger.debug( url );

            b(url, body, headers)
                .then((res) => {
                    res.json()
                        .then((data) =>{
                            return fulfill(data);
                        });
                })
                .catch((err) => {
                    reject(err);
                });

        });

    }

    this.sendCommand = (id, name, params) => {
        return new Promise( (fulfill, reject) => {
            _call(`/device/${id}/command/${name}`, 'POST', params)
                .then( (data) => {
                    fulfill(data);
                })
                .catch((err)=>{
                    reject(err);
                })
        });
    };

    this.devices = new function() {
        this.list = () => {
            return new Promise( ( fulfill, reject ) => {
                _call('/devices', 'GET')
                    .then( (data) => {
                        fulfill(data);
                    })
                    .catch((err)=>{
                        reject(err);
                    })

            })
        };

        this.getStatus = (id) => {
            return new Promise( ( fulfill, reject ) => {
                _call(`/device/${id}/status`, 'GET')
                    .then( (data) => {
                        fulfill(data);
                    })
                    .catch((err)=>{
                    })
                        reject(err);
            })
        };
    };

}

function SmartThings(config) {

    if ( !(this instanceof SmartThings) ){
        return new SmartThings(config);
    }

    let that = this;

    EventEmitter.call(this);

    //const {SmartThingsClient, BearerTokenAuthenticator} = require('@smartthings/core-sdk');
    const client = new SmartThingsClient(new BearerTokenAuthenticator(config.groovySmartApp.accessToken));

    const redis = require('redis');
    const logger = require('sentinel-common').logger;

    let pub = redis.createClient(
        {
            host: process.env.REDIS || global.config.redis || '127.0.0.1' ,
            socket_keepalive: true,
            retry_unfulfilled_commands: true
        }
    );

    pub.on('end', function(e){
        logger.info('Redis hung up, committing suicide');
        process.exit(1);
    });

    const messageHandler = require('./messageHandler')();

    messageHandler.on('device.event', (data) => {
        that.emit('device.event', data);
    });

    this.loadDevices = () => {
        return new Promise( async ( fulfill, reject ) => {

            async function loadRooms() {

                let data = {};
                return new Promise( async ( fulfill, reject ) => {
                    client.locations.list()
                        .then((locations) => {
                            locations.forEach((location) => {
                                client.rooms.list(location.locationId)
                                    .then((rooms) => {
                                        rooms.forEach( (room) =>{
                                            data[room.roomId] = { name : room.name, location : location }
                                        });

                                        fulfill(data);
                                    })
                                    .catch( (err) => {
                                        reject(err);
                                    })
                            });

                        })
                        .catch( (err) => {
                            reject(err);
                        })
                });
            }

            //let deviceTypes = await loadDeviceTypes();
            //let rooms = await loadRooms();

            client.devices.list()
                .then( (devices) => {

                    devices.forEach( async (device) => {
/*
                        let capabilities = [];
                        device.components.forEach( (component) => {
                               if ( component.capabilities ){
                                   component.capabilities.forEach( (capability) => {
                                       capabilities.push(capability.id);
                                   });
                               }

                               //console.log ( `${device.label} -> ${capabilities.join(',')}`)
                        });
*/
                        let room; // = rooms[device.roomId];

                        if (room !== undefined) {
                            device.room = room;
                        }

                    });

                    fulfill(devices);

                })
                .catch( (err) => {
                    reject(err);
                });
        });
    };

    this.getDeviceStatus = (id) => {
        return client.devices.getStatus(id);
    };

    this.sendCommand = (id, name, params) => {
        return client.sendCommand(id, name, params);
    };

}

SmartThings.prototype = Object.create(EventEmitter.prototype);

module.exports = SmartThings;