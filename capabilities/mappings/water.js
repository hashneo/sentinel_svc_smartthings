'use strict';

module.exports.process = (_data, _state) => {

    _data.moisture = {
        armed : true,
        tripped : {
            current : (_state.value === 'dry'),
            last : ( _state.timestamp || new Date().toISOString() )
        }
    };

    return _data;
};