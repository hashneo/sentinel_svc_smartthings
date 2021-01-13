'use strict';

module.exports.process = (_data, _state) => {

    _data.battery = {
        level : (_state.value),
        reported : _state.timestamp || new Date().toISOString()
    };

    return _data;
};