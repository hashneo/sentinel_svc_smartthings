'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.valve  === undefined )
        _data.valve = {};

    _data.valve.open = (_state.value === 'open');

    return _data;
};