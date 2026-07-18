# Decisions

This is the decision record for the initial product. Status: accepted unless marked otherwise.

| ID    | Decision                                                           | Why                                                                                        | Consequence                                                                                     |
| ----- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| D-001 | Build a TypeScript/Node CLI first.                                 | Fastest path to the initial customer and strongest source ecosystem.                       | Other languages require a later registry adapter and validation strategy.                       |
| D-002 | Use a monorepo with `pnpm` workspaces.                             | The CLI, registry schema, built-in modules, and test fixtures need versioned coordination. | Package boundaries must be kept intentional.                                                    |
| D-003 | Ship official modules inside the CLI package for MVP.              | Offline use, reproducibility, no hosting dependency.                                       | Remote updates are not available in v1.                                                         |
| D-004 | Create a project config named `snippets.json`.                     | The tool needs an explicit destination and registry policy.                                | Never infer and write to a source directory without configuration/confirmation.                 |
| D-005 | Create `.snipl/manifest.json` after installation.                  | Enables status, provenance, drift detection, and future update preview.                    | The manifest is CLI-owned metadata, not an ownership claim over generated source.               |
| D-006 | Default to no overwrite; require preview/confirmation.             | Source files may have been edited.                                                         | Noninteractive CI use needs `--yes`; replacement needs `--overwrite`.                           |
| D-007 | Built-in items have no external runtime dependencies.              | It makes the core promise clear and reduces surprise.                                      | Items needing packages are deferred; later they must declare dependencies and require approval. |
| D-008 | Do not provide automatic merges or automatic updates.              | Generated code is intentionally user-owned; unsafe merges damage trust.                    | `update` can only show a diff and write with explicit overwrite.                                |
| D-009 | Registry content is data plus files, validated by a shared schema. | Avoid arbitrary executable template logic and make remote registries auditable.            | Template variables use a constrained replacement system, not arbitrary JavaScript.              |
| D-010 | License provenance is mandatory for every item.                    | Copying code creates legal and trust obligations.                                          | Unattributed or incompatible contributed content is rejected.                                   |

## Default config

```json
{
  "$schema": "https://snipl.dev/schema/config-v1.json",
  "output": "src/snippets",
  "language": "ts",
  "registries": [{ "name": "official", "source": "builtin" }]
}
```

## Non-goals encoded as policy

`sync`, user authentication, paid packs, package installation, remote writes, and code execution are out of scope for the MVP. A feature request touching any of these must add a decision record first.
