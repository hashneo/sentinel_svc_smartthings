'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.switch === undefined )
        _data.switch = {};

    _data.switch.level = _state.value;

    return _data;
};