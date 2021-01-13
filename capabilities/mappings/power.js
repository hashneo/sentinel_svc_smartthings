'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.power === undefined )
        _data.power = {};

    _data.power.level = _state.value;

    return _data;
};