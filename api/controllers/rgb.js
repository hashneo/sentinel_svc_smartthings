'use strict';

var convert = require('color-convert');

module.exports.setLightColor = (req, res) => {

    let id = req.swagger.params.id.value;

    let r = req.swagger.params.r.value ? req.swagger.params.r.value : 0;
    let g = req.swagger.params.g.value ? req.swagger.params.g.value : 0;
    let b = req.swagger.params.b.value ? req.swagger.params.b.value : 0;
    let w = req.swagger.params.w.value ? req.swagger.params.w.value : 0;

    let p = [];

    p.push ( global.module.sendCommand(id, 'setColor', [ { hex : `#${convert.rgb.hex( r, g, b )}` } ] ) );
    p.push ( global.module.sendCommand(id, 'setWhiteLevel', [ w ] ) );

    Promise.all(p)
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(500).json( { code: err.code || 0, message: err.message } );
        });
};

module.exports.runAnimation = (req, res) => {
    let id = req.swagger.params.id.value;

    let program = req.swagger.params.program.value;

    global.module.sendCommand(id, program)
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(err.code >= 400 && err.code <= 451 ? err.code : 500).json( { code: err.code || 0, message: err.message } );
        });
};

module.exports.stopAnimation = (req, res) => {
    let id = req.swagger.params.id.value;

    global.module.sendCommand(id, 'off')
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(err.code >= 400 && err.code <= 451 ? err.code : 500).json( { code: err.code || 0, message: err.message } );
        });
};