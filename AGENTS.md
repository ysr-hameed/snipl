# Snippet CLI — AI Contributor Guide

Read this file before making any change. It is the working contract for this repository.

## Product in one sentence

Snippet CLI installs small, **verified and owned source modules** into a developer's project, with clear provenance and safe update information.

## Read in this order

1. `docs/PRODUCT_STRATEGY.md` — customer, problem, scope, and positioning.
2. `docs/DECISIONS.md` — non-negotiable product and technical decisions.
3. `docs/ARCHITECTURE.md` — boundaries, data contracts, and safety model.
4. `docs/IMPLEMENTATION_PLAN.md` — ordered delivery plan and acceptance criteria.

If these documents conflict, use this order: `DECISIONS.md`, `PRODUCT_STRATEGY.md`, `ARCHITECTURE.md`, then the implementation plan. Propose a decision-record change before changing an intentional decision.

## Operating rules

- Ship the TypeScript/Node MVP before adding languages, a hosted registry, accounts, sync, or paid plans.
- Never silently overwrite a user-owned file. Preview first; require an explicit overwrite flag or confirmation.
- Never install a package, execute generated code, or mutate project configuration unless the registry item declares it and the user explicitly approves it.
- Treat every remote registry item as untrusted until integrity and schema validation succeed.
- Source code is the product: every built-in item needs focused tests, metadata, documentation, and a declared license/provenance.
- Prefer boring, portable Node APIs and an adapter boundary over framework-specific logic.
- Keep the CLI usable offline for built-in snippets.
- Do not claim “zero dependencies” for an item that imports anything external. Say “no runtime dependency” only when it is true.

## Change expectations

- Add or update tests with behavior changes; include failure and overwrite paths for filesystem changes.
- Preserve stable machine-readable output for `--json` commands.
- Use semantic versioning. A changed generated API is a breaking change even if the CLI command is unchanged.
- Update the relevant docs and a decision record whenever scope, registry schema, or safety behavior changes.
- Before handing off: run formatting, type-checking, unit tests, and a CLI smoke test appropriate to the change.

## Definition of done

A feature is done only when its acceptance criteria in `docs/IMPLEMENTATION_PLAN.md` pass, its unhappy path is tested, its documentation is accurate, and it does not weaken file safety or provenance.
