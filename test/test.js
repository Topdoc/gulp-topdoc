import test from 'ava';
import gulpTopdoc from '../src/index.js';
import gulp from 'gulp';
import path from 'path';
import through from 'through2';

function expectStream(t) {

}

const filename =

test.cb('should prepend text', t => {
  gulp.src(path.join(__dirname, 'fixtures', 'button.css'))
    .pipe(gulpTopdoc('ding'))
    .pipe(result => {
      return through.obj((file, enc, cb) => {
        console.log(file)
        cb();
      });
    })
});
