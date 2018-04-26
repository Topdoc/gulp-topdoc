'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _through = require('through2');

var _through2 = _interopRequireDefault(_through);

var _pluginError = require('plugin-error');

var _pluginError2 = _interopRequireDefault(_pluginError);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// consts
var PLUGIN_NAME = 'gulp-prefixer';

function prefixStream(prefixText) {
  var stream = (0, _through2.default)();
  stream.write(prefixText);
  return stream;
}

// plugin level function (dealing with files)
function gulpPrefixer(prefixText) {
  if (!prefixText) {
    throw new _pluginError2.default(PLUGIN_NAME, 'Missing prefix text!');
  }

  prefixText = new Buffer(prefixText); // allocate ahead of time

  // creating a stream through which each file will pass
  var stream = _through2.default.obj(function (file, enc, cb) {
    if (file.isBuffer()) {
      this.emit('error', new _pluginError2.default(PLUGIN_NAME, 'Buffers not supported!'));
      return cb();
    }

    if (file.isStream()) {
      // define the streamer that will transform the content
      var streamer = prefixStream(prefixText);
      // catch errors from the streamer and emit a gulp plugin error
      streamer.on('error', this.emit.bind(this, 'error'));
      // start the transformation
      file.contents = file.contents.pipe(streamer);
    }

    // make sure the file goes through the next gulp plugin
    this.push(file);
    // tell the stream engine that we are done with this file
    cb();
  });

  // returning the file stream
  return stream;
}

// exporting the plugin main function
exports.default = gulpPrefixer;
module.exports = exports['default'];