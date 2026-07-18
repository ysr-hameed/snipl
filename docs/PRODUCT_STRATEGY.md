# Product Strategy

## The product to build

**Snippet CLI is a trusted, source-first registry for production utility modules.** A developer selects a capability, previews the exact files and changes, then installs editable code into their repository.

Initial experience:

```sh
npx @snipl/cli init
npx @snipl/cli search retry
npx @snipl/cli add retry --dry-run
npx @snipl/cli add retry
```

The generated module belongs to the developer. The CLI records what was installed so it can report drift and offer a safe update preview; it never takes ownership of the file back.

## The real customer problem

Developers do not merely lack snippets. They lack confidence in copied code:

- It is unclear whether code handles edge cases, types, cancellation, errors, or environment differences.
- The source, license, and maintenance status are often unknown.
- Similar utilities diverge across repositories and teams.
- A package is sometimes excessive for a 20-line function, but manual copy/paste is slow and unreviewable.

## Primary customer and first use case

Start with TypeScript application teams who repeatedly write small platform-neutral utilities and value code ownership. Their job is to add a well-tested helper quickly without adding a production dependency.

The narrow MVP category is **async and data utilities**: `sleep`, `retry`, `debounce`, `throttle`, `memoize`, `deep-clone`, `clamp`, and `slugify`. This is enough to prove the installation workflow and quality bar. Do not launch with “100+ snippets”; breadth without verification hurts trust.

## Positioning

Do not position this as “shadcn for snippets” alone. Tools such as shadcn’s registry CLI and jsrepo already demonstrate source-copy registry workflows. The differentiator must be the trust and maintenance layer:

> Verified, dependency-transparent source modules you can own—installed with provenance, tests, and safe update previews.

The copy-to-project experience is inspired by shadcn, not unique to the product. The durable value is a curated quality bar, accurate metadata, team registries, and safe lifecycle tooling.

## Product principles

1. **Ownership over lock-in.** Installed source remains editable and works if the CLI disappears.
2. **Trust before volume.** Every official module has contract tests, a source review, license metadata, and documented trade-offs.
3. **Explicit effects.** Show every file write, dependency, configuration change, and template input before applying.
4. **Portable by default.** Core modules target modern Node/browser TypeScript only when their environment requirement is explicitly declared.
5. **Local-first.** Built-ins and project configuration work offline; remote registries are optional.

## What not to build yet

- AI-generated snippets or unreviewed community submissions.
- Gist/cloud sync and user accounts.
- Python, Go, Rust, and other language support.
- “Pro” paywalls before the free workflow has repeatable adoption.
- Automatic upstream updates or automatic merges of edited generated files.

## Success measures and validation gates

The riskiest assumption is that developers prefer copying a maintained source module over a tiny package or their own utility. Validate before expanding:

| Gate               | Evidence required                                                                             | Decision                                      |
| ------------------ | --------------------------------------------------------------------------------------------- | --------------------------------------------- |
| Problem validation | 12 interviews with target developers; 8 describe repeated utility-copying and show an example | Continue or change target problem             |
| Usability          | 5 developers install a module in a clean TS repo without help; 4 succeed in under 3 minutes   | Simplify onboarding if missed                 |
| Quality trust      | 10 pilot users rate provenance/tests/preview as sufficient to use in a work project           | Improve registry quality bar if missed        |
| Retention signal   | 30% of pilot repos install a second module within 30 days                                     | Invest in catalogue/team registry only if met |

Track privacy-preserving, opt-in events only: `init_completed`, `search_performed`, `dry_run`, `add_completed`, `add_cancelled`, and error category. Never upload project paths, source code, names, or environment variables.

## Monetization direction

Keep the CLI and official core registry open source. Do not sell individual snippets. If the validated team pain appears, sell governance: private registries, organization approval policies, usage audit exports, and support. This makes the business model compatible with local source ownership.

## Honest market note

The registry-install model has established competitors and adjacent tools, including shadcn’s CLI and jsrepo. The opportunity is not that nobody can copy files; it is delivering production-quality utility modules with better safety, provenance, and team governance. The market-size estimate in `idea.md` is a hypothesis, not a validated forecast.
