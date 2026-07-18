# Release Process

## Versioning

snipl uses [Semantic Versioning](https://semver.org/). Pre-release versions use the `0.x` range until stable v1.

- **Major (1.0.0):** stable v1 release.
- **Minor (0.1.0, 0.2.0, ...):** new features, new catalogue items, non-breaking changes.
- **Patch (0.0.1, 0.0.2, ...):** bug fixes, documentation, internal refactoring.

Breaking changes to the registry schema, CLI command output format, or safety guarantees require a major version bump even in pre-release.

## Release workflow

Releases are triggered manually via the GitHub Actions workflow:

1. Go to Actions → Release → Run workflow.
2. Choose the version bump: `patch`, `minor`, or `major`.
3. The workflow runs checks, publishes all packages to npm, tags the commit, and pushes the tag.

Manual release (from local):

```sh
# Update versions across workspace
npm version patch --workspaces --include-workspace-root
git push --follow-tags

# Publish (requires npm provenance)
pnpm publish -r --provenance --access public
```

## Pre-release checklist

Before any release:

- [ ] Format, lint, type-check, and build pass.
- [ ] All unit tests pass (`pnpm test`).
- [ ] All end-to-end tests pass (`bash scripts/test-e2e.sh`).
- [ ] Packed tarball is clean (`pnpm pack:cli`; inspect contents).
- [ ] Fresh install from tarball completes the quickstart.
- [ ] No secrets, personal data, or workspace-only paths in tarball.
- [ ] CHANGELOG or release notes are updated.
- [ ] Documentation matches the release version.

## Stable v1 exit criteria

See [IMPLEMENTATION_PLAN.md](./IMPLEMENTATION_PLAN.md) Phase 8 for the full release checklist.
