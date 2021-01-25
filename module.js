'use strict';
require('array.prototype.find');

function _module(config) {

    if ( !(this instanceof _module) ){
        return new _module(config);
    }

    const redis = require('redis');
    var moment = require('moment');
    const logger = require('sentinel-common').logger;
    const mapper = require('./capabilities/map.js');

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

    var NodeCache = require( "node-cache" );

    var deviceCache = new NodeCache();
    var statusCache = new NodeCache();

    var merge = require('deepmerge');

    var net = require ('net');

    var request = require('request');
    var https = require('https');
    var keepAliveAgent = new https.Agent({ keepAlive: true });

    const messageHandler = require('./messageHandler')();

    const smartThings = require('./smartthings')(config);

    /*
        require('request').debug = true
        require('request-debug')(request);
    */

    deviceCache.on( 'set', ( key, value ) => {
        let data = JSON.stringify( { module: global.moduleName, id : key, value : value });
        logger.info( 'sentinel.device.insert => ' + data );
        pub.publish( 'sentinel.device.insert', data);
    });

    deviceCache.on( 'delete', ( key ) => {
        let data = JSON.stringify( { module: global.moduleName, id : key });
        logger.info( 'sentinel.device.delete => ' + data );
        pub.publish( 'sentinel.device.delete', data);
    });

    statusCache.on( 'set', ( key, value ) => {
        let data = JSON.stringify( { module: global.moduleName, id : key, value : value });
        logger.debug( 'sentinel.device.update => ' + data );
        pub.publish( 'sentinel.device.update', data);
    });

	var that = this;

    messageHandler.on('device.update', () => {

    });

    smartThings.on('device.event', (event) => {

        deviceCache.get(event.deviceId, (err, value) => {
            if (err) {
                console.error(err);
                return;
            }

            if ( value === undefined ){
                return;
            }

            let device = value;

            statusCache.get(device.id, (err, status) => {
                if (err) {
                    console.error(err);
                    return;
                }

                let data = processStatusValue( event.capability, { value : event.value } );

                if ( data !== null ) {
                    status = merge(status, data);
                    statusCache.set(device.id, status);
                }
            });

        });

    });

    this.handleHttpCallback = (req, res) => {
        return smartThings.handleHttpCallback(req, res);
    };

    this.getDevices = () => {

        return new Promise( (fulfill, reject) => {
            deviceCache.keys( ( err, ids ) => {
                if (err)
                    return reject(err);

                deviceCache.mget( ids, (err,values) =>{
                    if (err)
                        return reject(err);

                    statusCache.mget( ids, (err, statuses) => {
                        if (err)
                            return reject(err);

                        let data = [];

                        for (let key in values) {
                            let v = values[key];

                            if ( statuses[key] ) {
                                v.current = statuses[key];
                                if (!process.env.DEBUG) {
                                    delete v._device;
                                }
                                data.push(v);
                            }
                        }

                        fulfill(data);
                    });

                });
            });
        });
    };

    this.getDeviceStatus = (id) => {

        return new Promise( (fulfill, reject) => {
            try {
                statusCache.get(id, (err, value) => {
                    if (err)
                        return reject(err);

                    fulfill(value);
                }, true);
            }catch(err){
                reject(err);
            }
        });

    };

    function updateStatus() {
        return new Promise( ( fulfill, reject ) => {
            fulfill();
        });
    }

    this.Reload = () => {
        return new Promise( (fulfill,reject) => {
            fulfill([]);
        });
    };

    this.sendCommand = (id, name, params) => {

        return new Promise( (fulfill,reject) => {

            deviceCache.get(id, (err, value) => {

                if (err)
                    return reject(err);

                if (value === undefined)
                    return reject({code: '404', message: 'not found'});

                if (value._device.components.commands[name] === undefined)
                    return reject({code: '400', message: 'invalid command'});

                smartThings.sendCommand(id, name, params)
                    .then ((result) =>{
                        fulfill(result);
                    })
                    .catch( (err) =>{
                        reject(err);
                    });
            });
        });

    };

    function processStatusValue(k, v){

        try {
            let r = /([a-zA-Z\-]+)([0-9]{0,})/i;
            let m;

            if ((m = k.match(r)) !== null) {

                let p = mapper[m[1]];

                if (p) {
                    let data = p.process({}, v);

                    if (m[2] !== "") {
                        let indexedResult = {};
                        Object.keys(data).forEach((k) => {
                            indexedResult[k] = {};
                            indexedResult[k][m[2]] = data[k];
                        });
                        data = indexedResult;
                    }

                    if (data !== null) {
                        let l = Object.keys(data);

                        if (l.length === 0) {
                            logger.debug(`mapping ${k} does nothing, data => ${JSON.stringify(v)}`)
                        }
                    }
                    return data;
                } else {
                    logger.info(`unknown mapping ${k}, data => ${JSON.stringify(v)}`)
                }

                return null;
            }
        }
        catch(err){
            logger.error(err);
        }
    }

    function processStatus(type, status){
        let result = {};

        if (!status.components || !status.components.main)
            return null;

        Object.keys(status.components.main).forEach( (k) => {

            let data = processStatusValue(k, status.components.main[k]);

            if ( data !== null )
                result = merge( result, data );

        });

        return result;
    }

    function mapType( capabilities ){

        if ( capabilities.find(e => e === 'switch') ){
            if ( capabilities.find(e => e === 'level') ){
                if ( capabilities.find(e => e === 'color') ){
                    return 'light.dimmable.rgbw';
                }
                return 'light.dimmable';
            }
            return 'switch';
        }
        if ( capabilities.find(e => e === 'thermostat') ){
            if ( capabilities.find(e => e === 'heatingSetpoint') && capabilities.find(e => e === 'coolingSetpoint') ){
                return 'hvac';
            }
            return 'sensor.thermostat';
        }
        if ( capabilities.find(e => e === 'valve') ){
            return 'valve';
        }
        if ( capabilities.find(e => e === 'water') ){
            return 'sensor.water';
        }
        if ( capabilities.find(e => e === 'motion') ){
            return 'sensor.motion';
        }
        if ( capabilities.find(e => e === 'contact') ){
            return 'sensor.contact';
        }
        if ( capabilities.find(e => e === 'temperature') ){
            return 'sensor.temperature';
        }
        if ( capabilities.find(e => e === 'humidity') ){
            return 'sensor.humidity';
        }
        if ( capabilities.find(e => e === 'lock') ){
            return 'lock';
        }
        return  'unknown';
    }

    function loadSystem(){
        return new Promise( (fulfill,reject) => {

            smartThings.loadDevices()
                .then( (devices) => {

                    devices.forEach( (device) => {

                        let d = {'id': device.deviceId};

                        d._device = device;

                        if ( d._device.components.commands === undefined ){
                            d._device.components.commands = [];
                        }

                        d.name = device.displayName;

                        if (device.room !== undefined) {
                            d.where = {
                                location: device.room.location.name,
                                room: device.room.name
                            }
                        }

                        d.type = mapType( device.components.capabilities );

                        logger.debug(`device '${d.name} (${d.id})' capabilities '${device.components.capabilities}' mapped to type '${d.type}'`);

                        if ( global.config.types ){
                            if ( global.config.types[d.id] ) {
                                d.type = global.config.types[d.id];
                                logger.debug(`device '${d.name} (${d.id})' manually converted to type '${d.type}'`);
                            }
                        }

                        if ( global.config.hidden ){
                            if ( global.config.hidden.find( id => id === d.id ) ) {
                                d.hidden = true;
                                logger.info(`device '${d.name} (${d.id})' is marked as hidden`);
                            }
                        }

                        if (d.type !== undefined || d.hidden ) {
                            deviceCache.set(d.id, d);

                            if (device.components.states){

                                logger.info(`processing device ${d.name} states`);

                                statusCache.set(d.id, processStatus(d.type, { components : {main : device.components.states } } ));
                            }
                        }
                    })

                });

                fulfill();
        });

    }

    loadSystem()

        .then( () => {

            function pollSystem() {
                updateStatus()
                    .then(() => {
                        setTimeout(pollSystem, 10000);
                    })
                    .catch((err) => {
                        logger.error(err);
                        setTimeout(pollSystem, 60000);
                    });

            }

            setTimeout(pollSystem, 10000);

        })
        .catch((err) => {
            logger.error(err);
            process.exit(1);
        });

    return this;
}

module.exports = _module;