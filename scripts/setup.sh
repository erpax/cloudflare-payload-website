#!/usr/bin/env bash
# scripts/setup.sh
#
# Regenerate all derived files this project depends on. Designed to be safe
# to run from any state — `pnpm install` (postinstall hook), a fresh clone,
# or after pulling changes that touch wrangler bindings, Payload
# collections, or admin components.
#
# Steps:
#   1. Cloudflare env types (`pnpm cf-typegen`)
#   2. Payload admin importMap (`pnpm generate:importmap`)
#   3. Payload generated types (`pnpm generate:types`)
#   4. Pending Payload migrations (`pnpm exec payload migrate:create`)
#
# Idempotent. Bails on the first failure. Quiet by default — pass `-v` for
# verbose tool output.

set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

VERBOSE=0
for arg in "$@"; do
  case "$arg" in
    -v|--verbose) VERBOSE=1 ;;
    -h|--help)
      sed -n '2,18p' "${BASH_SOURCE[0]}" | sed 's/^# \{0,1\}//'
      exit 0
      ;;
  esac
done

if [ -t 1 ]; then
  BOLD="\033[1m"; DIM="\033[2m"; GREEN="\033[32m"; YELLOW="\033[33m"; RED="\033[31m"; RESET="\033[0m"
else
  BOLD=""; DIM=""; GREEN=""; YELLOW=""; RED=""; RESET=""
fi

step()  { printf "\n${BOLD}▸ %s${RESET}\n" "$*"; }
note()  { printf "  ${DIM}%s${RESET}\n" "$*"; }
done_() { printf "  ${GREEN}✓${RESET} %s\n" "$*"; }
warn()  { printf "${YELLOW}⚠ %s${RESET}\n" "$*"; }
fail()  { printf "${RED}✗ %s${RESET}\n" "$*" >&2; exit 1; }

run() {
  local label=$1; shift
  if [ "$VERBOSE" -eq 1 ]; then
    "$@" || fail "$label failed"
  else
    if ! out=$("$@" 2>&1); then
      printf "%s\n" "$out" >&2
      fail "$label failed"
    fi
  fi
  done_ "$label"
}

require() { command -v "$1" >/dev/null 2>&1 || fail "$1 is not on PATH"; }

require node
require pnpm

step "Cloudflare env types"
note "writes cloudflare-env.d.ts from wrangler.jsonc bindings"
run "cf-typegen" pnpm cf-typegen

step "Payload admin importMap"
note "regenerates src/app/(payload)/admin/importMap.js"
run "generate:importmap" pnpm generate:importmap

step "Payload generated types"
note "regenerates src/payload-types.ts"
run "generate:types" pnpm generate:types

step "Pending Payload migrations"
note "creates src/migrations/<ts>_<name>.ts if the schema has drifted"
# --skip-empty   → no-op when the schema is in sync (don't create blank migration files)
# --force-accept-warning → don't pause on the destructive-change confirmation prompt
# --name auto    → use the default timestamp+slug name instead of asking
if pnpm exec payload migrate:create \
  --skip-empty \
  --force-accept-warning \
  --name auto \
  >/dev/null 2>&1
then
  done_ "migrate:create"
else
  warn "migrate:create exited non-zero — re-run interactively if needed"
fi

step "Done"
done_ "all generated files are up to date"
