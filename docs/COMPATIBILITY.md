# Compatibility

## Node.js

snipl requires **Node.js 22 or later**. This is the minimum version that supports:

- `import.meta.dirname` (available since Node 22)
- Stable `--experimental-json-modules` and ESM support
- `AbortSignal` and `AbortController` globals

## Package manager

The project uses **pnpm 11+** with a workspace layout. The CLI is published as a standalone npm package and can be consumed with any package manager (`npx`, `pnpm dlx`, `bunx`).

## Supported project layouts

snipl works with these project structures:

| Layout                          | Output detection         |
| ------------------------------- | ------------------------ |
| Project with `src/`             | `src/snippets/`          |
| Project without `src/`          | `snippets/`              |
| Explicit `--output`             | As specified             |
| Monorepo package (subdirectory) | Use `--cwd <subpackage>` |

## Environments

Installed modules declare their environment compatibility:

| Environment | Description                                           |
| ----------- | ----------------------------------------------------- |
| `node`      | Uses Node.js APIs (e.g., `setTimeout`, `AbortSignal`) |
| `browser`   | Works in browser environments                         |
| `universal` | Works in both Node.js and browser                     |

## Operating systems

- **Linux** — primary development and CI target.
- **macOS** — tested in CI.
- **Windows** — currently tested manually; cross-platform path tests are in development.

## TypeScript

All installed modules are TypeScript source (`.ts`). The emitted JavaScript targets ES2022 via `tsc`. Modules use:

- `async/await`
- `Promise` and `setTimeout`
- `AbortSignal` (in `sleep`)
- ES2015+ features (`Map`, `Set`, `WeakMap`, `Proxy`, arrow functions)
