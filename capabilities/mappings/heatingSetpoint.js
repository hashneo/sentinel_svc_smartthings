'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.temperature === undefined )
        _data.temperature = {};

    if ( _data.temperature.heat === undefined )
        _data.temperature.heat = {};

    _data.temperature.heat.set = (_state.value);


    return _data;
};