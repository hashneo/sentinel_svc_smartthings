'use strict';

module.exports.process = (_data, _state) => {

    _data.source = _state.value;

    return _data;
};