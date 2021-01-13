'use strict';

module.exports.process = (_data, _state) => {

    if ( _data.lock === undefined )
        _data.lock = {};

    _data.lock.locked = (_state.value === 'locked');

    return _data;
};