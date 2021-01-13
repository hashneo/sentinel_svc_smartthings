'use strict';

module.exports.process = (_data, _state) => {

    _data.picture = {
        mode : (_state.value),
    };

    return _data;
};