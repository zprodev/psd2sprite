const fs = require('fs');
const rimraf = require('rimraf');
const path = require('path');
const psd = require('psd');
const Spritesmith = require('spritesmith');

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
  const outImgDirPath = path.join(outDirPath, 'tmp');
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
    'children' : []
  };
  queueNodesStructure.push(psdStructure);

  const sprites = [];
  let pngOutputQueueCount = 0;
  let isRunning = true;
  
  queueLoop: while (0 < queueNodes.length) {
    let queueIndex = queueNodes.length - 1;
    let nodes = queueNodes[queueIndex];
    let nodesIndex = queueNodesIndex[queueIndex];
    let nodesName = queueNodesName[queueIndex];
    let nodesStructure = queueNodesStructure[queueIndex];

    if (nodesName === undefined) {
      nodesName = '';
    } else {
      nodesName += '_';
    }
  
    while (nodesIndex < nodes.length) {
      let node = nodes[nodesIndex];
      nodesIndex++;
      if (node.layer.visible === false) continue;
      if (node.type === 'group') {
        queueNodes.push(node._children);
        queueNodesIndex[queueIndex] = nodesIndex;
        queueNodesIndex.push(0);
        queueNodesName.push(nodesName + node.name);
        let structure = {
          'name' : node.name,
          'children' : []
        };
        nodesStructure.children.push(structure);
        queueNodesStructure.push(structure);
        continue queueLoop;
      } else {
        let saveName = nodesName + node.name + '.png';
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
    fs.writeFileSync(path.join(dirPath, fileName + '_sprite.png'), result.image);
    // Output the SpriteJson
    let fileNameCoordinates = {};
    Object.keys(result.coordinates).forEach(function (key) {
      fileNameCoordinates[path.basename(key)] = result.coordinates[key];
    });
    fs.writeFileSync(path.join(dirPath, fileName + '_sprite.json'), JSON.stringify(fileNameCoordinates));
  });
}

module.exports = psd2sprite;
