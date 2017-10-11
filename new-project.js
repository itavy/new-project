'use strict';

const fs = require('fs');
const externalInfo = {
  authorName:  '',
  authorEmail: '',
  gitRepo:     '',
  license:     'UNKNOWN',
};
const scripts = {
  test:               './node_modules/.bin/mocha',
  'test:check-style': './node_modules/.bin/eslint index.js "lib/**/*.js" "test/**/*.js"',
  'test:coverage':    './node_modules/.bin/nyc npm test',
  docs:               './node_modules/.bin/jsdoc -c jsdoc.json',
  pretest:            'npm run test:check-style',
};
const preCommitHook = {
  run: [
    'test:check-style',
  ],
};

const origPackageJson = require('./package.json');
origPackageJson.scripts = Object.assign(origPackageJson.scripts, scripts);
if (Object.hasOwnProperty.call(origPackageJson, 'repository')) {
  externalInfo.gitRepo = origPackageJson.repository.url.split('//')[1].split('@')[0];
}
if (Object.hasOwnProperty.call(origPackageJson, 'license')) {
  if (typeof origPackageJson.license === 'string') {
    externalInfo.license = origPackageJson.license.toUpperCase();
  } else {
    console.log('no string');
  }
} else {
  console.log('no license');
}

if (!Object.hasOwnProperty.call(origPackageJson, 'pre-commit')) {
  origPackageJson['pre-commit'] = preCommitHook;
}

if (!Object.hasOwnProperty.call(origPackageJson, 'nyc')) {
  origPackageJson.nyc = {
    all:              true,
    color:            true,
    'check-coverage': true,
    'per-file':       true,
    lines:            90,
    statements:       90,
    functions:        90,
    branches:         90,
    include:          [
      'lib/**/*.js'
    ],
    reporter: [
      'lcov',
      'text'
    ],
    watermarks: {
      'check-coverage': true,
      statements: [50, 90],
      lines: [50, 90],
      functions: [50, 90],
      branches: [50, 90]
    }
  };
}


fs.writeFileSync('./package.json', JSON.stringify(origPackageJson, null, ' '));

let haveToJsdoc = false;
let jsdocConf;
try {
  jsdocConf = require('./jsdoc-template.json');
  haveToJsdoc = true;
} catch (_) {
  haveToJsdoc = false;
}

if (haveToJsdoc) {
  jsdocConf.templates.applicationName = origPackageJson.name;
  jsdocConf.opts.repo = '';
  jsdocConf.opts.sourceRoot = '';

  if (externalInfo.gitRepo !== '') {
    jsdocConf.opts.repo = externalInfo.gitRepo;
    jsdocConf.opts.sourceRoot = `${externalInfo.gitRepo}/master/lib`;
  }

  fs.writeFileSync('./jsdoc.json', JSON.stringify(jsdocConf, null, ' '));
}


const authorRegex = /^(.+)(?:\s+)?</;
const emailRegex = /<(.+)>/;
let tempVar = authorRegex.exec(origPackageJson.author);
if (tempVar !== null) {
  externalInfo.authorName = tempVar[1];
}
tempVar = emailRegex.exec(origPackageJson.author);
if (tempVar !== null) {
  externalInfo.authorEmail = tempVar[1];
}

fs.writeFileSync('.gitname', externalInfo.authorName);
fs.writeFileSync('.gitemail', externalInfo.authorEmail);
fs.writeFileSync('.gitrepo', externalInfo.gitRepo);
fs.writeFileSync('.licensetype', externalInfo.license);
