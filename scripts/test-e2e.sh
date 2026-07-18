#!/usr/bin/env bash
set -euo pipefail

CLI="node $(dirname "$0")/../apps/cli/dist/src/index.js"
PASS=0
FAIL=0
RESULTS=()

cleanup() {
  rm -rf /tmp/snipl-test-*
}

trap cleanup EXIT

fail() {
  local desc="$1"
  local details="$2"
  FAIL=$((FAIL + 1))
  RESULTS+=("FAIL | $desc | $details")
}

pass() {
  local desc="$1"
  PASS=$((PASS + 1))
  RESULTS+=("PASS | $desc")
}

assert_contains() {
  local output="$1"
  local needle="$2"
  if echo "$output" | grep -q "$needle"; then
    return 0
  fi
  return 1
}

assert_not_contains() {
  local output="$1"
  local needle="$2"
  if echo "$output" | grep -q "$needle"; then
    return 1
  fi
  return 0
}

# ============================================
# TEST 1: init — default project (no src/)
# ============================================
echo "=== TEST 1: init in empty project ==="
PROJ1="/tmp/snipl-test-1"
cleanup
mkdir -p "$PROJ1"
OUTPUT=$($CLI init --cwd "$PROJ1" --yes 2>&1)
if assert_contains "$OUTPUT" "Created"; then
  if [ -f "$PROJ1/snippets.json" ]; then
    pass "init creates snippets.json in empty project"
  else
    fail "init creates snippets.json in empty project" "File not created"
  fi
else
  fail "init creates snippets.json in empty project" "$OUTPUT"
fi

# Verify config content
CONFIG=$(cat "$PROJ1/snippets.json")
if echo "$CONFIG" | grep -q '"snippets"'; then
  pass "init uses 'snippets' output dir when no src/ exists"
else
  fail "init uses 'snippets' output dir when no src/ exists" "$CONFIG"
fi

# ============================================
# TEST 2: init — project with src/
# ============================================
echo "=== TEST 2: init in project with src/ ==="
PROJ2="/tmp/snipl-test-2"
cleanup
mkdir -p "$PROJ2/src"
OUTPUT=$($CLI init --cwd "$PROJ2" --yes 2>&1)
CONFIG=$(cat "$PROJ2/snippets.json")
if echo "$CONFIG" | grep -q '"src/snippets"'; then
  pass "init detects src/ and uses 'src/snippets' output dir"
else
  fail "init detects src/ and uses 'src/snippets' output dir" "$CONFIG"
fi

# ============================================
# TEST 3: init — refuses to overwrite without --overwrite
# ============================================
echo "=== TEST 3: init refuses overwrite ==="
OUTPUT=$($CLI init --cwd "$PROJ2" --yes 2>&1 || true)
if echo "$OUTPUT" | grep -q "already exists"; then
  pass "init refuses to overwrite existing config without --overwrite"
else
  fail "init refuses to overwrite existing config without --overwrite" "$OUTPUT"
fi

# ============================================
# TEST 4: init — with explicit output and language
# ============================================
echo "=== TEST 4: init with explicit output and language ==="
PROJ4="/tmp/snipl-test-4"
cleanup
mkdir -p "$PROJ4"
$CLI init --cwd "$PROJ4" --output "lib/utils" --language js --yes 2>&1
CONFIG=$(cat "$PROJ4/snippets.json")
if echo "$CONFIG" | grep -q '"lib/utils"' && echo "$CONFIG" | grep -q '"js"'; then
  pass "init accepts explicit --output and --language"
else
  fail "init accepts explicit --output and --language" "$CONFIG"
fi

# ============================================
# TEST 5: init — dry-run writes nothing
# ============================================
echo "=== TEST 5: init dry-run ==="
PROJ5="/tmp/snipl-test-5"
cleanup
mkdir -p "$PROJ5"
OUTPUT=$($CLI init --cwd "$PROJ5" --dry-run 2>&1)
if [ ! -f "$PROJ5/snippets.json" ]; then
  pass "init --dry-run does not write any files"
else
  fail "init --dry-run does not write any files" "Config was created"
fi

# ============================================
# TEST 6: list — shows all 8 modules
# ============================================
echo "=== TEST 6: list command ==="
OUTPUT=$($CLI list 2>&1)
ITEMS=$(echo "$OUTPUT" | wc -l)
if echo "$OUTPUT" | grep -q "sleep" && echo "$OUTPUT" | grep -q "retry" && echo "$OUTPUT" | grep -q "debounce"; then
  pass "list shows all modules with name and summary"
else
  fail "list shows all modules with name and summary" "$OUTPUT"
fi

# ============================================
# TEST 7: list --json — valid JSON envelope
# ============================================
echo "=== TEST 7: list --json ==="
OUTPUT=$($CLI list --json 2>&1)
if echo "$OUTPUT" | grep -q '"ok":true' && echo "$OUTPUT" | grep -q '"name":"sleep"'; then
  pass "list --json returns valid JSON with ok:true and data array"
else
  fail "list --json returns valid JSON with ok:true and data array" "$OUTPUT"
fi

# Validate JSON is parseable
echo "$OUTPUT" | node -e "const d=JSON.parse(require('fs').readFileSync('/dev/stdin','utf8')); if(!d.ok || !Array.isArray(d.data)) process.exit(1)" 2>&1
if [ $? -eq 0 ]; then
  pass "list --json output is valid parseable JSON"
else
  fail "list --json output is valid parseable JSON" "JSON parse failed"
fi

# ============================================
# TEST 8: search — returns relevant results
# ============================================
echo "=== TEST 8: search command ==="
OUTPUT=$($CLI search retry 2>&1)
if echo "$OUTPUT" | grep -q "retry"; then
  pass "search finds relevant items by name"
else
  fail "search finds relevant items by name" "$OUTPUT"
fi

OUTPUT=$($CLI search TIMER 2>&1)
if echo "$OUTPUT" | grep -q "debounce" || echo "$OUTPUT" | grep -q "throttle" || echo "$OUTPUT" | grep -q "sleep"; then
  pass "search is case-insensitive and matches tags/summary"
else
  fail "search is case-insensitive and matches tags/summary" "$OUTPUT"
fi

# ============================================
# TEST 9: search — empty query fails
# ============================================
echo "=== TEST 9: search empty query ==="
set +e
OUTPUT=$($CLI search "" 2>&1)
EXITCODE=$?
set -e
if [ $EXITCODE -eq 2 ]; then
  pass "search with empty query returns exit code 2"
else
  fail "search with empty query returns exit code 2" "exit=$EXITCODE output=$OUTPUT"
fi

# ============================================
# TEST 10: search — no results
# ============================================
echo "=== TEST 10: search no matches ==="
OUTPUT=$($CLI search xyzzy-not-found 2>&1)
if echo "$OUTPUT" | grep -q "No items found"; then
  pass "search with no matches shows friendly message"
else
  fail "search with no matches shows friendly message" "$OUTPUT"
fi

# ============================================
# TEST 11: view — shows module details
# ============================================
echo "=== TEST 11: view command ==="
OUTPUT=$($CLI view sleep 2>&1)
if echo "$OUTPUT" | grep -q "sleep@0.1.0" && echo "$OUTPUT" | grep -q "MIT" && echo "$OUTPUT" | grep -q "function sleep"; then
  pass "view shows module name, version, license, exports"
else
  fail "view shows module name, version, license, exports" "$OUTPUT"
fi

# ============================================
# TEST 12: view — not found shows error
# ============================================
echo "=== TEST 12: view not found ==="
set +e
OUTPUT=$($CLI view nonexistent 2>&1)
EXITCODE=$?
set -e
if [ $EXITCODE -eq 2 ]; then
  pass "view with non-existent item returns exit code 2"
else
  fail "view with non-existent item returns exit code 2" "exit=$EXITCODE"
fi

# ============================================
# TEST 13: view --json
# ============================================
echo "=== TEST 13: view --json ==="
OUTPUT=$($CLI view sleep --json 2>&1)
if echo "$OUTPUT" | grep -q '"ok":true' && echo "$OUTPUT" | grep -q '"name":"sleep"'; then
  pass "view --json returns valid JSON with item data"
else
  fail "view --json returns valid JSON with item data" "$OUTPUT"
fi

# ============================================
# TEST 14: --cwd with non-existent path
# ============================================
echo "=== TEST 14: --cwd invalid path ==="
set +e
OUTPUT=$($CLI list --cwd /tmp/nonexistent-path-12345 2>&1)
EXITCODE=$?
set -e
if [ $EXITCODE -eq 2 ]; then
  pass "--cwd with non-existent path returns exit code 2"
else
  fail "--cwd with non-existent path returns exit code 2" "exit=$EXITCODE"
fi

# ============================================
# TEST 15: --help
# ============================================
echo "=== TEST 15: --help ==="
OUTPUT=$($CLI --help 2>&1)
if echo "$OUTPUT" | grep -q "init" && echo "$OUTPUT" | grep -q "list" && echo "$OUTPUT" | grep -q "search" && echo "$OUTPUT" | grep -q "view"; then
  pass "--help shows all commands and flags"
else
  fail "--help shows all commands and flags" "$OUTPUT"
fi

# ============================================
# TEST 16: --version
# ============================================
echo "=== TEST 16: --version ==="
OUTPUT=$($CLI --version 2>&1)
if echo "$OUTPUT" | grep -q "0.0.0"; then
  pass "--version shows version number"
else
  fail "--version shows version number" "$OUTPUT"
fi

# ============================================
# TEST 17: init --overwrite replaces existing config
# ============================================
echo "=== TEST 17: init --overwrite ==="
PROJ17="/tmp/snipl-test-17"
cleanup
mkdir -p "$PROJ17"
$CLI init --cwd "$PROJ17" --yes 2>&1
# Write different content first
echo '{"output":"old","language":"js","registries":[{"name":"official","source":"builtin"}]}' > "$PROJ17/snippets.json"
$CLI init --cwd "$PROJ17" --overwrite --yes 2>&1
CONFIG=$(cat "$PROJ17/snippets.json")
if echo "$CONFIG" | grep -q '"snippets"'; then
  pass "init --overwrite replaces existing config with fresh defaults"
else
  fail "init --overwrite replaces existing config with fresh defaults" "$CONFIG"
fi

# ============================================
# TEST 18: search --json valid format
# ============================================
echo "=== TEST 18: search --json ==="
OUTPUT=$($CLI search debounce --json 2>&1)
if echo "$OUTPUT" | grep -q '"ok":true' && echo "$OUTPUT" | grep -q '"name":"debounce"'; then
  pass "search --json returns valid JSON envelope"
else
  fail "search --json returns valid JSON envelope" "$OUTPUT"
fi

# ============================================
# TEST 19: list in project without init still works
# ============================================
echo "=== TEST 19: list works without config ==="
OUTPUT=$($CLI list 2>&1)
if echo "$OUTPUT" | grep -q "sleep"; then
  pass "list works without snippets.json in project"
else
  fail "list works without snippets.json in project" "$OUTPUT"
fi

# ============================================
# TEST 20: add — installs an item successfully
# ============================================
echo "=== TEST 20: add installs item ==="
PROJ20="/tmp/snipl-test-20"
cleanup
mkdir -p "$PROJ20"
$CLI init --cwd "$PROJ20" --yes 2>&1 > /dev/null
OUTPUT=$($CLI add sleep --cwd "$PROJ20" --yes 2>&1)
if echo "$OUTPUT" | grep -q "Installed"; then
  pass "add installs an item and shows success message"
else
  fail "add installs an item and shows success message" "$OUTPUT"
fi

# ============================================
# TEST 21: add — creates manifest with correct data
# ============================================
echo "=== TEST 21: add creates manifest ==="
if [ -f "$PROJ20/.snipl/manifest.json" ]; then
  MANIFEST=$(cat "$PROJ20/.snipl/manifest.json")
  if echo "$MANIFEST" | grep -q '"name": "sleep"' && echo "$MANIFEST" | grep -q '"registry": "official"'; then
    pass "add creates .snipl/manifest.json with item name and registry"
  else
    fail "add creates .snipl/manifest.json with item name and registry" "$MANIFEST"
  fi
else
  fail "add creates .snipl/manifest.json" "File not found at $PROJ20/.snipl/manifest.json"
fi

# Verify source file was written
if [ -f "$PROJ20/snippets/sleep.ts" ]; then
  pass "add writes source file to output directory"
else
  fail "add writes source file to output directory" "sleep.ts not found in snippets/"
fi

# ============================================
# TEST 22: status — shows unchanged after install
# ============================================
echo "=== TEST 22: status after install ==="
OUTPUT=$($CLI status --cwd "$PROJ20" 2>&1)
if echo "$OUTPUT" | grep -q "unchanged" || echo "$OUTPUT" | grep -q "All installed items are unchanged"; then
  pass "status shows unchanged after fresh install"
else
  fail "status shows unchanged after fresh install" "$OUTPUT"
fi

# ============================================
# TEST 23: add — refuses duplicate install
# ============================================
echo "=== TEST 23: add refuses duplicate ==="
set +e
OUTPUT=$($CLI add sleep --cwd "$PROJ20" --yes 2>&1)
EXITCODE=$?
set -e
if echo "$OUTPUT" | grep -q "already installed"; then
  pass "add refuses to install already-installed item"
else
  fail "add refuses to install already-installed item" "exit=$EXITCODE output=$OUTPUT"
fi

# ============================================
# TEST 24: add — dry-run doesn't write anything new
# ============================================
echo "=== TEST 24: add dry-run ==="
OUTPUT=$($CLI add retry --cwd "$PROJ20" --dry-run --yes 2>&1)
if [ ! -f "$PROJ20/snippets/retry.ts" ]; then
  pass "add --dry-run does not write any files"
else
  fail "add --dry-run does not write any files" "retry.ts was created"
fi

# ============================================
# TEST 25: add — non-existent item fails
# ============================================
echo "=== TEST 25: add non-existent item ==="
set +e
OUTPUT=$($CLI add nonexistent --cwd "$PROJ20" 2>&1)
EXITCODE=$?
set -e
if [ $EXITCODE -eq 2 ]; then
  pass "add with non-existent item returns exit code 2"
else
  fail "add with non-existent item returns exit code 2" "exit=$EXITCODE"
fi

# ============================================
# TEST 26: add — no config fails
# ============================================
echo "=== TEST 26: add no config ==="
PROJ26="/tmp/snipl-test-26"
cleanup
mkdir -p "$PROJ26"
set +e
OUTPUT=$($CLI add sleep --cwd "$PROJ26" 2>&1)
EXITCODE=$?
set -e
if echo "$OUTPUT" | grep -q "snipl init"; then
  pass "add without config shows friendly message to run init first"
else
  fail "add without config shows friendly message" "exit=$EXITCODE output=$OUTPUT"
fi

# ============================================
# TEST 27: add --json — valid JSON output on success
# ============================================
echo "=== TEST 27: add --json ==="
PROJ27="/tmp/snipl-test-27"
cleanup
mkdir -p "$PROJ27"
$CLI init --cwd "$PROJ27" --yes 2>&1 > /dev/null
OUTPUT=$($CLI add sleep --cwd "$PROJ27" --json --yes 2>&1)
if echo "$OUTPUT" | grep -q '"ok":true' && echo "$OUTPUT" | grep -q '"installed"'; then
  pass "add --json returns valid JSON envelope with installed field"
else
  fail "add --json returns valid JSON envelope with installed field" "$OUTPUT"
fi

# ============================================
# TEST 28: status --json — valid JSON output
# ============================================
echo "=== TEST 28: status --json ==="
PROJ28="/tmp/snipl-test-28"
cleanup
mkdir -p "$PROJ28"
$CLI init --cwd "$PROJ28" --yes 2>&1 > /dev/null
$CLI add sleep --cwd "$PROJ28" --yes 2>&1 > /dev/null
OUTPUT=$($CLI status --cwd "$PROJ28" --json 2>&1)
if echo "$OUTPUT" | grep -q '"ok":true' && echo "$OUTPUT" | grep -q '"items"'; then
  pass "status --json returns valid JSON envelope with items array"
else
  fail "status --json returns valid JSON envelope with items array" "$OUTPUT"
fi

# ============================================
# TEST 29: status — shows modified after file change
# ============================================
echo "=== TEST 29: status shows modified ==="
PROJ29="/tmp/snipl-test-29"
cleanup
mkdir -p "$PROJ29"
$CLI init --cwd "$PROJ29" --yes 2>&1 > /dev/null
$CLI add sleep --cwd "$PROJ29" --yes 2>&1 > /dev/null
echo "// modified" >> "$PROJ29/snippets/sleep.ts"
OUTPUT=$($CLI status --cwd "$PROJ29" 2>&1)
if echo "$OUTPUT" | grep -q "modified"; then
  pass "status shows modified after editing installed file"
else
  fail "status shows modified after editing installed file" "$OUTPUT"
fi

# ============================================
# TEST 30: status — shows missing after deletion
# ============================================
echo "=== TEST 30: status shows missing ==="
PROJ30="/tmp/snipl-test-30"
cleanup
mkdir -p "$PROJ30"
$CLI init --cwd "$PROJ30" --yes 2>&1 > /dev/null
$CLI add sleep --cwd "$PROJ30" --yes 2>&1 > /dev/null
rm "$PROJ30/snippets/sleep.ts"
OUTPUT=$($CLI status --cwd "$PROJ30" 2>&1)
if echo "$OUTPUT" | grep -q "missing"; then
  pass "status shows missing after deleting installed file"
else
  fail "status shows missing after deleting installed file" "$OUTPUT"
fi

# ============================================
# TEST 31: status — no items shows friendly message
# ============================================
echo "=== TEST 31: status no items ==="
PROJ31="/tmp/snipl-test-31"
cleanup
mkdir -p "$PROJ31"
$CLI init --cwd "$PROJ31" --yes 2>&1 > /dev/null
OUTPUT=$($CLI status --cwd "$PROJ31" 2>&1)
if echo "$OUTPUT" | grep -q "No items installed"; then
  pass "status with no items shows friendly message"
else
  fail "status with no items shows friendly message" "$OUTPUT"
fi

# ============================================
# TEST 32: add — installs second item alongside first
# ============================================
echo "=== TEST 32: add second item ==="
PROJ32="/tmp/snipl-test-32"
cleanup
mkdir -p "$PROJ32"
$CLI init --cwd "$PROJ32" --yes 2>&1 > /dev/null
$CLI add sleep --cwd "$PROJ32" --yes 2>&1 > /dev/null
OUTPUT=$($CLI add retry --cwd "$PROJ32" --yes 2>&1)
if echo "$OUTPUT" | grep -q "Installed" && [ -f "$PROJ32/snippets/retry.ts" ]; then
  pass "add installs second item alongside existing items"
else
  fail "add installs second item alongside existing items" "$OUTPUT"
fi
MANIFEST32=$(cat "$PROJ32/.snipl/manifest.json")
ITEM_COUNT=$(echo "$MANIFEST32" | node -e "process.stdin.on('data',d=>{const j=JSON.parse(d);console.log(j.items.length)})")
if [ "$ITEM_COUNT" = "2" ]; then
  pass "manifest contains 2 items after installing second"
else
  fail "manifest contains 2 items after installing second" "count=$ITEM_COUNT"
fi

# ============================================
# SUMMARY
# ============================================
echo ""
echo "=========================================="
echo "  E2E TEST RESULTS"
echo "=========================================="
echo "  PASSED: $PASS"
echo "  FAILED: $FAIL"
echo "  TOTAL:  $((PASS + FAIL))"
echo "=========================================="
echo ""

for R in "${RESULTS[@]}"; do
  echo "  $R"
done

echo ""
if [ $FAIL -gt 0 ]; then
  echo "  ❌ Some tests failed!"
  exit 1
else
  echo "  ✅ All tests passed!"
fi
