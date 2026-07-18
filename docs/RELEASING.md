# Release Process

## Versioning

snipl uses [Semantic Versioning](https://semver.org/).

- **Prerelease (1.0.0-next.N):** beta releases published to the `next` dist-tag.
- **Major (1.0.0):** stable v1 release.
- **Minor (1.x.0):** new features, new catalogue items, non-breaking changes.
- **Patch (1.0.x):** bug fixes, documentation, internal refactoring.

Breaking changes to the registry schema, CLI command output format, or safety guarantees require a major version bump.

## Packages

All packages are published together under the same version:

| Package                    | npm                         |
| -------------------------- | --------------------------- |
| `@snipl/cli`               | CLI binary                  |
| `@snipl/core`              | Core engine                 |
| `@snipl/registry-schema`   | Schema + validation         |
| `@snipl/official-registry` | Built-in snippet collection |

## Release workflow

### Automated (GitHub Actions)

1. Go to Actions → Release → Run workflow.
2. Choose the version bump: `prerelease` (beta), `patch`, `minor`, or `major`.
3. Choose the dist-tag: `next` (beta) or `latest` (stable).
4. The workflow runs checks, publishes all packages to npm, tags the commit, and pushes the tag.

### Manual (local)

```sh
# Update versions across workspace
npm version prerelease --preid next --workspaces --include-workspace-root
git push --follow-tags

# Publish (requires npm provenance + NPM_TOKEN)
pnpm publish -r --provenance --access public --tag next
```

## Pre-release checklist

Before any release:

- [ ] Format, lint, type-check, and build pass.
- [ ] All unit tests pass (`pnpm test`).
- [ ] All end-to-end tests pass (`bash scripts/test-e2e.sh`).
- [ ] Compatibility fixture tests pass (`bash scripts/test-compat.sh`).
- [ ] Packed tarball is clean (`pnpm pack:cli`; inspect contents).
- [ ] Fresh install from tarball completes the quickstart.
- [ ] No secrets, personal data, or workspace-only paths in tarball.
- [ ] CHANGELOG or release notes are updated.
- [ ] Documentation matches the release version.

## Stable v1 exit criteria

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) Phase 8 for the full release checklist.
