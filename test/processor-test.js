/* eslint-env mocha */
const fs = require('fs');
const path = require('path');
const processor = require('../processor');
const result = require('./result.json');
const sinon = require('sinon');
const unirest = require('unirest');
require('should');

describe('vut examples', () => {
  const srcDir = path.join('test', 'files');
  const inputDirSrc = path.join(srcDir, 'input');
  const outputDirSrc = path.join(srcDir, 'output');
  const tmpDir = path.join('.', 'tmp');
  const testInputDir = path.join(tmpDir, 'input');
  const testOutputDir = path.join(tmpDir, 'output');
  const testDirs = [tmpDir, testInputDir, testOutputDir];
  let inputFiles = [];
  let outputFiles = [];

  before(() => {
    testDirs.forEach(_path => fs.mkdirSync(_path));
    inputFiles = fs.readdirSync(inputDirSrc);
    // console.log('inputFiles:', inputFiles);
    inputFiles.forEach(file => {
      const srcFilePath = path.join(inputDirSrc, file);
      const destFilePath = path.join(testInputDir, file);
      fs.copyFileSync(srcFilePath, destFilePath);
    });
    outputFiles = fs.readdirSync(outputDirSrc);
    // console.log('outputFiles:', outputFiles);
    outputFiles.forEach(file => {
      const srcFilePath = path.join(outputDirSrc, file);
      const destFilePath = path.join(testOutputDir, file);
      fs.copyFileSync(srcFilePath, destFilePath);
    });
  });

  after(() => {
    inputFiles.forEach(file => {
      const destFilePath = path.join(testInputDir, file);
      fs.unlinkSync(destFilePath);
    });
    fs.readdirSync(testOutputDir).forEach(file => {
      const destFilePath = path.join(testOutputDir, file);
      fs.unlinkSync(destFilePath);
    });
    testDirs.reverse().forEach(dir => fs.rmdirSync(dir));
  });

  describe('getFiles', () => {
    it('should return the files that need to be processed', () => {
      const files = processor.getFiles(testInputDir, testOutputDir);
      files.should.have.length(2);
      files[0].should.equal(inputFiles[0]);
      files[1].should.equal(inputFiles[1]);
    });
  });

  describe('saveResult', () => {
    it('should convert JSON result to XML and save it as a file', () => {
      processor.saveResult(testOutputDir, inputFiles[0], result);
      const file = inputFiles[0].replace(/(.*?)(\.\w+)$/, '$1_results$2');
      const xml = fs.readFileSync(path.join(testOutputDir, file));
      xml.indexOf('<results>').should.be.above(-1);
    });
  });

  describe('processFiles', () => {
    it('Handles an error from VUT', done => {
      const mockUnirest = {
        headers() {
          return {
            attach() {
              return {
                end(cb) {
                  cb({ error: new Error('Boom!') });
                },
              };
            },
          };
        },
      };

      const stub = sinon.stub(unirest, 'post').returns(mockUnirest);
      processor.processFiles(
        testInputDir,
        testOutputDir,
        'http://fake.url',
        err => {
          err.should.be.Error();
          stub.restore();
          done();
        },
      );
    });

    it('should process all files not processed', done => {
      const mockUnirest = {
        headers() {
          return {
            attach() {
              return {
                end(cb) {
                  cb({ body: result });
                },
              };
            },
          };
        },
      };

      const stub = sinon.stub(unirest, 'post').returns(mockUnirest);
      processor.processFiles(
        testInputDir,
        testOutputDir,
        'http://fake.url',
        err => {
          const files = processor.getFiles(testInputDir, testOutputDir);
          files.should.have.length(0);
          stub.restore();
          done(err);
        },
      );
    });

    it('Will not call runVUT if no files are found', done => {
      const spy = sinon.spy(processor, 'runVUT');
      processor.processFiles(
        testInputDir,
        testOutputDir,
        'http://fake.url',
        err => {
          const files = processor.getFiles(testInputDir, testOutputDir);
          files.should.have.length(0);
          sinon.assert.notCalled(spy);
          spy.restore();
          done();
        },
      );
    });
  });
});
