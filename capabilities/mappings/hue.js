'use strict';

module.exports.process = (_data, _state) => {

    _data.hue = {
        level : (_state.value),
    };

    return _data;
};