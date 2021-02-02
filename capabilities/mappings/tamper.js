'use strict';

module.exports.process = (_data, _state) => {

    _data.tamper = {
        armed : true,
        tripped : {
            current : (_state.value !== 'clear'),
        }
    };

    return _data;
};