#!/bin/bash
set -ex;
BASE_REPO="https://raw.githubusercontent.com/itavy/new-project/master/"

# istanbul
if [ ! -f ".istanbul.yml" ]; then
  curl -sq "$BASE_REPO/istambul-template.yml" -o istambul-template.yml;
fi

# mocha
if [ ! -d "test" ]; then
  mkdir test;
  touch test/index.js;
fi
if [ ! -f "test/mocha.opts" ]; then
  curl -sq "$BASE_REPO/mocha-template.opts" -o test/mocha.opts;
fi

# gitignore
curl -sq "$BASE_REPO/gitignore" -o .gitignore-template;
if [ -f ".gitignore" ]; then
  echo "" >> ./.gitignore;
else
  touch ./.gitignore;
fi
cat .gitignore-template >> ./.gitignore
rm -rf gitignore-template;
sed -i '/^\s*$/d' ./gitignore
TEMP_FILE=$(mktemp);
cat ./.gitignore | sort -u > "${TEMP_FILE}"
mv "${TEMP_FILE}" ./.gitignore;

# npmignore
curl -sq "$BASE_REPO/npmignore-template" -o npmignore-template;
if [ -f ".npmignore" ]; then
  echo "" >> .npmignore;
else
  echo "" > .npmignore;
fi
cat npmignore-template >> .npmignore;
sed -i '/^\s*$/d' ./npmignore
rm -rf npmignore-template;
TEMP_FILE=$(mktemp);
cat ./.npmignore | sort -u > "${TEMP_FILE}"
mv "${TEMP_FILE}" ./.npmignore;

# jsdoc
if [ ! -f "jsdoc.json" ]; then
  curl -sq "$BASE_REPO/jsdoc-template.json" -o jsdoc-template.json
fi

# init project if empty
if [ ! -f "package.json" ]; then
  npm init;
fi
curl -sq "$BASE_REPO/index.js" -o new-project.js
node ./new-project.js

npm install @itavy/test-utilities pre-commit eyes jsdoc jaguarjs-jsdoc jsdoc-to-markdown --save-dev;

./node_modules/.bin/installCodingStandards;

rm -rf new-project.js jsdoc-template.json

if [ ! -f "README.md" ]; then
  touch README.md;
fi
SETUP_GIT=$(cat .gitrepo);
if [ ! -d ".git" ]; then
  if [ "" !== "${SETUP_GIT}" ]; then
    git init;
    git config user.name "$(cat .gitname)";
    git config user.email "$(cat .gitemail)"
    git config push.followTags true
  fi
  git add .;
  git commit -s -m "project skeleton setup";
fi

rm -rf .gitname .gitemail .gitrepo
