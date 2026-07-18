# snipl

Install verified TypeScript utility modules as **source code** into your project. You own the code, not a dependency.

```
npx @snipl/cli init        # create project config
npx @snipl/cli search      # browse 8 built-in utilities
npx @snipl/cli add sleep   # install source into src/snippets/
```

## Why snipl?

- **Source, not a dependency.** Files land in your project. Edit them, test them, commit them. No lockfile, no node_modules, no version drift.
- **Provenance.** Every module has a declared license, tested edge cases, and documented caveats. What you install is what we reviewed.
- **Safety.** Preview every write (`--dry-run`). No silent overwrites. Path-containment prevents writes outside your project. `status` detects tampering.
- **Offline.** Built-in modules need no network.
- **Zero runtime dependencies.** Installed modules import nothing external. What you see is what runs.

## Requirements

- Node.js 22 or later
- pnpm 11 or later (for development)

## Commands

| Command          | Description                                       |
| ---------------- | ------------------------------------------------- |
| `init`           | Create `snippets.json` project config             |
| `list`           | List all available modules                        |
| `search <query>` | Search modules by name, summary, or tags          |
| `view <name>`    | Show module details: exports, license, files      |
| `add <name>`     | Install a module's source files into your project |
| `status`         | Check installed files against recorded hashes     |

### Quickstart

```sh
# Create a project
mkdir my-app && cd my-app && mkdir src

# Initialize snipl config (detects src/ → uses src/snippets/)
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

### JSON mode

Every command supports `--json` for CI and tooling:

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

## Installed modules

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

## Documentation

- [Architecture](./docs/ARCHITECTURE.md) — repository structure, data contracts, transaction flow
- [Product Strategy](./docs/PRODUCT_STRATEGY.md) — customer, problem, scope
- [Decisions](./docs/DECISIONS.md) — intentional product and technical decisions
- [Security Model](./docs/SECURITY_MODEL.md) — safety guarantees and threat model
- [Release Process](./docs/RELEASING.md) — versioning, publishing, CI
- [Compatibility](./docs/COMPATIBILITY.md) — supported Node versions, project layouts
- [Registry Authoring](./docs/REGISTRY_AUTHORING.md) — writing registry items
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md) — delivery roadmap

## License

MIT — see [LICENSE](./LICENSE).
