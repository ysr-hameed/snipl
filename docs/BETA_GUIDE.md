# snipl Beta Guide

Thank you for trying the snipl beta! This guide covers what to expect, known limitations, and how to report issues.

## Install the beta

```sh
npx @snipl/cli@next init
```

## What's included

- 8 TypeScript utility modules: sleep, retry, debounce, throttle, memoize, deep-clone, clamp, slugify
- `init`, `list`, `search`, `view`, `add`, `status` commands
- Source ownership — all installed files are yours to edit
- SHA-256 integrity verification via `status`
- Path containment — writes never escape the project root
- `--dry-run`, `--json`, `--yes` flags for CI and scripting

## Known limitations

- **v1 does not include:** remote registries, automatic updates, dependency installation, template variables, or support beyond JS/TS.
- **Windows support:** tested in CI, but path case-sensitivity and Unicode scenarios may have edge cases. Report any issues.
- **Monorepo support:** install per package with `--cwd <subpackage>`. Global workflow management is not yet supported.
- **No uninstall command:** remove files manually or use `git checkout` to revert.
- **Catalogue is fixed:** 8 modules. New modules will be added based on beta feedback.

## Reporting issues

- **Bug report:** open a GitHub issue using the Bug Report template.
- **Security issue:** do NOT open a public issue. See [SECURITY.md](../SECURITY.md) for the disclosure process.
- **Feature request:** open a GitHub issue using the Feature Request template.

## Feedback

We want to know:

- Which modules do you use most?
- What modules are missing?
- Was the install process clear?
- Did any safety feature surprise you?
- Would you use this in a production project?

## Beta exit criteria

The beta ends when:

1. Zero confirmed unapproved overwrites or writes outside the configured project.
2. At least 80% of beta users rate source preview/provenance as sufficient for work projects.
3. The documentation quickstart works without assistance.
4. Cross-platform CI is green on Linux, macOS, and Windows.
