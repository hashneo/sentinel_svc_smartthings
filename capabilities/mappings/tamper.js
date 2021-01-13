'use strict';

module.exports.process = (_data, _state) => {

    _data.tamper = {
        level : (_state.value)
    };

    return _data;
};