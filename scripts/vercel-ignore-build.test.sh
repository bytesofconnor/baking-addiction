#!/usr/bin/env bash
set -euo pipefail

script=$(cd "$(dirname "$0")" && pwd)/vercel-ignore-build.sh
fail=0
root=$(mktemp -d)
trap 'rm -rf "$root"' EXIT

init_repo() {
  local repo=$1
  mkdir -p "$repo"
  git -C "$repo" init -q -b main
  git -C "$repo" config user.email test@example.com
  git -C "$repo" config user.name test
}

commit_all() {
  local repo=$1
  local msg=$2
  git -C "$repo" add -A
  git -C "$repo" commit -q -m "$msg"
}

check() {
  local name=$1
  local dir=$2
  local want=$3
  shift 3
  local code=0
  local out
  out=$(
    cd "$dir" && env -i PATH="$PATH" HOME="$HOME" "$@" "$script" 2>&1
  ) || code=$?
  if [[ "$code" -ne "$want" ]]; then
    echo "FAIL ${name}: exit ${code}, expected ${want}" >&2
    printf '%s\n' "$out" >&2
    fail=1
    return
  fi
  echo "PASS ${name}"
}

app_change="$root/app-change"
init_repo "$app_change"
mkdir -p "$app_change/app"
echo base > "$app_change/app/app.txt"
commit_all "$app_change" base
echo next > "$app_change/app/app.txt"
commit_all "$app_change" "change app"

check prod-main-change-builds "$app_change/app" 1 \
  VERCEL_ENV=production \
  VERCEL_GIT_COMMIT_REF=main

check preview-dependabot-skips "$app_change/app" 0 \
  VERCEL_ENV=preview \
  VERCEL_GIT_COMMIT_REF=dependabot/npm_and_yarn/example

check preview-cursor-skips "$app_change/app" 0 \
  VERCEL_ENV=preview \
  VERCEL_GIT_COMMIT_REF=cursor/example-5ba4

check preview-other-branch-builds "$app_change/app" 1 \
  VERCEL_ENV=preview \
  VERCEL_GIT_COMMIT_REF=feature/recipe-notes

check prod-dependabot-change-builds "$app_change/app" 1 \
  VERCEL_ENV=production \
  VERCEL_GIT_COMMIT_REF=dependabot/npm_and_yarn/example

docs_only="$root/docs-only"
init_repo "$docs_only"
mkdir -p "$docs_only/app" "$docs_only/docs"
echo app > "$docs_only/app/app.txt"
echo note > "$docs_only/docs/guide.txt"
commit_all "$docs_only" base
echo note2 > "$docs_only/docs/guide.txt"
commit_all "$docs_only" "change docs"

check prod-docs-only-skips "$docs_only/app" 0 \
  VERCEL_ENV=production \
  VERCEL_GIT_COMMIT_REF=main

missing_parent="$root/missing-parent"
init_repo "$missing_parent"
mkdir -p "$missing_parent/app"
echo only > "$missing_parent/app/app.txt"
commit_all "$missing_parent" only

check missing-parent-builds "$missing_parent/app" 1 \
  VERCEL_ENV=production \
  VERCEL_GIT_COMMIT_REF=main

if [[ "$fail" -ne 0 ]]; then
  exit 1
fi
