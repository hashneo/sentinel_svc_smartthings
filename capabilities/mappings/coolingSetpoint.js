'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.temperature === undefined )
        _data.temperature = {};

    if ( _data.temperature.cool === undefined )
        _data.temperature.cool = {};

     _data.temperature.cool.set = (_state.value);

    return _data;
};