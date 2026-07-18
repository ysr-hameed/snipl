#!/usr/bin/env bash
set -euo pipefail

CLI="node $(dirname "$0")/../apps/cli/dist/src/index.js"
PASS=0
FAIL=0

pass() { PASS=$((PASS + 1)); echo "  PASS | $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL | $1 | $2"; }

cleanup() { rm -rf /tmp/snipl-compat-*; }
trap cleanup EXIT

echo "=== Compatibility Fixture Tests ==="
echo ""

# 1. Plain Node TS project
echo "--- 1. Plain Node TS project ---"
PROJ1="/tmp/snipl-compat-1"
mkdir -p "$PROJ1/src"
echo '{"name":"plain-ts"}' > "$PROJ1/package.json"
$CLI init --cwd "$PROJ1" --yes > /dev/null 2>&1
$CLI add sleep --cwd "$PROJ1" --yes > /dev/null 2>&1
if [ -f "$PROJ1/src/snippets/sleep.ts" ]; then
  pass "Plain Node TS: sleep installed to src/snippets/"
else
  fail "Plain Node TS" "sleep.ts not found"
fi

# 2. Root-level source (no src/)
echo "--- 2. Root-level source ---"
PROJ2="/tmp/snipl-compat-2"
mkdir -p "$PROJ2"
echo '{"name":"root-source"}' > "$PROJ2/package.json"
$CLI init --cwd "$PROJ2" --yes > /dev/null 2>&1
$CLI add clamp --cwd "$PROJ2" --yes > /dev/null 2>&1
if [ -f "$PROJ2/snippets/clamp.ts" ]; then
  pass "Root-level source: clamp installed to snippets/"
else
  fail "Root-level source" "clamp.ts not found"
fi

# 3. Monorepo subpackage
echo "--- 3. Monorepo subpackage ---"
PROJ3="/tmp/snipl-compat-3"
mkdir -p "$PROJ3/packages/pkg-a/src"
echo '{"name":"monorepo","private":true,"workspaces":["packages/*"]}' > "$PROJ3/package.json"
echo '{"name":"pkg-a"}' > "$PROJ3/packages/pkg-a/package.json"
$CLI init --cwd "$PROJ3/packages/pkg-a" --yes > /dev/null 2>&1
$CLI add retry --cwd "$PROJ3/packages/pkg-a" --yes > /dev/null 2>&1
if [ -f "$PROJ3/packages/pkg-a/src/snippets/retry.ts" ]; then
  pass "Monorepo subpackage: retry installed"
else
  fail "Monorepo subpackage" "retry.ts not found"
fi

# 4. Spaces in path
echo "--- 4. Paths with spaces ---"
PROJ4="/tmp/snipl-compat-4"
mkdir -p "$PROJ4/my project/src"
echo '{"name":"spaces"}' > "$PROJ4/my project/package.json"
$CLI init --cwd "$PROJ4/my project" --yes > /dev/null 2>&1
$CLI add slugify --cwd "$PROJ4/my project" --yes > /dev/null 2>&1
if [ -f "$PROJ4/my project/src/snippets/slugify.ts" ]; then
  pass "Spaces in path: slugify installed"
else
  fail "Spaces in path" "slugify.ts not found"
fi

# 5. Multiple items + status
echo "--- 5. Multiple items with status check ---"
PROJ5="/tmp/snipl-compat-5"
mkdir -p "$PROJ5"
$CLI init --cwd "$PROJ5" --yes > /dev/null 2>&1
$CLI add sleep --cwd "$PROJ5" --yes > /dev/null 2>&1
$CLI add retry --cwd "$PROJ5" --yes > /dev/null 2>&1
$CLI status --cwd "$PROJ5" --json 2>&1 | grep -q '"status":"unchanged"'
if [ $? -eq 0 ]; then
  pass "Multiple items: status shows all unchanged"
else
  fail "Multiple items" "status --json did not report unchanged"
fi

# 6. Dry-run produces no files
echo "--- 6. Dry-run writes nothing ---"
PROJ6="/tmp/snipl-compat-6"
mkdir -p "$PROJ6/src"
echo '{"name":"dryrun"}' > "$PROJ6/package.json"
$CLI init --cwd "$PROJ6" --yes > /dev/null 2>&1
$CLI add throttle --cwd "$PROJ6" --dry-run --yes > /dev/null 2>&1
if [ ! -f "$PROJ6/src/snippets/throttle.ts" ]; then
  pass "Dry-run: no files written"
else
  fail "Dry-run" "throttle.ts was created despite --dry-run"
fi

echo ""
echo "=== Results: $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ] || exit 1
