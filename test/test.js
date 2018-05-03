import test from 'ava';
import gulpTopdoc from '../src/index.js';
import gulp from 'gulp';
import path from 'path';
import File from 'vinyl';
import fs from 'fs';

function read(file) {
  return fs.readFileSync(file, 'utf8').trim();
}
function clean(obj) {
  return JSON.parse(JSON.stringify(obj));
}
function vinylRead(path) {
  const contents = read(path);
  return new File({
    cwd: __dirname,
    path,
    contents: new Buffer(contents)
  });
}

test.cb('should emit error on streamed file', t => {
  gulp.src(path.join(__dirname, 'fixtures', 'button.css'), {
      buffer: false
    })
    .pipe(gulpTopdoc())
    .once('error', (err) => {
      t.is(err.message, 'Streaming not supported');
      t.end();
    });
});

test.cb('should parse topdoc data', t => {
  const fakeFile = vinylRead('./test/fixtures/button.css');
  const expected = JSON.parse(read('./test/expected/button.json'));
  const topdocParser = gulpTopdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
    }
  });
  topdocParser.write(fakeFile);
  topdocParser.once('data', file => {
    t.deepEqual(clean(file.topdoc), expected);
    t.end();
  });
});

test.cb('should return PostCSS error', t => {
  const fakeFile = new File({
    cwd: __dirname,
    path: path.join(__dirname, 'bad.css'),
    contents: new Buffer('bad css')
  });
  const expected = `${path.join(__dirname, 'bad.css')}:1:1: Unknown word`;
  const topdocParser = gulpTopdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
    }
  });
  topdocParser.write(fakeFile);
  topdocParser.once('error', err => {
    t.regex(err.message, new RegExp(expected));
    t.end();
  });
});

test.cb('should return PostCSS error with file even if not provided by buffer', t => {
  const fakeFile = new File({
    contents: new Buffer('bad css')
  });
  const expected = ':1:1: Unknown word';
  const topdocParser = gulpTopdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
    }
  });
  topdocParser.write(fakeFile);
  topdocParser.once('error', err => {
    t.regex(err.message, new RegExp(expected, 'g'));
    t.end();
  });
});
