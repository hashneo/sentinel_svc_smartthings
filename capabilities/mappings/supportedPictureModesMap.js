'use strict';

module.exports.process = (_data, _state) => {

    let suportedModes = JSON.parse( _state.value );

    _data.picture = {
        supportedModes : suportedModes.map(item => item.name),
    };

    return _data;
};