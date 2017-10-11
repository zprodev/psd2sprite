# psd2sprite

[![Build Status](https://travis-ci.org/zprodev/psd2sprite.svg?branch=master)](https://travis-ci.org/zprodev/psd2sprite)
[![npm](https://img.shields.io/npm/v/psd2sprite.svg)](https://www.npmjs.com/package/psd2sprite)
[![license](https://img.shields.io/github/license/zprodev/psd2sprite.svg)](LICENSE)

Convert PSD to SpriteSheet.

# Usage

First, install this module in your project.

```
$ npm install psd2sprite
```

Import this module to your source code and call like below.

```
var psd2sprite = require('psd2sprite');

psd2sprite('./target.psd');
// -> Output of ./target_sprite.png and ./target_sprite.json

psd2sprite('./target.psd', './outdir');
// -> Output of ./outdir/target_sprite.png and ./outdir/target_sprite.json
```

# License

This software is released under the MIT License, see [LICENSE](LICENSE)