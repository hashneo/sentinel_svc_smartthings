'use strict';

module.exports.process = (_data, _state) => {

    _data.saturation = {
        level : (_state.value),
    };

    return _data;
};