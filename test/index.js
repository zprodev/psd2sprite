const assert = require('assert');
const psd2sprite = require('../index.js');
const path = require('path');
const fs = require('fs');
const rimraf = require('rimraf');

const PSD_FILE_NAME = 'sample.psd';
const OUT_JSON_FILE_NAME = 'sample_ss.json';
const OUT_SPRITE_FILE_NAME = 'sample_ss.png';
const OUT_PNG_DIR_NAME = 'sample_ss';

const OUTPUT_DATA = fs.readFileSync(path.join(__dirname, 'sample_test.json'), 'utf-8');

describe('Passing a file path', function() {

  const PSD_FILE_PATH = path.join(__dirname, PSD_FILE_NAME);
  const OUT_JSON_FILE_PATH = path.join(__dirname, OUT_JSON_FILE_NAME);
  const OUT_SPRITE_FILE_PATH = path.join(__dirname, OUT_SPRITE_FILE_NAME);
  const OUT_PNG_DIR_PATH = path.join(__dirname, OUT_PNG_DIR_NAME);

  before(function() {
    rimraf.sync(OUT_PNG_DIR_PATH);
    psd2sprite(PSD_FILE_PATH);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  });

  it('Correct output JSON', function() {
    assert.strictEqual(
      OUTPUT_DATA,
      fs.readFileSync(OUT_JSON_FILE_PATH, 'utf-8')
    );
  });

  it('Correct output SPRITE', function() {
    assert.ok(fs.statSync(OUT_SPRITE_FILE_PATH));
  });

  it('Correct output PNGs', function() {
    const files = fs.readdirSync(OUT_PNG_DIR_PATH);
    assert.strictEqual(8, files.length);
  });
});

describe('Passing file path and directory path', function() {

  const PSD_FILE_PATH = path.join(__dirname, PSD_FILE_NAME);
  const OUTPUT_DIR = path.join(__dirname, 'output');
  const OUT_JSON_FILE_PATH = path.join(OUTPUT_DIR, OUT_JSON_FILE_NAME);
  const OUT_SPRITE_FILE_PATH = path.join(OUTPUT_DIR, OUT_SPRITE_FILE_NAME);
  const OUT_PNG_DIR_PATH = path.join(OUTPUT_DIR, OUT_PNG_DIR_NAME);

  before(function() {
    rimraf.sync(OUTPUT_DIR);
    psd2sprite(PSD_FILE_PATH, OUTPUT_DIR);
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve();
      }, 1000);
    });
  });

  it('Correct output JSON', function() {
    assert.strictEqual(
      OUTPUT_DATA,
      fs.readFileSync(OUT_JSON_FILE_PATH, 'utf-8')
    );
  });

  it('Correct output SPRITE', function() {
    assert.ok(fs.statSync(OUT_SPRITE_FILE_PATH));
  });

  it('Correct output PNGs', function() {
    const files = fs.readdirSync(OUT_PNG_DIR_PATH);
    assert.strictEqual(8, files.length);
  });
});
