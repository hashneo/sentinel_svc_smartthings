'use strict';

module.exports.setLightState = (req, res) => {

    let id = req.swagger.params.id.value;
    let state = req.swagger.params.state.value;

    global.module.sendCommand(id, state)
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(err.code >= 400 && err.code <= 451 ? err.code : 500).json( { code: err.code || 0, message: err.message } );
        });
};

module.exports.setLightLevel = (req, res) => {

    let id = req.swagger.params.id.value;
    let value = req.swagger.params.level.value;

    global.module.sendCommand(id, 'setLevel', [value])
/*        .then( (status) => {
            return global.module.sendCommand(id, 'on');
        })
*/
        .then( (status) => {
            res.json( { data: { status: status }, result : 'ok' } );
        })
        .catch( (err) => {
            res.status(err.code >= 400 && err.code <= 451 ? err.code : 500).json( { code: err.code || 0, message: err.message } );
        });
};
