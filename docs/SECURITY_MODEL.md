# Security Model

## Goal

snipl installs third-party source code into a developer's project. The security model ensures that:

1. **No data loss.** Writes are predictable and reversible.
2. **No path escape.** Installed files cannot be written outside the configured project.
3. **No silent modification.** Every write is previewed or confirmed.
4. **Integrity verification.** Installed content hashes are recorded and checkable.

## Threat model

| Threat                                                  | Mitigation                                                                                                        |
| ------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Malicious registry item contains `..` or absolute paths | `WritePlan` rejects traversal, absolute paths, and null bytes before any file is created                          |
| Malicious item escapes via symlink                      | Symlink escapes are detected and rejected                                                                         |
| Registry item hash doesn't match content                | SHA-256 is verified before the write plan is built; mismatch returns exit code 4                                  |
| Accidental overwrite of user file                       | Default behavior: error on collision. `--overwrite` requires explicit confirmation or `--yes`                     |
| Partial write due to crash or error                     | All writes go to temporary files first, then atomically renamed. A rollback journal restores originals on failure |
| Tampered installed files                                | `status` compares disk hashes against manifest; labels files as `modified` or `missing`                           |
| Telemetry or network calls                              | v1 is fully offline. No production command contacts a network                                                     |

## Integrity chain

```
Registry source ──► SHA-256 ──► RegistryItem ──► WritePlan ──► Install ──► Manifest
     ↑                              ↑                  ↑                        ↓
     └── verified at build time     │                  └── verified before      │
                                    │                      write                │
                                    └── schema-validated                       │
                                                                               ↓
                                                                       status ──┘
                                                                       (hash compare)
```

## File safety guarantees

- **No file is written before all collisions are detected.** `WritePlan` preflights all target paths.
- **No file is overwritten without confirmation.** Default behavior: report collision, exit code 2. `--overwrite --yes` required to proceed.
- **No write escapes the project root.** `resolveOutputPath` checks that the resolved path starts with the project root.
- **Manifest is written last.** Source files succeed first; only then is `.snipl/manifest.json` atomically written.
- **Dry-run changes nothing.** `--dry-run` produces the plan but performs zero writes.

## Config safety

- `snippets.json` is never modified after `init` except by explicit `init --overwrite`.
- `add` reads config but never changes it.
- `status` is read-only.

## Registry safety

- Built-in items are schema-validated at build time. An item that fails validation throws an error and is excluded from the registry list.
- v1 does not support remote registries. All items are bundled and verified.
- Items declare `dependencies: []` and `templateVariables: []` — no external code is imported or executed during install.

## Reporting a vulnerability

See [SECURITY.md](../SECURITY.md) for the disclosure process.
