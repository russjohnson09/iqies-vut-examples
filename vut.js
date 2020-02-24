#!/usr/bin/env node

const vut = require('./processor').listen;

const inputDir = process.argv[2];
const outputDir = process.argv[3];
const interval = parseInt(process.argv[4], 10);

vut(
  inputDir,
  outputDir,
  interval,
  'https://iqies.cms.gov/api/vut/v1/assessmentUpload',
);
