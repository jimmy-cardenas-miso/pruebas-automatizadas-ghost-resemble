const compareImages = require("resemblejs/compareImages")
const config = require("./config.json");
const fs = require('fs');

const { options, scensNumber, stepsNumber, framework } = config;

async function executeTest() {
  if (scensNumber === 0) {
    return;
  }

  if (!fs.existsSync(`./results`)){
    fs.mkdirSync(`./results`, { recursive: true });
  }

  let resultInfo = [];

  for (let i = 0; i < scensNumber; i++) {
    for (let j = 0; j < stepsNumber; j++) {

      let scenName = `esc_${i + 1}_step_${j + 1}`;
      let urlBeforeScreenshot = `./screenshots/v3.3.0_${scenName}.png`;
      let urlAfterScreenshot = `./screenshots/v3.42.5_${scenName}.png`;
      let urlCompareScreenshot = `./results/compare-${scenName}.png`;

      let urlBeforeScreenshotDiff = `../screenshots/v3.3.0_${scenName}.png`;
      let urlAfterScreenshotDiff = `../screenshots/v3.42.5_${scenName}.png`;
      let urlCompareScreenshotDiff = `./compare-${scenName}.png`;

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

  fs.writeFileSync(`./results/report.html`, createReport(resultInfo, framework));
  fs.copyFileSync('./index.css', `./results/index.css`);

  console.log('------------------------------------------------------------------------------------')
  console.log("Execution finished. Check the report under the results folder")
  return resultInfo;
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

function createReport(resInfo, framework) {
  return `
    <html>
        <head>
            <title> VRT Report </title>
            <link href="index.css" type="text/css" rel="stylesheet">
        </head>
        <body>
            <h1>Report for v3.3.0 vs v.3.42.5</h1>
            <p>Executed for ${framework}</p>
            <div id="visualizer">
                ${Object.keys(resInfo).map(index => scen(resInfo[index]))}
            </div>
        </body>
    </html>`
}
