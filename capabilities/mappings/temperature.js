'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.temperature === undefined )
        _data.temperature = {};

    _data.temperature.current = (_state.value);

    return _data;
};