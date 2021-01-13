'use strict';

module.exports.process = (_data, _state) => {

    _data.channel = {
        name : (_state.value),
    };

    return _data;
};