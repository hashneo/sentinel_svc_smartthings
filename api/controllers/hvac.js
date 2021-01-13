'use strict';

module.exports.setHvacMode = (req, res) => {

    let id = req.swagger.params.id.value;
    let mode = req.swagger.params.mode.value;

    global.module.sendCommand(id, 'setThermostatMode', [mode])
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(err.code >= 400 && err.code <= 451 ? err.code : 500).json( { code: err.code || 0, message: err.message } );
        });
};

module.exports.setHvacTemp = (req, res) => {

    let id = req.swagger.params.id.value;
    let mode = req.swagger.params.mode.value;
    let temp = req.swagger.params.temp.value;

    let setCurrentSetpoint;

    switch (mode){
        case 'heat':
            setCurrentSetpoint =  global.module.sendCommand(id, 'setHeatingSetpoint', [temp]);
            break;
        case 'cool':
            setCurrentSetpoint =  global.module.sendCommand(id, 'setCoolingSetpoint', [temp]);
            break;
    }

    setCurrentSetpoint
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(err.code >= 400 && err.code <= 451 ? err.code : 500).json( { code: err.code || 0, message: err.message } );
        });

};

module.exports.setHvacFanMode = (req, res) => {

    let id = req.swagger.params.id.value;
    let mode = req.swagger.params.mode.value;

    switch (mode){
        case 'auto':
            mode = 'Auto';
            break;
        case 'continuous':
            mode = 'on';
            break;
        case 'periodic':
            mode = 'auto';
            break;
    }
    global.module.sendCommand(id, 'setThermostatFanMode ', [mode])
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(err.code >= 400 && err.code <= 451 ? err.code : 500).json( { code: err.code || 0, message: err.message } );
        });

};
