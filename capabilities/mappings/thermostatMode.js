'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.system === undefined )
        _data.system = {};

    _data.system.mode = (_state.value);

    return _data;
};