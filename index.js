'use strict';

const fs = require('fs');
const externalInfo = {
  authorName:  '',
  authorEmail: '',
  gitRepo:     null,
};
const scripts = {
  test:               './node_modules/.bin/mocha',
  coverage:           './node_modules/.bin/istanbul cover ./node_modules/.bin/_mocha',
  'coverage:check':   './node_modules/.bin/istanbul check-coverage',
  'test:check-style': './node_modules/.bin/eslint index.js "lib/**/*.js" "test/**/*.js"',
  docs:               './node_modules/.bin/jsdoc -c jsdoc.json',
  pretest:            'npm run test:check-style',
};
const origPackageJson = require('./package.json');
origPackageJson.scripts = Object.assign(origPackageJson.scripts, scripts);

fs.writeFileSync('./package.json', JSON.stringify(origPackageJson, null, ' '));

let haveToJsdoc = false;
try {
  const jsdocConf = require('./jsdoc-template.json');
  haveToJsdoc = true;
} catch (_) {
  haveToJsdoc = false;
}

if (haveToJsdoc) {
  jsdocConf.templates.applicationName = origPackageJson.name;
  jsdocConf.opts.repo = '';
  jsdocConf.opts.sourceRoot = '';

  if (Object.hasOwnProperty.call(origPackageJson, 'repository')) {
    jsdocConf.opts.repo = origPackageJson.repository.url;
    jsdocConf.opts.sourceRoot = `${origPackageJson.repository.url}/master/lib`;
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
fs.writeFileSync('.', externalInfo.gitRepo);
