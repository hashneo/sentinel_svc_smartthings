'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.fan === undefined )
        _data.fan = {};

    _data.fan.on = (_state.value !== 'idle');

    return _data;
};