# Architecture

## Repository shape

```text
apps/
  cli/                 command parsing, prompts, rendering
packages/
  core/                use cases and filesystem abstraction
  registry-schema/     Zod schemas, types, integrity helpers
  official-registry/   item metadata, source files, tests, docs
  test-kit/            temp-project fixtures and CLI helpers
docs/
```

The CLI is deliberately thin. `core` accepts interfaces for the filesystem, clock, logger, registry resolver, and prompt. This keeps file safety testable and makes future registry transports independent of command parsing.

## Commands in the MVP

| Command          | Behaviour                                                                                                   |
| ---------------- | ----------------------------------------------------------------------------------------------------------- |
| `init`           | Writes `snippets.json` only after showing its content; can select output path and TypeScript/JavaScript.    |
| `list`           | Lists local official modules; `--json` returns stable structured output.                                    |
| `search <query>` | Searches name, summary, tags, and environment.                                                              |
| `view <name>`    | Shows metadata, source preview, exports, environment, license, and known trade-offs.                        |
| `add <name>`     | Resolves target paths, displays a write plan, and writes only after confirmation; creates/updates manifest. |
| `status`         | Reads the manifest and labels files as unchanged, modified, missing, or unknown.                            |

Global flags: `--cwd`, `--yes`, `--dry-run`, `--json`, `--verbose`, `--version`. `add` additionally supports `--path` and `--overwrite`. `--json` implies no interactive prompt and never emits progress text on stdout.

## Registry item contract (v1)

```ts
type RegistryItem = {
  schemaVersion: 1;
  name: string; // kebab-case, unique per registry
  version: string; // semver
  summary: string;
  tags: string[];
  language: 'ts' | 'js';
  environments: ('browser' | 'node' | 'universal')[];
  exports: { name: string; kind: 'function' | 'type' | 'class' }[];
  files: { path: string; content: string; sha256: string }[];
  dependencies: []; // MVP invariant
  templateVariables: [];
  license: { spdx: string; source: 'original' | 'derived'; attribution?: string };
  tests: { path: string; content: string }[];
  docs: { usage: string; caveats: string[] };
};
```

Validate names, paths, content hashes, schema version, license fields, and the empty-dependency invariant before an item becomes part of the official registry.

## Installation transaction

```text
resolve config + item
        ↓
validate schema, paths, hashes, collision policy
        ↓
build write plan + unified diff / dry-run output
        ↓
user confirmation (or --yes)
        ↓
atomic writes to target files
        ↓
atomic manifest update
```

Path rules: resolve all targets relative to the chosen project root; reject absolute paths, `..` traversal, symlink escapes, and writes outside the configured output directory. Use temporary files in the target directory and rename them atomically where supported. If a multi-file write fails, report exactly what changed and preserve recovery information; design the writer to preflight all collisions before the first write.

## Canonical snippets.json (project config)

```json
{
  "$schema": "https://snipl.dev/schema/config-v1.json",
  "output": "src/snippets",
  "language": "ts",
  "registries": [{ "name": "official", "source": "builtin" }]
}
```

Default config applied when `init` is run without arguments:

- `output`: `src/snippets`
- `language`: `ts` (TypeScript)
- `registries`: single built-in official registry

## Canonical .snipl/manifest.json (installation record)

```json
{
  "schemaVersion": 1,
  "items": [
    {
      "registry": "official",
      "name": "retry",
      "version": "1.0.0",
      "installedAt": "2026-07-18T00:00:00.000Z",
      "files": [
        {
          "path": "src/snippets/retry.ts",
          "sha256": "53b6d53f8dfc6f6b64a5f4fe9c88df4158bfc672383abeb931fb369b19e8f83b"
        },
        {
          "path": "src/snippets/backoff.ts",
          "sha256": "f581dc804c980c0012607546dd78af4977e13526efc3f6a33e9ae58593f3a11d"
        }
      ]
    }
  ]
}
```

`schemaVersion` is always `1` for MVP. `status` compares recorded SHA-256 hashes with disk contents without changing files. A hash mismatch means **modified**, not an error and not a reason to overwrite.

## Quality gates

- TypeScript strict mode; linting and formatting enforced in CI.
- Unit tests for schema, path resolution, write planning, collision handling, and manifest drift.
- Contract tests for every official module: exports compile and documented examples execute.
- End-to-end tests run the packed CLI in temporary TypeScript and JavaScript fixture repositories.
- Security tests cover traversal, symlinks, malformed registry data, hash mismatch, interrupted transaction, and noninteractive behavior.

## Future extension seams

Remote registries implement `RegistryResolver`; their download must use HTTPS, timeouts, a size cap, schema validation, and pinned content hashes. Team policies belong in a separate optional package and must not change the trusted local installation core.
