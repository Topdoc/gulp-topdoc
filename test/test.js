import test from 'ava';
import gulpTopdoc from '../src/index.js';
import path from 'path';
import File from 'vinyl';
import fs from 'fs';
import vfs from 'vinyl-fs';

function read(file) {
  return fs.readFileSync(file, 'utf8').trim();
}
function clean(obj) {
  return JSON.parse(JSON.stringify(obj));
}

test.cb('should emit error on streamed file', t => {
  const topdocParser = gulpTopdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
    }
  });
  vfs.src('./test/fixtures/button.css' , {
      buffer: false
    })
    .pipe(topdocParser)
    .once('error', (err) => {
      t.is(err.message, 'Streaming not supported');
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

test.cb('should generate Topdoc Object', t => {
  const expected = JSON.parse(read('./test/expected/button.json'));
  const topdocParser = gulpTopdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
    }
  });
  vfs.src('./test/fixtures/button.css').pipe(topdocParser)
    .once('data', file => {
      t.deepEqual(clean(file.topdoc), expected);
      t.end();
    });
});

test.cb('should accept title in fileData', t => {
  const expected = JSON.parse(read('./test/expected/button-title.json'));
  const topdocParser = gulpTopdoc({
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
      title: 'lalala',
    }
  });
  vfs.src('./test/fixtures/button.css').pipe(topdocParser)
    .once('data', file => {
      t.deepEqual(clean(file.topdoc), expected);
      t.end();
    });
});

test.cb('Should throw an error if `name` is missing', t => {
  const topdocParser = gulpTopdoc({
    fileData: {
      sourcePath: './test/fixtures/missing-name',
      template: 'lib/template.jade',
    }
  });
  vfs.src('./test/fixtures/missing-name.css').pipe(topdocParser)
    .once('error', (err) => {
      t.is(err.message, 'A component has to at least have a name.');
      t.end();
    });
});

test.cb('Should work even if no sourcePath is set', t => {
  const expected = JSON.parse(read('./test/expected/button.json'));
  const topdocParser = gulpTopdoc({
    fileData: {
      template: 'lib/template.jade',
    }
  });
  vfs.src('./test/fixtures/button.css').pipe(topdocParser)
    .once('data', file => {
      file.topdoc.sourcePath = './test/fixtures/button.css';
      t.deepEqual(clean(file.topdoc), expected);
      t.end();
    });
});

test.cb('Should include nodes with the correct options.', t => {
  const topdocParser = gulpTopdoc({
    includeNodes: true,
    fileData: {
      sourcePath: './test/fixtures/button.css',
      template: 'lib/template.jade',
    }
  });
  vfs.src('./test/fixtures/button.css').pipe(topdocParser)
    .once('data', file => {
      t.is(file.topdoc.components[0].nodes.length, 3);
      t.end();
    });
});
