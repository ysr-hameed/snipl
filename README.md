# Snippet CLI

> Verified, dependency-transparent source modules you can own — installed with provenance, tests, and safe update previews.

Snippet CLI installs small, **verified and owned source modules** into a developer's project, with clear provenance and safe update information. Think shadcn for utility code.

```sh
npx @snipl/cli init
npx @snipl/cli search retry
npx @snipl/cli add retry --dry-run
npx @snipl/cli add retry
```

## Features

- **Source copy, not a dependency.** Files belong to your project. Edit them freely.
- **Safety first.** Preview every write. No silent overwrites. Path-containment guaranteed.
- **Provenance.** Every module has a declared license, tests, and documented edge cases.
- **Offline-capable.** Built-in modules work without network access.
- **Local-first.** Your config and installed modules stay in your project.

## Status

Pre-release. See [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) for the delivery roadmap.

## Documentation

- [Product Strategy](./docs/PRODUCT_STRATEGY.md)
- [Architecture](./docs/ARCHITECTURE.md)
- [Decisions](./docs/DECISIONS.md)
- [Implementation Plan](./docs/IMPLEMENTATION_PLAN.md)

## License

MIT — see [LICENSE](./LICENSE).
