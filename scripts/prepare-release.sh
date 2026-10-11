#!/usr/bin/env bash
set -euo pipefail
[[ ! ${MINISIGN_SECRET_KEY+x} ]] || { echo 'Do not supply a signing secret to build preparation.' >&2; exit 1; }
cd "$(dirname "$0")/.."
: "${TAG:?TAG required}" "${GITHUB_REPOSITORY:?Repository required}"
[[ "$TAG" =~ ^v[0-9]+\.[0-9]+\.[0-9]+$ ]] || { echo 'Invalid tag' >&2; exit 1; }
[[ "v$(node -p "require('./package.json').version")" == "$TAG" ]] || { echo 'Package/tag mismatch' >&2; exit 1; }
SHA="$(git rev-parse HEAD)"
[[ "$SHA" == "$(gh api "repos/$GITHUB_REPOSITORY/commits/$TAG" --jq .sha)" ]] || { echo 'Release tag moved or checkout mismatch' >&2; exit 1; }
if [[ "${1:-}" == template ]]; then
  npm ci
  npm run check:template
  npm test
  npm audit --audit-level=high
  rm -rf dist
  mkdir dist
  artifact="$(node -p "require('./package.json').name")-$TAG.tar.gz"
  git archive --format=tar.gz -o "dist/$artifact" "$SHA"
  node scripts/build-info.js dist
  (cd dist && sha256sum "$artifact" BUILDINFO.json > SHA256SUMS)
elif [[ "${1:-}" == app ]]; then
  bash build.sh
  npm audit --audit-level=high
else
  echo 'Usage: scripts/prepare-release.sh template|app' >&2; exit 2
fi
node -e 'const i=require("./dist/BUILDINFO.json"); if(i.sourceCommit!==process.argv[1] || i.tag!==process.env.TAG || i.workingTreeDirty) throw Error("Unclean or inconsistent provenance")' "$SHA"
