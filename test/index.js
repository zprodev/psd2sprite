const assert = require('assert');
const psd2sprite = require('../index.js');
const path = require('path');
const fs = require('fs');

const psdFilePath = path.join(__dirname, 'sample.psd');
const outDir = path.join(__dirname, 'output');

psd2sprite(psdFilePath);

psd2sprite(psdFilePath, outDir);
