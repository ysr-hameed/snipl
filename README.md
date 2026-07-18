# snipl — TypeScript Snippet CLI

> Install verified TypeScript utility modules as **source code** into your project.  
> You own the code, not a dependency. Zero runtime dependencies. Integrity guaranteed.

```
npx @snipl/cli init        # create project config
npx @snipl/cli search      # browse 8 built-in utilities
npx @snipl/cli add sleep   # install source into src/snippets/
```

[![npm](https://img.shields.io/npm/v/@snipl/cli)](https://www.npmjs.com/package/@snipl/cli)
[![CI](https://github.com/ysr-hameed/snipl/actions/workflows/ci.yml/badge.svg)](https://github.com/ysr-hameed/snipl/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](./LICENSE)

---

## Why snipl?

Stop copy-pasting utility functions from blog posts or installing heavy npm packages for one function. **snipl** installs small, reviewed, and hashed TypeScript modules directly into your project as editable source files.

- **Source, not a dependency.** Files land in your project. Edit them, test them, commit them. No lockfile, no `node_modules`, no version drift.
- **Provenance.** Every module has a declared license, tested edge cases, and documented caveats. What you install is what we reviewed.
- **Safety.** Preview every write with `--dry-run`. No silent overwrites. Path-containment prevents writes outside your project. `status` detects tampering via SHA-256.
- **Offline.** Built-in modules need no network — usable on a plane, in a CI runner, or on an air-gapped machine.
- **Zero runtime dependencies.** Installed modules import nothing external. What you see is what runs.

## Requirements

- [Node.js](https://nodejs.org/) 22 or later
- pnpm 11 or later (for development)

## Quickstart

```sh
# Create a project
mkdir my-app && cd my-app
mkdir src

# Initialize snipl config (auto-detects src/ → uses src/snippets/)
npx @snipl/cli init

# Browse available modules
npx @snipl/cli list

# Preview before installing
npx @snipl/cli add sleep --dry-run

# Install
npx @snipl/cli add sleep

# Import in your code
import { sleep } from './src/snippets/sleep.js';

await sleep(1000);
```

## Commands

| Command          | Description                                       |
| ---------------- | ------------------------------------------------- |
| `init`           | Create `snippets.json` project config             |
| `list`           | List all available modules                        |
| `search <query>` | Search modules by name, summary, or tags          |
| `view <name>`    | Show module details: exports, license, files      |
| `add <name>`     | Install a module's source files into your project |
| `status`         | Check installed files against recorded hashes     |

### Global flags

| Flag           | Description                      |
| -------------- | -------------------------------- |
| `--cwd <path>` | Working directory (default: `.`) |
| `--json`       | Machine-readable JSON output     |
| `--yes`, `-y`  | Skip confirmation prompts        |
| `--dry-run`    | Preview without writing          |
| `--overwrite`  | Allow replacing existing files   |
| `--verbose`    | Detailed logging                 |
| `--version`    | Show version                     |

### JSON mode for CI and tooling

Every command supports `--json`:

```sh
snipl list --json
# {"ok":true,"data":[{"name":"sleep","version":"0.1.0",...}]}

snipl view sleep --json
# {"ok":true,"data":{"name":"sleep",...}}

snipl add sleep --json --yes
# {"ok":true,"data":{"installed":"sleep","files":["src/snippets/sleep.ts"]}}
```

### Exit codes

| Code | Meaning                           |
| ---- | --------------------------------- |
| 0    | Success                           |
| 1    | Unexpected error                  |
| 2    | Invalid input or configuration    |
| 3    | User cancelled                    |
| 4    | Integrity failure (hash mismatch) |

## Safety

- **No silent overwrites.** `init` and `add` refuse to overwrite existing files without `--overwrite`.
- **Path containment.** All writes are confined to the configured project root. Traversal (`..`) and absolute paths are rejected.
- **Integrity verification.** `add` verifies SHA-256 hashes before writing. `status` detects modified or missing files.
- **Dry-run preview.** Use `--dry-run` to see exactly what would be written before committing.
- **Atomic manifest.** `.snipl/manifest.json` is written atomically after all source files succeed.

## Installed modules (8 built-in)

| Module     | Exports                   | Environments             |
| ---------- | ------------------------- | ------------------------ |
| sleep      | `sleep()`                 | node, browser            |
| retry      | `retry()`, `RetryOptions` | node, browser, universal |
| debounce   | `debounce()`              | node, browser, universal |
| throttle   | `throttle()`              | node, browser, universal |
| memoize    | `memoize()`               | node, browser, universal |
| deep-clone | `deepClone()`             | node, browser, universal |
| clamp      | `clamp()`                 | node, browser, universal |
| slugify    | `slugify()`               | node, browser, universal |

### Module details

| Module     | Lines | Dependencies | TypeScript | Docs                               |
| ---------- | ----- | ------------ | ---------- | ---------------------------------- |
| sleep      | 12    | 0            | ✅         | [docs](./docs/items/sleep.md)      |
| retry      | 17    | 0            | ✅         | [docs](./docs/items/retry.md)      |
| debounce   | 27    | 0            | ✅         | [docs](./docs/items/debounce.md)   |
| throttle   | 26    | 0            | ✅         | [docs](./docs/items/throttle.md)   |
| memoize    | 17    | 0            | ✅         | [docs](./docs/items/memoize.md)    |
| deep-clone | 46    | 0            | ✅         | [docs](./docs/items/deep-clone.md) |
| clamp      | 7     | 0            | ✅         | [docs](./docs/items/clamp.md)      |
| slugify    | 19    | 0            | ✅         | [docs](./docs/items/slugify.md)    |

## Use cases

- **Express / Node.js APIs** — add `sleep` and `retry` for rate-limiting and resilient API calls
- **React / Next.js apps** — add `debounce` and `throttle` for search inputs and scroll handlers
- **CLI tools** — add `memoize` for caching expensive computations
- **Data processing** — add `deep-clone` for safe object copying
- **Any TypeScript project** — add `clamp` for number validation, `slugify` for URL generation

## Development

```sh
git clone https://github.com/ysr-hameed/snipl.git
cd snipl
pnpm install
pnpm build

# Test locally (no npm token needed)
node apps/cli/dist/src/index.js init --yes
node apps/cli/dist/src/index.js list

# Run tests
pnpm test
bash scripts/test-e2e.sh
bash scripts/test-compat.sh
```

### Modify a snippet and test locally

```sh
# Edit source
vim packages/official-registry/src/items/sleep.ts

# Rebuild
pnpm build

# Reinstall in project
node apps/cli/dist/src/index.js add sleep --overwrite --yes
```

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — repository structure, data contracts, transaction flow
- [Product Strategy](./docs/PRODUCT_STRATEGY.md) — customer, problem, scope
- [Decisions](./docs/DECISIONS.md) — intentional product and technical decisions
- [Security Model](./docs/SECURITY_MODEL.md) — safety guarantees and threat model
- [Release Process](./docs/RELEASING.md) — versioning, publishing, CI
- [Compatibility](./docs/COMPATIBILITY.md) — supported Node versions, project layouts
- [Registry Authoring](./docs/REGISTRY_AUTHORING.md) — writing registry items
- [Beta Guide](./docs/BETA_GUIDE.md) — known limitations, security reporting
- [Manual Testing](./docs/MANUAL_TESTING.md) — step-by-step manual test guide

## Related

- [awesome-snippets](https://github.com/topics/snippet-manager) — other snippet managers
- [TypeScript](https://www.typescriptlang.org/) — the language every module is written in
- [cac](https://github.com/cacjs/cac) — CLI framework used by snipl

## License

MIT — see [LICENSE](./LICENSE).

---

<sub>snipl — TypeScript snippet CLI. Install code, not dependencies.</sub>
