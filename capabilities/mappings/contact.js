'use strict';

module.exports.process = (_data, _state) => {

    _data.contact = {
        armed : true,
        tripped : {
            current : (_state.value === 'open'),
            last : ( _state.timestamp || new Date().toISOString() )
        }
    };

    return _data;
};