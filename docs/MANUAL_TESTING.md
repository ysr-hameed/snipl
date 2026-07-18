# Manual Testing Guide

Run everything from this repo root. No npm token needed.

```sh
# Build first
pnpm build
```

---

## 1. Basic commands

### init

```sh
mkdir -p /tmp/snipl-manual && cd /tmp/snipl-manual
node /path/to/snipl/apps/cli/dist/src/index.js init --yes
ls snippets.json           # should exist
```

### list

```sh
node /path/to/snipl/apps/cli/dist/src/index.js list
# Shows 8 items: sleep, retry, debounce, throttle, memoize, deep-clone, clamp, slugify
```

### search

```sh
node /path/to/snipl/apps/cli/dist/src/index.js search sleep
node /path/to/snipl/apps/cli/dist/src/index.js search "deep clone"
node /path/to/snipl/apps/cli/dist/src/index.js search nonexistent
# empty query → exit code 2
```

### view

```sh
node /path/to/snipl/apps/cli/dist/src/index.js view sleep
node /path/to/snipl/apps/cli/dist/src/index.js view --json sleep
node /path/to/snipl/apps/cli/dist/src/index.js view nonexistent   # exit code 2
```

### add + status

```sh
node /path/to/snipl/apps/cli/dist/src/index.js add sleep --yes
cat src/snippets/sleep.ts   # should exist
node /path/to/snipl/apps/cli/dist/src/index.js status   # unchanged
echo "// edit" >> src/snippets/sleep.ts
node /path/to/snipl/apps/cli/dist/src/index.js status   # modified
rm src/snippets/sleep.ts
node /path/to/snipl/apps/cli/dist/src/index.js status   # missing
```

---

## 2. Safety features

### Refuse duplicate install

```sh
node /path/to/snipl/apps/cli/dist/src/index.js add sleep --yes
# → error: already installed
```

### Overwrite protection

```sh
node /path/to/snipl/apps/cli/dist/src/index.js add sleep --overwrite --yes
# → replaces files
```

### Dry-run writes nothing

```sh
node /path/to/snipl/apps/cli/dist/src/index.js add retry --dry-run --yes
ls src/snippets/retry.ts   # should NOT exist
```

### Path containment

```sh
# Edit snippets.json, set output to "../escape"
# Run: init should refuse or contain the path
```

### No config → friendly error

```sh
mkdir /tmp/snipl-no-config && cd /tmp/snipl-no-config
node /path/to/snipl/apps/cli/dist/src/index.js add sleep
# → tells you to run init first
```

---

## 3. --cwd flag

```sh
mkdir -p /tmp/snipl-cwd-test/subproject/src
node /path/to/snipl/apps/cli/dist/src/index.js init --cwd /tmp/snipl-cwd-test/subproject --yes
node /path/to/snipl/apps/cli/dist/src/index.js add slugify --cwd /tmp/snipl-cwd-test/subproject --yes
cat /tmp/snipl-cwd-test/subproject/src/snippets/slugify.ts   # should exist

# Bad path
node /path/to/snipl/apps/cli/dist/src/index.js init --cwd /nonexistent
# → exit code 2
```

---

## 4. --json flag (machine-readable output)

```sh
node /path/to/snipl/apps/cli/dist/src/index.js list --json | jq .
node /path/to/snipl/apps/cli/dist/src/index.js search sleep --json | jq .
node /path/to/snipl/apps/cli/dist/src/index.js view sleep --json | jq .
node /path/to/snipl/apps/cli/dist/src/index.js status --json | jq .
node /path/to/snipl/apps/cli/dist/src/index.js add memoize --json --yes | jq .
```

Each returns `{"ok":true,"data":...}` or `{"ok":false,"error":"..."}`.

---

## 5. Modify source and test locally

```sh
# 1. Edit the source
vim packages/official-registry/src/items/sleep.ts

# 2. Rebuild
pnpm build

# 3. Reinstall in test project
node apps/cli/dist/src/index.js add sleep --cwd /tmp/snipl-manual --overwrite --yes
cat /tmp/snipl-manual/src/snippets/sleep.ts  # has your changes

# 4. Verify status still works
node apps/cli/dist/src/index.js status --cwd /tmp/snipl-manual

# 5. Restore original
git checkout packages/official-registry/src/items/sleep.ts
pnpm build
```

---

## 6. Test all 8 items install correctly

```sh
cd /tmp/snipl-manual
for item in sleep retry debounce throttle memoize deep-clone clamp slugify; do
  node /path/to/snipl/apps/cli/dist/src/index.js add "$item" --yes
  echo "$item: $(ls src/snippets/${item}.ts 2>/dev/null && echo OK || echo MISSING)"
done

node /path/to/snipl/apps/cli/dist/src/index.js status --json
# All 8 should show unchanged
```

---

## 7. Test exit codes

```sh
node /path/to/snipl/apps/cli/dist/src/index.js list
echo "exit: $?"  # 0

node /path/to/snipl/apps/cli/dist/src/index.js search
echo "exit: $?"  # 2 (empty query)

node /path/to/snipl/apps/cli/dist/src/index.js view nonexistent
echo "exit: $?"  # 2 (not found)

node /path/to/snipl/apps/cli/dist/src/index.js init --cwd /nonexistent
echo "exit: $?"  # 2 (bad path)
```

---

## 8. Full clean-room test (from npm)

```sh
mkdir /tmp/snipl-from-npm && cd /tmp/snipl-from-npm
npm init -y
npx @snipl/cli --version
npx @snipl/cli init --yes
npx @snipl/cli add sleep --yes
npx @snipl/cli status --json
```

---

## 9. CI-like test

```sh
pnpm format:check
pnpm typecheck
pnpm test
bash scripts/test-e2e.sh
bash scripts/test-compat.sh
```
