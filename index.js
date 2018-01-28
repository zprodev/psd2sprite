const fs = require('fs');
const path = require('path');
const rimraf = require('rimraf');
const psd = require('psd');
const Spritesmith = require('spritesmith');

/**
 * Convert PSD to SpriteSheet
 * @param {string} psdFile Relative path or absolute path of PSD file
 * @param {string} [outDir] Set this when outputting to a different directory from the PSD file
 */
function psd2sprite(psdFile, outDir) {
  const psdFilePath = path.resolve(psdFile);
  const psdFileName = path.basename(psdFilePath, path.extname(psdFilePath));

  // initialize output directory.
  let outDirPath;
  if (outDir) {
    outDirPath = path.resolve(outDir);
  } else {
    outDirPath = path.dirname(psdFilePath);
  }
  const outImgDirPath = path.join(outDirPath, psdFileName + '_ss');
  if (!fs.existsSync(outDirPath)) {
    fs.mkdirSync(outDirPath);
  }
  if (fs.existsSync(outImgDirPath)) {
    rimraf.sync(outImgDirPath);
  }
  fs.mkdirSync(outImgDirPath);
  
  // get root node.
  const psdData = psd.fromFile(psdFilePath);
  psdData.parse();
  const rootNode = psdData.tree();

  const queueNodes = [];
  const queueNodesIndex = [];
  const queueNodesName = [];
  const queueNodesStructure = [];

  queueNodes.push(rootNode._children);
  queueNodesIndex.push(0);
  queueNodesName.push(undefined);
  const psdStructure = {
    'group' : []
  };
  queueNodesStructure.push(psdStructure);

  const sprites = [];
  let pngOutputQueueCount = 0;
  let isRunning = true;
  
  queueLoop: while (0 < queueNodes.length) {
    const queueIndex = queueNodes.length - 1;
    const nodes = queueNodes[queueIndex];
    const nodesStructure = queueNodesStructure[queueIndex];
    let nodesIndex = queueNodesIndex[queueIndex];
    let nodesName = queueNodesName[queueIndex];

    if (nodesName === undefined) {
      nodesName = '';
    } else {
      nodesName += '_';
    }
  
    while (nodesIndex < nodes.length) {
      const node = nodes[nodesIndex];
      nodesIndex++;
      if (node.layer.visible === false) continue;
      if (node.type === 'group') {
        queueNodes.push(node._children);
        queueNodesIndex[queueIndex] = nodesIndex;
        queueNodesIndex.push(0);
        queueNodesName.push(nodesName + node.name);
        const structure = {
          'name' : node.name,
          'group' : []
        };
        nodesStructure.group.push(structure);
        queueNodesStructure.push(structure);
        continue queueLoop;
      } else {
        const saveName = nodesName + node.name + '.png';
        sprites.push(path.join(outImgDirPath, saveName));
        pngOutputQueueCount++;
        node.layer.image.saveAsPng(path.join(outImgDirPath, saveName)).then(() => {
          pngOutputQueueCount--;
          if (!isRunning && pngOutputQueueCount <= 0) {
            makeSprite(sprites, outDirPath, psdFileName);
          }
        });
      }
    }
  
    queueNodes.pop();
    queueNodesIndex.pop();
    queueNodesName.pop();
    queueNodesStructure.pop();
  }
  isRunning = false;
}

function makeSprite(sprites, dirPath, fileName) {
  Spritesmith.run({
    src: sprites
  }, function handleResult (err, result) {
    // If there was an error, throw it 
    if (err) throw err;

    // Output the SpritePng
    const spritePngName = fileName + '_ss.png';
    fs.writeFileSync(path.join(dirPath, spritePngName), result.image);
    // Output the SpriteJson
    const frames = {};
    Object.keys(result.coordinates).forEach(function (key) {
      const coordinate = result.coordinates[key];
      const frame = {};
      frame.x = coordinate.x;
      frame.y = coordinate.y;
      frame.w = coordinate.width;
      frame.h = coordinate.height;
      const spriteSourceSize = {};
      spriteSourceSize.x = 0;
      spriteSourceSize.y = 0;
      spriteSourceSize.w = coordinate.width;
      spriteSourceSize.h = coordinate.height;
      const sourceSize = {};
      sourceSize.w = coordinate.width;
      sourceSize.h = coordinate.height;
      frames[fileName + '_' + path.basename(key)] = {
        'frame': frame,
        'rotated': false,
        'trimmed': false,
        'spriteSourceSize': spriteSourceSize,
        'sourceSize': sourceSize,
        'pivot': {'x':0.5,'y':0.5}
      };
    });
    const outJsonObject = {};
    outJsonObject.frames = frames;
    outJsonObject.meta = {
      'image': spritePngName,
      'format': 'RGBA8888',
      'size': {
        'w':result.properties.width,
        'h':result.properties.height
      },
      'scale': 1,
    };
    fs.writeFileSync(path.join(dirPath, fileName + '_ss.json'), JSON.stringify(outJsonObject));
  });
}

module.exports = psd2sprite;
