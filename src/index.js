import through from 'through2';
import PluginError from 'plugin-error';
import postcss from 'postcss';
import topdoc from 'postcss-topdoc';

// consts
const PLUGIN_NAME = 'gulp-topdoc';

// plugin level function (dealing with files)
export default function gulpTopdoc() {
  return through.obj((file, enc, cb) => {
    if (file.isStream()) {
      return cb(new PluginError(PLUGIN_NAME, 'Streaming not supported'));
    }
    if (file.isBuffer()) {
      try {
        postcss([topdoc({
            fileData: {
              sourcePath: './test/fixtures/button.css',
            },
          })])
          .process(file.contents, {
            from: './test/fixtures/button.css'
          })
          .then((result) => {
            console.log(result);
          });
        console.log(file.contents);
      } catch (e) {
        return cb(new PluginError(PLUGIN_NAME, e));
      }
    }
    cb(null, file);
  });
}
