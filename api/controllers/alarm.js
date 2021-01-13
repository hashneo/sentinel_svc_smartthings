'use strict';

module.exports.setAlarmArmedMode = (req, res) => {

    let id = req.swagger.params.id.value;
    let mode = req.swagger.params.mode.value;
    let code = req.swagger.params.pin.value;

    switch (mode) {
        case 'away':
            mode = 'Armed'; break;
        case 'stay':
            mode = 'Stay'; break;
        case 'night':
            mode = 'Night'; break;
        case 'vacation':
            mode = 'Vacation'; break;
    }

    res.status(501).json( { code: 501, message: 'not implemented' } );

};

module.exports.setAlarmDisarmed = (req, res) => {

    let id = req.swagger.params.id.value;
    let code = req.swagger.params.pin.value;

    res.status(501).json( { code: 501, message: 'not implemented' } );

};

module.exports.setAlarmChimeState = (req, res) => {

    let id = req.swagger.params.id.value;
    let state = req.swagger.params.state.value;
    let code = req.swagger.params.pin.value;

    switch (state) {
        case 'on':
        case'off':
            break;
        case 'toggle':
            break;
    }

    res.status(501).json( { code: 501, message: 'not implemented' } );

};
