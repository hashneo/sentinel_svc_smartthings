'use strict';

module.exports.process = (_data, _state) => {

    _data.volume = {
        mute : (_state.value === 'muted'),
    };

    return _data;
};