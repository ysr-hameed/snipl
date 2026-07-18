#!/usr/bin/env bash
set -euo pipefail

CLI="node $(dirname "$0")/../apps/cli/dist/src/index.js"
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
PASS=0
FAIL=0

pass() { PASS=$((PASS + 1)); echo "  PASS | $1"; }
fail() { FAIL=$((FAIL + 1)); echo "  FAIL | $1 | $2"; }

cleanup() { rm -rf /tmp/snipl-real-*; }
trap cleanup EXIT

echo "=== Real Project Workflow ==="

echo ""
echo "--- 1. Create a project and install snippets ---"
PROJ="/tmp/snipl-real-project"
mkdir -p "$PROJ/src"
echo '{"name":"my-app","type":"module"}' > "$PROJ/package.json"

$CLI init --cwd "$PROJ" --yes > /dev/null 2>&1
$CLI add sleep --cwd "$PROJ" --yes > /dev/null 2>&1
$CLI add retry --cwd "$PROJ" --yes > /dev/null 2>&1

if [ -f "$PROJ/src/snippets/sleep.ts" ] && [ -f "$PROJ/src/snippets/retry.ts" ]; then
  pass "Project created with sleep + retry"
else
  fail "Project creation" "snippets not found"
fi

echo ""
echo "--- 2. Modify a snippet source, rebuild, test ---"

ORIGINAL_SLEEP="$ROOT/packages/official-registry/src/items/sleep.ts"
SLEEP_BACKUP=$(cat "$ORIGINAL_SLEEP")

cat > "$ORIGINAL_SLEEP" << 'ENDMOD'
export async function sleep(ms: number = 1000): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
export function sleepSync(ms: number): void {
  Atomics.wait(new Int32Array(new SharedArrayBuffer(4)), 0, 0, ms);
}
ENDMOD

(cd "$ROOT" && pnpm build > /dev/null 2>&1)

if grep -q "sleepSync" "$ROOT/packages/official-registry/dist/src/items/sleep.js"; then
  pass "Modified source rebuilt — sleepSync in dist"
else
  fail "Rebuild" "sleepSync not in dist"
fi

echo "$SLEEP_BACKUP" > "$ORIGINAL_SLEEP"
(cd "$ROOT" && pnpm build > /dev/null 2>&1)
echo "  Original sleep.ts restored"

echo ""
echo "--- 3. When do you need the npm token? ---"
echo ""
echo "  Scenario                         | Token needed?"
echo "  -------------------------------- | --------------"
echo "  Local dev (this repo)            |  NO"
echo "  Test CLI from local build        |  NO"
echo "  Publish to npm (@next/@latest)   |  YES"
echo "  Install via npx @snipl/cli       |  NO (public)"
echo "  Modify source, test locally      |  NO"
echo "  CI (GitHub Actions)              |  NO (unless publishing)"
echo ""
echo "  Local change workflow:"
echo "    1. Edit packages/official-registry/src/items/*.ts"
echo "    2. pnpm build"
echo "    3. node apps/cli/dist/src/index.js add <item> --cwd <project> --overwrite"
echo "    4. Iterate locally — no npm token ever needed"
echo ""
echo "  Publish workflow:"
echo "    1. npm version patch --workspaces"
echo "    2. pnpm build"
echo "    3. pnpm publish -r --access public"
echo "    4. Requires NPM_TOKEN (only at publish time)"
echo ""

echo "=== Results: $PASS passed, $FAIL failed ==="
[ $FAIL -eq 0 ] || exit 1
