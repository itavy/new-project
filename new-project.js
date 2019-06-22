'use strict';

const fs = require('fs');
const origPackageJson = require('./package.json');
const jsdocTemplateContent = require('./jsdoc-template.json');


const packageJsonFileName = 'package.json'
const propertiesToAdd = {
  scripts: {
    test:               './node_modules/.bin/mocha',
    'test:check-style': './node_modules/.bin/eslint index.js "lib/**/*.js" "test/**/*.js"',
    'test:coverage':    './node_modules/.bin/nyc npm test',
    docs:               './node_modules/.bin/jsdoc -c jsdoc.json',
    pretest:            'npm run test:check-style',
  },
  'pre-commit': {
    run: [
      'test:check-style',
    ],
  },
  nyc: {
    all:              true,
    color:            true,
    'check-coverage': true,
    'per-file':       true,
    lines:            90,
    statements:       90,
    functions:        90,
    branches:         90,
    include:          [
      'lib/**/*.js',
      'index.js'
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
  }
};

const jsDocFileName = 'jsdoc.json';

const writeToStdout = strToWrite => process.stdout.write(strToWrite);

const writeJson = ({ fileName, fileContent }) => fs.writeFileSync(
  fileName,
  JSON.stringify(
    fileContent,
    null,
    '  '
  )
);

const checkIfFileExists = (fileName) => {
  let fd;
  let fExists = false;
  try {
    fd = fs.openSync(fileName,'r');
    fExists = true;
  } catch (_) {
    // do nothing
  }
  if (fd) {
    fs.closeSync(fd);
  }
  return fExists;
};

const addPackageOptions = (initialPackageJson, keyToAdd, valueToAdd) => Object.assign(
  Object.assign({}, initialPackageJson),
  {
    [keyToAdd]: valueToAdd,
  }
);

const getProjProperty = ({
  propName,
  pjContent = origPackageJson,
}) => {
  if (Object.hasOwnProperty.call(pjContent, propName)) {
    return origPackageJson[propName];
  }
  return '';
};

const getRepository = (initialPackageJson = origPackageJson) => {
  if (Object.hasOwnProperty.call(initialPackageJson, 'repository')) {
    return initialPackageJson.repository.url.split('//')[1].split('@')[1]
  }
  return '';
};

const getLicense = (initialPackageJson = origPackageJson) => {
  if (Object.hasOwnProperty.call(initialPackageJson, 'license')) {
    if (typeof initialPackageJson.license === 'string') {
      return initialPackageJson.license.toUpperCase();
    }
    return 'UNKNOWN';
  }
  return 'UNKNOWN';
};

const getAuthor = ({
  authorRegex = /^(.+)(?:\s+)?</,
  packageJsonContent = origPackageJson,
} = {}) => {
  if (Object.hasOwnProperty.call(packageJsonContent, 'author')) {
    const author = authorRegex.exec(packageJsonContent.author);
    if (author !== null) {
      return author[1];
    }
  }
  return ''
};

const getEmail = ({
  emailRegex = /<(.+)>/,
  packageJsonContent = origPackageJson,
} = {}) => {
  if (Object.hasOwnProperty.call(packageJsonContent, 'author')) {
    const email = emailRegex.exec(packageJsonContent.author);
    if (email !== null) {
      return email[1];
    }
  }
  return ''
};

const getNewPackageDescription = ({
  initialPackageJson = origPackageJson,
  propertiesDefinition = propertiesToAdd
}) => Object
  .entries(propertiesDefinition)
  .reduce((resultPackageJson, [key, value]) => addPackageOptions(resultPackageJson, key, value), initialPackageJson);

const writeNewPackageJson = ({
  packageJsonContent = origPackageJson,
  additionalProperties = propertiesToAdd,
  pjName = packageJsonFileName

} = {}) =>
  writeJson({
    fileName: pjName,
    fileContent: getNewPackageDescription({
      initialPackageJson: packageJsonContent,
      propertiesDefinition: additionalProperties,
    }),
  });

const addJsDoc = ({
  jsdocConf = jsdocTemplateContent,
  packageJsonContent = origPackageJson,
  jsdocFileName = jsDocFileName
} = {}) => {
  if (! checkIfFileExists(jsdocFileName)) {
    const gitRepo = getRepository(packageJsonContent);
    jsdocConf.templates.applicationName = packageJsonContent.name;
    jsdocConf.opts.repo = '';
    jsdocConf.opts.sourceRoot = '';

    if (gitRepo !== '') {
      jsdocConf.opts.repo = gitRepo;
      jsdocConf.opts.sourceRoot = `${gitRepo}/master/lib`;
    }

    writeJson({
      fileName: jsdocFileName,
      fileContent: jsdocConf,
    })
  }
};

const actions = {
  jsdoc: addJsDoc,
  pj: writeNewPackageJson,
  author: () => writeToStdout(getAuthor()),
  email: () => writeToStdout(getEmail()),
  gitRepo: () => writeToStdout(getRepository()),
  license: () => writeToStdout(getLicense()),
  name: () => writeToStdout(getProjProperty({ propName: 'name'}))
};

const commandArgs = process.argv.slice(2);

if (Object.hasOwnProperty.call(actions, commandArgs[0])) {
  actions[commandArgs[0]]()
} else {
  console.log(`Unknown function requested: ${commandArgs[0]}`)
}