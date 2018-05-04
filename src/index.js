import through from 'through2';
import PluginError from 'plugin-error';
import postcss from 'postcss';
import topdoc from 'postcss-topdoc';

const PLUGIN_NAME = 'gulp-topdoc';

export default function gulpTopdoc(opts) {
  const stream = through.obj((file, enc, cb) => {
    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }
    return postcss(topdoc(opts))
      .process(file.contents, {
        from: file.path
      })
      .then((result) => {
        file.topdoc = result.topdoc;
        stream.push(file);
        return cb();
      })
      .catch(error => {
        const errorOptions = {
          fileName: file.path,
          showStack: true
        }
        if (error.name === 'CssSyntaxError') {
          errorOptions.error = error
          errorOptions.fileName = error.file || file.path
          errorOptions.lineNumber = error.line
          errorOptions.showProperties = false
          errorOptions.showStack = false
          error.message + '\n\n' + error.showSourceCode() + '\n'
        }
        cb(new PluginError(PLUGIN_NAME, error, errorOptions))
      });
  });
  return stream;
}
