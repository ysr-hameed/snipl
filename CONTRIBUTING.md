# Contributing to Snippet CLI

Thank you for your interest. Before contributing, please read:

1. [AGENTS.md](./AGENTS.md) — AI contributor guide and operating rules
2. [docs/PRODUCT_STRATEGY.md](./docs/PRODUCT_STRATEGY.md) — scope and positioning
3. [docs/DECISIONS.md](./docs/DECISIONS.md) — non-negotiable decisions
4. [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) — boundaries and safety model
5. [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md) — delivery plan

## Getting started

```sh
pnpm install
pnpm typecheck
pnpm test
```

## Development workflow

- Run `pnpm format` before committing
- Keep tests alongside source files
- Update docs when changing user-visible behavior
- Prefer boring, portable Node APIs over framework-specific logic

## Pull request guidelines

- One change per PR. If you have multiple changes, split them.
- Include tests for success and failure paths.
- Ensure `pnpm format:check`, `pnpm typecheck`, and `pnpm test` pass.
- Update relevant docs and decision records.
- Do not add runtime dependencies unless approved and declared.

## Code of conduct

This project follows the [Contributor Covenant](./CODE_OF_CONDUCT.md).
