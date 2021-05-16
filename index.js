const compareImages = require("resemblejs/compareImages")
const config = require("./config.json");
const fs = require('fs');

const {options, scensNumber, stepsNumber, frameworks} = config;

async function executeTest() {
  if (scensNumber === 0) {
    return;
  }

  let results = {};

  for (let f of frameworks) {

    if (!fs.existsSync(`./results/${f}`)){
      fs.mkdirSync(`./results/${f}`, { recursive: true });
    }

    let resultInfo = [];

    for (let i = 0; i < scensNumber; i++) {
      for (let j = 0; j < stepsNumber; j++) {

        let scenName = `esc_${i + 1}_step_${j + 1}`;
        let urlBeforeScreenshot = `./screenshots/${f}/v3.3.0/v3.3.0_${scenName}.png`;
        let urlAfterScreenshot = `./screenshots/${f}/v3.42.5/v3.42.5_${scenName}.png`;
        let urlCompareScreenshot = `./results/${f}/compare-${scenName}.png`;

        let urlBeforeScreenshotDiff = `../screenshots/${f}/v3.3.0/v3.3.0_${scenName}.png`;
        let urlAfterScreenshotDiff = `../screenshots/${f}/v3.42.5/v3.42.5_${scenName}.png`;
        let urlCompareScreenshotDiff = `./${f}/compare-${scenName}.png`;

        if (fs.existsSync(urlBeforeScreenshot) && fs.existsSync(urlAfterScreenshot)) {
          const data = await compareImages(
              fs.readFileSync(urlBeforeScreenshot),
              fs.readFileSync(urlAfterScreenshot),
              options
          );
          resultInfo.push({
            scen: i + 1,
            step: j + 1,
            urlBeforeScreenshotDiff,
            urlAfterScreenshotDiff,
            urlCompareScreenshotDiff,
            isSameDimensions: data.isSameDimensions,
            dimensionDifference: data.dimensionDifference,
            rawMisMatchPercentage: data.rawMisMatchPercentage,
            misMatchPercentage: data.misMatchPercentage,
            diffBounds: data.diffBounds,
            analysisTime: data.analysisTime
          });
          fs.writeFileSync(urlCompareScreenshot, data.getBuffer());
        }
      }
    }
    results[f] = resultInfo;
  }

  fs.writeFileSync(`./results/report.html`, createReport(results, frameworks));
  fs.copyFileSync('./index.css', `./results/index.css`);

  console.log('------------------------------------------------------------------------------------')
  console.log("Execution finished. Check the report under the results folder")
  return results;
}

(async () => console.log(await executeTest()))();

function scen(info) {
  return `<div class=" browser" id="test0">
    <div class=" btitle">
        <h2>Scen: ${info.scen} Step: ${info.step}</h2>
        <p>Data: ${JSON.stringify(info)}</p>
    </div>
    <div class="imgline">
      <div class="imgcontainer">
        <span class="imgname">v3.3.0</span>
        <img class="img2" src="${info.urlBeforeScreenshotDiff}" id="refImage" label="v3.3.0">
      </div>
      <div class="imgcontainer">
        <span class="imgname">v3.42.5</span>
        <img class="img2" src="${info.urlAfterScreenshotDiff}" id="testImage" label="v3.42.5">
      </div>
    </div>
    <div class="imgline">
      <div class="imgcontainer">
        <span class="imgname">Diff</span>
        <img class="imgfull" src="${info.urlCompareScreenshotDiff}" id="diffImage" label="Diff">
      </div>
    </div>
  </div>`
}

function creatFrameworkView(framework, resInfo) {
  return `<h2>Framework: ${framework}</h2>
  <div id="visualizer">
      ${resInfo.map(info => scen(info))}
  </div>`
}

function createReport(results, frameworks) {
  return `
    <html>
        <head>
            <title> VRT Report </title>
            <link href="index.css" type="text/css" rel="stylesheet">
        </head>
        <body>
            <h1>Report for v3.3.0 vs v.3.42.5</h1>
            ${frameworks.map(framework => creatFrameworkView(framework, results[framework]))}
        </body>
    </html>`
}
