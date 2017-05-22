#!/bin/bash
set -e;
BASE_REPO="https://raw.githubusercontent.com/itavy/new-project/master/"

# istanbul
if [ ! -f ".istanbul.yml" ]; then
  curl -sq "$BASE_REPO/istanbul-template.yml" -o .istanbul.yml;
fi

# gitignore
curl -sq "$BASE_REPO/gitignore-template" -o gitignore-template;
if [ -f ".gitignore" ]; then
  echo "" >> ./.gitignore;
else
  touch ./.gitignore;
fi
cat gitignore-template >> ./.gitignore
rm -rf gitignore-template;
sed -i '/^\s*$/d' ./.gitignore
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
sed -i '/^\s*$/d' ./.npmignore
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
curl -sq "$BASE_REPO/new-project.js" -o new-project.js
node ./new-project.js
PROJ_AUTHOR_NAME=$(cat .gitname);
PROJ_AUTHOR_EMAIL=$(cat .gitemail);
PROJ_YEAR=$(date +'%Y');


npm install @itavy/test-utilities pre-commit eyes jsdoc jaguarjs-jsdoc jsdoc-to-markdown --save-dev;

./node_modules/.bin/installCodingStandards;

rm -rf new-project.js jsdoc-template.json


# mocha
if [ ! -d "test" ]; then
  mkdir test;
  touch test/index.js;
fi
if [ ! -f "test/mocha.opts" ]; then
  curl -sq "$BASE_REPO/mocha-template.opts" -o test/mocha.opts;
fi

# README
if [ ! -f "README.md" ]; then
  touch README.md;
fi

if [ ! -f "LICENSE.md" ]; then
  LICENSE_TYPE=$(cat .licensetype);
  if [ "$LICENSE_TYPE" == "ISC" ]; then
    curl -sq "$BASE_REPO/license-template-isc" -o LICENSE.md;
    sed -i "s/YEAR NAME <email>/${PROJ_YEAR} ${PROJ_AUTHOR_NAME} <${PROJ_AUTHOR_EMAIL}>/" LICENSE.md;
    sed -i "s/@/.at./" LICENSE.md;
  else
    if [ "$LICENSE_TYPE" == "MIT" ]; then
      curl -sq "$BASE_REPO/license-template-mit" -o LICENSE.md;
      sed -i "s/YEAR NAME <email>/${PROJ_YEAR} ${PROJ_AUTHOR_NAME} <${PROJ_AUTHOR_EMAIL}>/" LICENSE.md;
      sed -i "s/@/.at./" LICENSE.md;
    fi
  fi
fi

SETUP_GIT=$(cat .gitrepo);
if [ ! -d ".git" ]; then
  git init;
  git config user.name "$PROJ_AUTHOR_NAME";
  git config user.email "$PROJ_AUTHOR_EMAIL"
  git config push.followTags true
fi
rm -rf .gitname .gitemail .gitrepo .licensetype;

git add .;
git commit -s -m "project skeleton setup";


