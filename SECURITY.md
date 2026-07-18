# Security Policy

## Reporting a Vulnerability

Snippet CLI treats file safety and integrity as a core guarantee. If you discover a security vulnerability, please report it privately.

**Do not report security vulnerabilities through public GitHub issues.**

Instead, email the maintainers at (contact to be established) or open a draft security advisory on GitHub.

## What to expect

You will receive a response within 72 hours acknowledging the report. After the initial reply, we will keep you informed of the progress toward a fix and release.

## Scope

The following are in scope:

- Unauthorized file writes outside the configured output directory
- Symlink escape or path traversal via registry item content
- Silent overwrite of user files without confirmation
- Integrity bypass (hash validation failures)
- Remote registry injection (when remote registries are added in future)

## Out of scope (MVP)

- Denial of service via large registry items (deferred — no remote registries in v1)
- Telemetry or privacy issues (opt-in only, never sending source code)
