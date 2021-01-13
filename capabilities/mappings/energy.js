'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.energy === undefined )
        _data.energy = {};

    _data.energy.level = _state.value;

    return _data;
};