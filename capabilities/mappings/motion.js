'use strict';

module.exports.process = (_data, _state) => {

    _data.motion = {
        armed : true,
        tripped : {
            current : (_state.value === 'active'),
            last : ( _state.timestamp || new Date().toISOString() )
        }
    };

    return _data;
};