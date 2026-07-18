# Registry Authoring

> **v1 limitation:** snipl ships only a built-in registry. Remote/third-party registries are not supported. This document describes the built-in registry architecture for contributors.

## Built-in registry

The built-in registry lives in `packages/official-registry/src/`. Each item has:

```
src/items/<name>.ts      # Source file installed into user projects
```

Item metadata is defined in `src/registry.ts` as a `BuiltinItemDef`:

```ts
interface BuiltinItemDef {
  name: string; // kebab-case, unique
  summary: string; // one-line description
  tags: string[]; // search keywords
  environments: string[]; // 'node', 'browser', 'universal'
  exports: { name: string; kind: 'function' | 'type' }[];
  getSource: () => string; // returns the source content
}
```

## Adding a new item

1. Create `src/items/<name>.ts` with the implementation.
2. Add a `BuiltinItemDef` entry in `src/registry.ts`.
3. Add tests in `test/items.test.ts` or a separate test file.
4. Verify:
   - No runtime dependencies (no imports from npm packages).
   - No undeclared global variables.
   - Works in declared environments.
   - Edge cases are documented via `docs.caveats`.

## Item requirements

- **No dependencies.** The installed source must not import from any npm package.
- **Provenance.** License must be declared (`spdx` + `source`: `'original'` or `'derived'`).
- **Tests.** Each item must have behavior tests covering success paths, error paths, and edge cases.
- **Documentation.** Each item must have a usage example and known caveats.
- **SHA-256.** Content hashes are computed automatically by `buildRegistryItems()`.
