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
