'use strict';

const glob = require('glob');
const path = require('path');

// options is optional
let files = glob.sync(__dirname + '/mappings/*.js');

files.forEach( (file) => {
    let name = path.basename(file, '.js');
    module.exports[name] = require(file);
});
