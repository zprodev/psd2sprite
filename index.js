let fs = require('fs');
let rmdirSync = require('rmdir-sync');
let path = require("path");
let psd = require("psd");
let Spritesmith = require('spritesmith');

function psd2sprite(psdFile) {
  let psdFilePath = path.resolve(psdFile);
  let psdFileName = path.basename(psdFilePath, path.extname(psdFilePath));

  // initialize output directory.
  let outDirPath = path.resolve("output");
  let outImgDirPath = path.resolve("output/img");
  rmdirSync(outDirPath);
  if(!fs.existsSync(outDirPath)){
    fs.mkdirSync(outDirPath);
  }
  if(!fs.existsSync(outImgDirPath)){
    fs.mkdirSync(outImgDirPath);
  }

  // get root node.
  let psdData = psd.fromFile(psdFilePath);
  psdData.parse();
  let rootNode = psdData.tree();

  let queueNodes = [];
  let queueNodesIndex = [];
  let queueNodesName = [];
  let queueNodesStructure = [];

  queueNodes.push(rootNode._children);
  queueNodesIndex.push(0);
  queueNodesName.push(undefined);
  let psdStructure = {
    "children" : []
  };
  queueNodesStructure.push(psdStructure);

  let sprites = [];
  let pngOutputQueueCount = 0;
  let isRunning = true;
  
  queueLoop: while(0 < queueNodes.length){
    let queueIndex = queueNodes.length - 1;
    let nodes = queueNodes[queueIndex];
    let nodesIndex = queueNodesIndex[queueIndex];
    let nodesName = queueNodesName[queueIndex];
    let nodesStructure = queueNodesStructure[queueIndex];

    if(nodesName === undefined){
      nodesName = "";
    }else{
      nodesName += "_";
    }
  
    nodeLoop: while(nodesIndex < nodes.length){
      let node = nodes[nodesIndex];
      nodesIndex++;
      if(node.layer.visible === false) continue;
      if(node.type === "group"){
        queueNodes.push(node._children);
        queueNodesIndex[queueIndex] = nodesIndex;
        queueNodesIndex.push(0);
        queueNodesName.push(nodesName + node.name);
        let structure = {
          "name" : node.name,
          "children" : []
        };
        nodesStructure.children.push(structure);
        queueNodesStructure.push(structure);
        continue queueLoop;
      }else{
        let saveName = (nodesName + node.name).replace( "/" , "_" ).replace("." , "_") + ".png";
        sprites.push(outImgDirPath + "/" + saveName);
        pngOutputQueueCount++;
        node.layer.image.saveAsPng( outImgDirPath + "/" + saveName).then(() => {
          pngOutputQueueCount--;
          if(!isRunning && pngOutputQueueCount <= 0){
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

function makeSprite(sprites, dirPath, fileName){
  Spritesmith.run({
    src: sprites
  }, function handleResult (err, result) {
    // If there was an error, throw it 
    if (err) throw err;
   
    // Output the SpritePng
    fs.writeFileSync(dirPath + "/" + fileName + "_sprite.png", result.image);
    // Output the SpriteJson
    let fileNameCoordinates = {};
    Object.keys(result.coordinates).forEach(function (key) {
      fileNameCoordinates[path.basename(key)] = result.coordinates[key];
    });
    fs.writeFileSync(dirPath + "/" + fileName + "_sprite.json", JSON.stringify(fileNameCoordinates));
  });
}

psd2sprite(process.argv[2]);