const unirest = require('unirest');
const fs = require('fs');
const { toXML } = require('jstoxml');
const _ = require('lodash');
const async = require('async');
const path = require('path');

function runVUT(inputDir, file, url, callback) {
  unirest
    .post(url)
    .headers({ 'Content-Type': 'multipart/form-data' })
    .attach('assessmentFile', path.join(inputDir, file))
    .end(res => {
      if (res.error) return callback(new Error(res.error));
      return callback(null, res.body);
    });
}

function getFiles(inputDir, outputDir) {
  const inFiles = fs.readdirSync(inputDir);
  const outFiles = fs
    .readdirSync(outputDir)
    .map(file => file.replace('_results', ''));
  return _.difference(inFiles, outFiles);
}

function saveResult(outputDir, file, result) {
  const resultFile = file.replace(/(.*?)(\.\w+)$/, '$1_results$2');
  const outFile = path.join(outputDir, resultFile);
  console.log('saving result:', resultFile);
  const validationErrors = _.get(
    result,
    'validationResults[0].validationErrors',
  );
  const validationResults =
    validationErrors && validationErrors.length ? validationErrors : 'Accepted';
  fs.writeFileSync(
    outFile,
    toXML(
      { validation_results: validationResults },
      { header: true, indent: '  ' },
    ),
  );
}

function processFiles(inputDir, outputDir, url, callback) {
  console.log('Checking for files...');
  const files = getFiles(inputDir, outputDir);
  if (files.length) console.log('Found files:', files);
  else console.log('No new files found.');
  async.eachSeries(
    files,
    (file, _callback) => {
      console.log('processing file:', file);
      runVUT(inputDir, file, url, (err, result) => {
        if (err) return _callback(err);
        saveResult(outputDir, file, result);
        return _callback();
      });
    },
    callback,
  );
}

function process(inputDir, outputDir, url, callback) {
  if (this.processing) return;
  this.processing = true;
  processFiles(inputDir, outputDir, url, callback);
}

function processFilesCallback(err) {
  if (err) throw err;
  this.processing = false;
  console.log('Waiting for files to process...');
}

function listen(inputDir, outputDir, interval, url) {
  this.processing = false;
  clearInterval(this.interval);
  process(inputDir, outputDir, url, processFilesCallback);
  this.interval = setInterval(
    () => process(inputDir, outputDir, url, processFilesCallback),
    interval * 1000,
  );
}

module.exports = {
  listen,
  getFiles,
  saveResult,
  processFiles,
  runVUT,
};
