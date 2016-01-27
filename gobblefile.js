'use strict';
var gobble = require('gobble');

module.exports = gobble([
  gobble('src/root'),
  gobble('src/js').transform('babel', {}).transform('browserify', {
    entries: 'wobble.js',
    dest: 'bundle.js'
  })
]);