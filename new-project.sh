#!/usr/bin/env bash
set -ex;
case "$(uname -s)" in
  Darwin*)
    SED_INPLACE_CMD="sed -i ''"
    ;;
  *)
    SED_INPLACE_CMD="sed -i"
    ;;
esac

BASE_REPO="https://raw.githubusercontent.com/itavy/new-project/feature/update-for-osx/"

# gitignore
curl -sq "$BASE_REPO/gitignore-template" -o gitignore-template;
if [[ -f ".gitignore" ]]; then
  echo "" >> ./.gitignore;
else
  touch ./.gitignore;
fi
cat gitignore-template >> ./.gitignore
rm -rf gitignore-template;
$SED_INPLACE_CMD '/^\s*$/d' ./.gitignore
TEMP_FILE=$(mktemp);
cat ./.gitignore | sort -u > "${TEMP_FILE}"
mv "${TEMP_FILE}" ./.gitignore;

# npmignore
curl -sq "$BASE_REPO/npmignore-template" -o npmignore-template;
if [[ -f ".npmignore" ]]; then
  echo "" >> .npmignore;
else
  echo "" > .npmignore;
fi
cat npmignore-template >> .npmignore;
$SED_INPLACE_CMD '/^\s*$/d' ./.npmignore
rm -rf npmignore-template;
TEMP_FILE=$(mktemp);
cat ./.npmignore | sort -u > "${TEMP_FILE}"
mv "${TEMP_FILE}" ./.npmignore;

# jsdoc
if [[ ! -f "jsdoc.json" ]]; then
  curl -sq "$BASE_REPO/jsdoc-template.json" -o jsdoc-template.json
fi

# init project if empty
if [[ ! -f "package.json" ]]; then
  npm init;
fi

curl -sq "$BASE_REPO/new-project.js" -o new-project.js
node ./new-project.js pj
node ./new-project.js jsdoc
PROJ_NAME=$(node ./new-project.js name)
PROJ_AUTHOR_NAME=$(node ./new-project.js author)
PROJ_AUTHOR_EMAIL=$(node ./new-project.js email)
PROJ_NAME=$(node ./new-project.js name)
LICENSE_TYPE=$(node ./new-project.js license)
SETUP_GIT=$(node ./new-project.js gitRepo)

if [[ ! -f "index.js" ]]; then
  curl -sq "$BASE_REPO/index-template.js" -o index.js
  $SED_INPLACE_CMD "s|<modulename>|$PROJ_NAME|g" index.js
fi

PROJ_YEAR=$(date +'%Y');


npm install \
  semver \
  @itavy/test-utilities \
  mocha \
  tap \
  nyc \
  pre-commit \
  eyes \
  jsdoc \
  jaguarjs-jsdoc \
  jsdoc-to-markdown \
  --save-dev;

./node_modules/.bin/installCodingStandards.sh;

rm -rf new-project.js jsdoc-template.json


# mocha
if [[ ! -d "test" ]]; then
  mkdir test;
  touch test/index.js;
fi
if [[ ! -f "test/mocha.opts" ]]; then
  curl -sq "$BASE_REPO/mocha-template.opts" -o test/mocha.opts;
fi

# README
if [[ ! -f "README.md" ]]; then
  touch README.md;
fi

if [[ ! -f "LICENSE.md" ]]; then
  if [[ "$LICENSE_TYPE" == "ISC" ]]; then
    curl -sq "$BASE_REPO/license-template-isc" -o LICENSE.md;
    $SED_INPLACE_CMD "s/YEAR NAME <email>/${PROJ_YEAR} ${PROJ_AUTHOR_NAME} <${PROJ_AUTHOR_EMAIL}>/" LICENSE.md;
    $SED_INPLACE_CMD "s/@/.at./" LICENSE.md;
  else
    if [[ "$LICENSE_TYPE" == "MIT" ]]; then
      curl -sq "$BASE_REPO/license-template-mit" -o LICENSE.md;
      $SED_INPLACE_CMD "s/YEAR NAME <email>/${PROJ_YEAR} ${PROJ_AUTHOR_NAME} <${PROJ_AUTHOR_EMAIL}>/" LICENSE.md;
      $SED_INPLACE_CMD "s/@/.at./" LICENSE.md;
    fi
  fi
fi

if [[ ! -d ".git" ]]; then
  git init;
  git config user.name "$PROJ_AUTHOR_NAME";
  git config user.email "$PROJ_AUTHOR_EMAIL"
  git config push.followTags true
fi
rm -rf .gitname .gitemail .gitrepo .licensetype;

git add .;
git commit -s -m "project skeleton setup";


