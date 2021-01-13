'use strict';

module.exports.process = (_data, _state) => {

    _data.fan = {
        speed : _state.value
    };

    return _data;
};