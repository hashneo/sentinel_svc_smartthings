'use strict';

module.exports.process = (_data, _state) => {

    if ( _state.value[0] === '#' && _state.value.length === 7 ) {
        _data.color = {
            red: _state.value.substring(1, 3),
            green: _state.value.substring(3, 5),
            blue: _state.value.substring(5, 7)
        };
    }

    return _data;
};