# Implementation Plan

This is the delivery blueprint for a fully working, production-ready v1. It is deliberately detailed so a developer or AI agent can take the next unchecked task without inventing product behavior. Read `AGENTS.md`, `PRODUCT_STRATEGY.md`, `DECISIONS.md`, and `ARCHITECTURE.md` first.

## Scope and delivery boundary

**v1 ships:** a Node CLI that installs a small, bundled catalogue of verified JavaScript/TypeScript source modules into a configured project directory; previews writes; never overwrites by default; and records installation hashes for `status`.

**v1 does not ship:** remote registries, account login, cloud/Gist sync, paid plans, telemetry by default, dependency installation, template variables, automatic upgrades, or support for languages beyond JS/TS. Those are separate products/features—not unfinished work.

## Conventions used in every phase

- Node support: select and document current Active LTS versions before starting; test the lowest supported version and latest LTS in CI.
- Package manager: `pnpm`; commit `pnpm-lock.yaml` once the workspace is created.
- Source: TypeScript, ESM, strict compiler settings. Generated JS is the published runtime artifact.
- Testing: Vitest unit/integration tests plus end-to-end tests against the packed npm tarball.
- Versioning: conventional commits and SemVer. Use prereleases (`0.x` or `1.0.0-next.n`) until stable v1.
- CLI stdout is for results; stderr is for diagnostics, prompts, and progress. JSON commands write one JSON document to stdout and nothing else.
- Every filesystem test uses a temporary project directory, never the repository root.

## Work sequence and dependencies

```text
P0 validation ───────► P1 workspace/contracts ─► P2 command/core foundations
                                                    │
                                                    ├─► P3 safe installer + manifest
                                                    │       │
                                                    │       ├─► P4 official catalogue
                                                    │       └─► P5 docs, CI, package hardening
                                                    │                 │
                                                    └─────────────────┴─► P6 beta ─► P7 v1 release
```

Do not parallelize changes to the registry schema, installer transaction, and manifest format without a named owner: they form one compatibility contract.

## Phase 0 — Validate the problem (1–2 weeks)

**Outcome:** evidence that the narrow TypeScript utility use case is worth building.

### Tasks

- [ ] Write a neutral interview script. Ask for the last utility a developer copied, where it came from, how they tested it, why they did not use a package, and whether source ownership matters. Do not pitch the product first.
- [ ] Interview 12 target users: application developers who use TypeScript and have shipped production code in the last six months.
- [ ] Record only consented, anonymized findings in `docs/research/`; do not retain customer code, repository URLs, or credentials.
- [ ] Create a ranked list of desired utilities. For each, capture environment, expected API, edge cases, existing alternatives, and willingness to install source.
- [ ] Make a nonfunctional command-output prototype for `init`, `search`, `view`, `add --dry-run`, and collision handling.
- [ ] Run five observed usability sessions with that prototype. Time task completion and record wording confusion.
- [ ] Define a module quality scorecard: API, types, behavior/edge cases, portability, docs, tests, performance where relevant, accessibility/security where relevant, and license provenance.
- [ ] Decide the initial eight modules using demand evidence, not personal preference. Record the decision in `docs/research/mvp-catalogue.md`.

### Exit criteria

- [ ] At least 8/12 interviewees describe repeated manual utility reuse.
- [ ] At least 4/5 usability participants can explain what will be written and finish an install task without help.
- [ ] An MVP catalogue and a list of rejected candidates exist with reasons.
- [ ] If this evidence is not met, revise product scope in `PRODUCT_STRATEGY.md` before creating implementation packages.

## Phase 1 — Create the workspace and engineering baseline (week 1)

**Outcome:** a reproducible repository in which all checks run locally and in CI.

### 1.1 Repository setup

- [ ] Initialise a Git repository and add `.gitignore` for Node artifacts, coverage, temporary fixtures, and local environment files.
- [ ] Add `package.json` at the root with `packageManager`, `engines`, and scripts: `format`, `format:check`, `lint`, `typecheck`, `test`, `test:coverage`, `build`, `pack:cli`, and `test:e2e`.
- [ ] Add `pnpm-workspace.yaml` for `apps/*` and `packages/*`.
- [ ] Create the directories below. Keep packages minimal until their public boundary is proven.

```text
apps/cli
  src/{commands,renderers,index.ts}
  test/
packages/core
  src/{config,install,manifest,paths,registry,errors}/
  test/
packages/registry-schema
  src/
  test/
packages/official-registry
  src/items/
  test/
packages/test-kit
  src/
docs/{research,adr}/
.github/{workflows,ISSUE_TEMPLATE}/
```

- [ ] Add `tsconfig.base.json` using strict mode, `noUncheckedIndexedAccess`, declaration generation, and Node-compatible module resolution.
- [ ] Configure ESLint, Prettier, EditorConfig, Vitest, and coverage thresholds. Start with 80% line/branch coverage in `core` and 100% coverage for path-validation branches.
- [ ] Add `.nvmrc` or an equivalent documented Node version signal.

### 1.2 Policies and automation

- [ ] Add `LICENSE` (MIT or Apache-2.0; choose before public code), `README.md`, `CONTRIBUTING.md`, `CODE_OF_CONDUCT.md`, and `SECURITY.md`.
- [ ] Add CI on pull requests: frozen install, format check, lint, type-check, unit/integration test, build, package/tarball smoke test, and dependency audit with a reviewed policy for failures.
- [ ] Add release workflow but keep publishing disabled until the beta release checklist passes. Configure npm provenance/attestation if the chosen registry supports it.
- [ ] Add Dependabot or an equivalent dependency-update policy.

### Exit criteria

- [ ] A fresh clone completes every root script using a documented Node and pnpm version.
- [ ] CI runs the same core checks on the lowest supported Node version and latest LTS.
- [ ] No package imports source from another package through a relative filesystem path; use workspace package exports.

## Phase 2 — Freeze v1 contracts before command logic (week 1)

**Outcome:** validated config, registry-item, and manifest contracts with compatibility tests.

### 2.1 Schema package

- [ ] Implement Zod schemas and exported inferred types for `SnippetConfig`, `RegistryItem`, `InstalledItem`, and `Manifest`.
- [ ] Enforce: schema version is `1`; names are lowercase kebab-case; versions are SemVer; hashes are lowercase SHA-256 hex; paths are relative POSIX paths; content is nonempty; arrays have sensible size limits.
- [ ] Enforce the v1 invariant `dependencies: []` and `templateVariables: []`.
- [ ] Validate SPDX license identifiers against an allow-list or dedicated SPDX validator. Require attribution for `source: "derived"`.
- [ ] Export human-readable validation errors that include an error code and JSON path but never print entire untrusted content.
- [ ] Generate and publish JSON Schema files only if they are tested to match the Zod contract.

### 2.2 Versioned data fixtures

- [ ] Add valid fixtures: minimal item, multi-file item, browser item, Node item, original and derived license records.
- [ ] Add invalid fixtures: traversal, absolute path, Windows separator ambiguity, invalid hash, duplicate paths, unknown schema version, dependency, missing docs, malformed manifest, and corrupted JSON.
- [ ] Add compatibility fixtures that must remain readable for every released v1 manifest/config version.
- [ ] Document the canonical `snippets.json` and `.snipl/manifest.json` examples in `ARCHITECTURE.md`.

### Exit criteria

- [ ] Every malformed fixture fails with the expected stable error code.
- [ ] Valid fixtures round-trip through parse/serialize without data loss.
- [ ] A schema change requires an updated fixture and a decision record when it breaks compatibility.

## Phase 3 — Build the CLI foundation and read-only commands (week 2)

**Outcome:** users can configure a project and discover trusted built-in items without any hidden writes.

### 3.1 Shared CLI behavior

- [ ] Choose a lightweight command parser and prompt library that work in Node ESM and can be mocked in tests.
- [ ] Implement root help, subcommand help, `--version`, `--cwd`, `--verbose`, `--json`, exit-code mapping, and a top-level error boundary.
- [ ] Use exit code `0` for success, `1` for unexpected/internal failure, `2` for invalid input/configuration, `3` for user cancellation/conflict, and `4` for integrity/security failure. Document them.
- [ ] Resolve `--cwd` to a real project root before commands run. Reject inaccessible/non-directory values.
- [ ] Make JSON output deterministic: stable key ordering, no ANSI codes, no progress messages, and a documented `{ "ok": boolean, "data" | "error" }` envelope.

### 3.2 Project configuration

- [ ] Implement `init`: propose `src/snippets` only after inspecting common project layouts; allow an explicit path; show exact JSON before writing.
- [ ] If `snippets.json` exists, show a diff/summary and refuse to overwrite unless `--overwrite` is explicit.
- [ ] Validate existing config on every command and give actionable fixes for missing/invalid config.
- [ ] Test project layouts: `src/`, root-level source, monorepo package cwd, paths with spaces, no package.json, and an existing config.

### 3.3 Built-in discovery

- [ ] Implement an in-process `BuiltinRegistryResolver` that loads only schema-validated items from `@snipl/official-registry`.
- [ ] Implement `list`, `search <query>`, and `view <name>`. Search is case-insensitive across name, summary, tags, and environment.
- [ ] Define deterministic ordering: exact name match, prefix match, then relevance score, then alphabetical name.
- [ ] `view` must show source code, exports, target file names, license/provenance, environments, version, docs, and caveats.
- [ ] Return a distinct not-found error with suggestions based on edit distance; never guess and install a different item.

### Exit criteria

- [ ] All read-only commands cause zero filesystem writes outside test setup.
- [ ] Every command has human and JSON-mode snapshots, including invalid config and item-not-found cases.
- [ ] `init` creates only the config and behaves safely when rerun.

## Phase 4 — Build the safe installation engine (weeks 2–3)

**Outcome:** `add` is predictable and resistant to accidental data loss and malicious registry content.

### 4.1 Write-plan and containment layer (`packages/core`)

- [ ] Define a `WritePlan`: resolved project root, item identity, planned files, created directories, collisions, manifest action, and a textual/unified diff representation.
- [ ] Normalise item paths as POSIX values; resolve them under the configured output directory; reject absolute paths, `..`, null bytes, and paths that escape output.
- [ ] Resolve real paths for existing parents and reject symlink escapes. Never follow a symlink that directs a write outside the project/output root.
- [ ] Verify every item file’s SHA-256 before planning a write.
- [ ] Preflight _all_ target collisions before changing any file. A collision includes a file, directory, or symlink at the target path.
- [ ] Default behavior: error/report collision without writing. `--overwrite` only replaces a normal file after explicit confirmation or `--yes`; it never replaces directories or unsafe symlinks.
- [ ] `--path` is an explicit destination root, still subject to project-root containment unless a future decision changes it.

### 4.2 Transactional writer

- [ ] Write generated content to unique temporary files in each target directory with restrictive permissions.
- [ ] Flush/close files, then rename only after all temporary writes succeed. Avoid deleting original files until replacement is ready.
- [ ] Maintain an in-memory rollback journal for files replaced during one transaction. On error, restore originals where possible and report paths that could not be restored.
- [ ] Create `.snipl/` only as part of a successful installation transaction.
- [ ] Write manifest to a temporary file and atomically rename it after target source files succeed.
- [ ] Clean up temporary files on handled errors and process interruption where practical.

### 4.3 `add` UX and manifest

- [ ] Implement `add <name>` with a plan preview listing each create/overwrite/manifest operation.
- [ ] In an interactive terminal, prompt once after the full plan is displayed. In noninteractive mode, require `--yes`; otherwise exit code 3 with a clear message.
- [ ] `--dry-run` produces the complete plan and diff but writes nothing, including no manifest or directory creation.
- [ ] On success, write/update a v1 manifest with item version, registry, install timestamp, target paths, and content hashes.
- [ ] If the same item is already in the manifest, treat it as a conflict and direct users to `status`; do not silently reinstall it.
- [ ] Implement `status`: compare manifest hashes with disk and return `unchanged`, `modified`, `missing`, or `untracked` per recorded file. It never repairs files.

### Required test matrix

- [ ] Successful first install: source and manifest contents/hashes are correct.
- [ ] `--dry-run`: byte-for-byte project snapshot is unchanged.
- [ ] Existing target without `--overwrite`: no files changed.
- [ ] Existing target with `--overwrite` but declined prompt: no files changed.
- [ ] Existing target with `--overwrite --yes`: only approved target changes.
- [ ] Invalid item hash: no files changed and exit code 4.
- [ ] Traversal, absolute path, nested traversal, symlink escape, and output directory symlink: no files changed.
- [ ] Multi-file item where a later target collides: no earlier target is written.
- [ ] Simulated write/rename failure: originals remain or rollback result is accurately reported.
- [ ] Modified, missing, unchanged, and corrupt-manifest `status` results.
- [ ] Human/JSON/noninteractive behavior and exit code for each failure category.

### Exit criteria

- [ ] Tests prove a failed install cannot partially create a planned source module in normal failure paths.
- [ ] The packed CLI passes the full test matrix in JS and TS fixture projects.
- [ ] A manual security review signs off path containment and overwrite behavior.

## Phase 5 — Create the official v1 catalogue (weeks 3–4)

**Outcome:** eight modules meet a visible production-quality bar.

### Per-item checklist

- [ ] Confirm demand from Phase 0 and check existing standard-library/platform APIs before writing a helper.
- [ ] Define API contract, environment compatibility, error/cancellation behavior, performance constraints, and non-goals.
- [ ] Place source, behavior tests, type tests, README-style usage, caveats, and licence/provenance metadata in the official-registry package.
- [ ] Add tests for edge cases, invalid inputs, boundary values, repeated calls, and async timing/failure behavior as relevant.
- [ ] Compile the installed source in an isolated consumer fixture; execute the documented example unchanged.
- [ ] Verify that it has no runtime dependencies and no undeclared platform globals.
- [ ] Review it with a second reviewer using the Phase 0 scorecard.

### Suggested first catalogue (validate against discovery)

| Item         | Essential edge cases                                                               |
| ------------ | ---------------------------------------------------------------------------------- |
| `sleep`      | abort support decision, negative/large delays, timer environment                   |
| `retry`      | attempts, backoff, jitter, thrown/non-Error values, retry predicate                |
| `debounce`   | leading/trailing calls, cancel/flush, `this`, promise behavior                     |
| `throttle`   | leading/trailing semantics, cancel, timing determinism                             |
| `memoize`    | argument keying, cache invalidation, `this`, memory caveat                         |
| `deep-clone` | explicitly supported values; circular references and unsupported values documented |
| `clamp`      | min/max validation, `NaN`, infinities                                              |
| `slugify`    | Unicode policy, transliteration limitations, separator normalization               |

Do not add a module just because it is popular. For example, a `format-date` snippet may create locale/time-zone correctness risks; include it only with a precise contract and tests.

### Exit criteria

- [ ] All eight items pass schema, behavior, type, install, and documentation example tests.
- [ ] Every item’s license source is original or has recorded compatible attribution.
- [ ] Catalogue review finds no misleading “universal” environment claims.

## Phase 6 — Documentation, distribution, and release hardening (week 4)

**Outcome:** a developer can safely use and maintain the tool without internal knowledge.

### Documentation

- [ ] Replace the starter README with value proposition, supported Node versions, install/use walkthrough, safety guarantees, command table, examples, JSON mode, exit codes, and links to policy docs.
- [ ] Document config, manifest, collision/overwrite behavior, `status` meanings, uninstall instructions, and the fact that generated source remains user-owned.
- [ ] Add one page per catalogue item: contract, API, supported environments, examples, caveats, and provenance.
- [ ] Add `docs/RELEASING.md`, `docs/COMPATIBILITY.md`, `docs/SECURITY_MODEL.md`, and `docs/REGISTRY_AUTHORING.md` (the last one can say external registries are unsupported in v1).
- [ ] Use a documentation smoke test: follow the quickstart in a fresh temporary project exactly as written.

### Package quality and supply chain

- [ ] Configure each package’s `exports`, `files`, `main`/`types`, and publish access deliberately. Ensure test sources, repository secrets, and workspace-only paths are absent from tarballs.
- [ ] Run `pnpm pack` and inspect the tarball contents in CI.
- [ ] Install the packed tarball into a clean temporary directory and execute `npx`-style commands.
- [ ] Generate SBOM or publish dependency information if appropriate to the chosen distribution process.
- [ ] Pin CI actions by commit digest or follow the organization’s approved action policy.
- [ ] Enable npm two-factor authentication and scoped publishing before the first public release.

### Exit criteria

- [ ] The packed package, not a workspace link, completes the docs quickstart.
- [ ] Package contents and license notices are reviewed.
- [ ] No production command contacts the network in v1.

## Phase 7 — Private beta (weeks 5–6)

**Outcome:** real usage validates safety, wording, and catalogue usefulness.

### Tasks

- [ ] Recruit 20–30 consented beta users, ideally including five monorepo users and five Windows users.
- [ ] Publish a prerelease package (`@next`) and a short beta guide with known limitations and a security-report channel.
- [x] Test operating systems in CI: Linux, macOS, and Windows. Include spaces, Unicode, and case-sensitivity scenarios in paths.
- [x] Run compatibility fixtures: plain Node TS, Vite TS, Next.js TS, root-level source, and a package inside a pnpm workspace.
- [ ] Offer opt-in, event-only telemetry or a feedback form. Never send source code, paths, configs, command arguments containing paths, or environment variables.
- [ ] Triage feedback weekly into bugs, usability changes, catalogue requests, and non-goals. Record product decisions, not just issue comments.
- [ ] Fix every data-loss, integrity, path, license, or incorrect-documentation issue before stable release.

### Beta scorecard

- [ ] ≥4/5 usability participants complete first install in under three minutes.
- [ ] ≥30% of beta repositories install a second module within 30 days, or interviews identify a clear blocker.
- [ ] Zero confirmed unapproved overwrites, writes outside the configured project, or integrity bypasses.
- [ ] At least 80% of participants rate source preview/provenance as sufficient to use in a work project.

## Phase 8 — Stable v1 release (week 7)

**Outcome:** `@snipl/cli@1.0.0` is publicly usable and supportable.

### Release procedure

- [ ] Freeze new features; accept only release blockers, security fixes, and documentation corrections.
- [ ] Run the complete CI matrix and manual smoke tests on each supported OS.
- [ ] Verify version consistency across workspace packages, changelog entries, and schema documentation.
- [ ] Build, test, and inspect the publish tarball from a clean checkout.
- [ ] Publish release candidate; install it with npm, pnpm, yarn, and bun where supported/documented.
- [ ] Publish `1.0.0` with provenance, Git tag, signed/verified release process as available, release notes, and an upgrade note.
- [ ] Validate the public npm install from a separate clean environment after publish.
- [ ] Announce only after post-publish validation succeeds.

### Stable-release checklist

- [ ] Format, lint, type-check, unit/integration/E2E tests, and coverage are green.
- [ ] All `--dry-run`, collision, overwrite, hash, symlink, traversal, interrupted-write, JSON, and exit-code tests are green.
- [ ] Every public command has `--help` and a documented example.
- [ ] Every released item has tests, docs, hashes, and licence provenance.
- [ ] npm account security, support, security reporting, and licence information are public.
- [ ] No secrets, personal data, telemetry by default, or customer code appear in packages, logs, or fixtures.

## Post-v1 roadmap: choose by evidence, one at a time

### A. Catalogue expansion

Add modules only when search/feedback data and review capacity justify them. Maintain the same tests/provenance bar; do not turn the registry into an unreviewed snippet dump.

### B. Remote/team registries

Requires a new design and threat model: registry discovery, HTTPS-only transport, response size/time limits, cache location/expiry, content-addressed hashes, signed metadata or trusted keys, allow-lists, offline behavior, revocation, and team policy enforcement. Do not reuse the built-in resolver blindly.

### C. Update previews

Add `outdated` and `diff` first. An update must always show a diff and preserve user modifications; never auto-merge edited generated source. Treat a changed module API as a SemVer breaking change.

### D. Other languages

Each language needs an independent demand study, formatter/type-check/test integration, environment metadata, and package layout. A TypeScript registry item is not automatically a valid Python/Go/Rust item.

### E. Paid teams

Only consider after teams demonstrate a governance problem. Sell private registry hosting, policy, auditability, and support—not access to basic utilities that should remain source-owned.

## Risk register

| Risk                   | Early warning                                         | Mitigation                                                 | Owner before release |
| ---------------------- | ----------------------------------------------------- | ---------------------------------------------------------- | -------------------- |
| Weak differentiation   | Users compare it only to copying from a website       | Validate provenance/preview/team pain; refine positioning  | Product              |
| Data loss              | Collision or interruption bug                         | Preflight + transaction tests + beta safety gate           | Core                 |
| Malicious content      | Future registry item contains traversal/hash mismatch | Strict schema/integrity boundary; remote registry deferred | Security             |
| Low module trust       | Users ask “who wrote this?”                           | Provenance, tests, caveats, second review                  | Registry             |
| Catalogue bloat        | More requests than review capacity                    | Enforce quality scorecard and narrow scope                 | Product/Registry     |
| Supply-chain incident  | Unexpected tarball/CI dependency content              | Tarball inspection, minimal deps, protected publishing     | Release              |
| Cross-platform failure | Windows/macOS beta failures                           | OS matrix, path/case/Unicode test fixtures                 | CLI                  |

## Definition of done for any implementation task

- [ ] Behavior and error conditions are specified before coding.
- [ ] Tests cover the success path and the relevant failure/rollback path.
- [ ] Human and JSON output remain correct where the CLI is involved.
- [ ] Documentation and schemas are updated when user-visible behavior changes.
- [ ] Formatting, linting, type-checking, relevant tests, and a packed CLI smoke test pass.
- [ ] The change does not weaken ownership, integrity, or overwrite guarantees.
