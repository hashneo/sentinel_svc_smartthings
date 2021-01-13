'use strict';

module.exports.process = (_data, _state) => {

    _data.volume = {
        level : (_state.value),
    };

    return _data;
};