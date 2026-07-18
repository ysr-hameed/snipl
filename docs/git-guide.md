# Git & GitHub Guide — Open Source Contribution Best Practices

> Ye guide un developers ke liye hai jo open source contribution me naye hain aur proper Git/GitHub workflow seekhna chahte hain.

## 1. Conventional Commits

Har commit ka ek **type** hota hai jo batata hai ke us commit me kya change hai:

```
type(scope): description

<body>
```

### Types

| Type | Kab use karein | Example |
|------|----------------|---------|
| `feat` | New feature | `feat(cli): add init command` |
| `fix` | Bug fix | `fix(core): resolve path traversal check` |
| `docs` | Documentation | `docs: add git contribution guide` |
| `chore` | Maintenance | `chore: update dependencies` |
| `refactor` | Code change (no feature/fix) | `refactor(core): extract write-plan logic` |
| `test` | Tests | `test(schema): add invalid fixture tests` |
| `style` | Formatting only | `style: run prettier` |

### Examples

```
feat(cli): implement search command with fuzzy matching

Search supports case-insensitive matching across name, summary,
tags, and environment fields. Results sorted by relevance.
```

```
fix(core): prevent symlink escape in path resolution

Checks realpath of parent directories before writing. Adds
test coverage for nested symlink attacks.
```

```
docs: add git contribution guide
```

## 2. Branch Strategy

```
main          ← stable, production-ready
  └─ feat/    ← new features (feat/add-command, feat/search)
  └─ fix/     ← bug fixes (fix/path-traversal)
  └─ docs/    ← documentation (docs/git-guide)
  └─ chore/   ← maintenance (chore/update-deps)
```

### Rules

- Kabhi bhi `main` me direct commit nahi karna
- Har change ke liye alag branch banao
- Branch name lowercase, hyphen-separated
- PR ke through merge karo, direct push nahi

## 3. Commit Workflow (Daily Use)

```bash
# 1. Check status
git status

# 2. Stage specific files (not everything blindly)
git add packages/core/src/path/resolver.ts
git add packages/core/test/path/resolver.test.ts

# 3. Commit with conventional message
git commit -m "feat(core): implement path containment resolver

Rejects absolute paths, .. traversal, symlink escapes.
Adds unit tests for all containment rules."

# 4. Push to your branch
git push origin feat/path-resolver
```

**❌ Galti:** `git add .` hamesha use karna
**✅ Sahi:** Sirf relevant files stage karo

## 4. Writing Good Commit Messages

### Structure

```
type(scope): short summary (50 chars max)

Optional detailed body (72 chars per line)
- Explain WHY the change was made
- Explain WHAT changed if not obvious
- Mention any breaking changes
```

### Real Examples

```
chore: initialize pnpm workspace with 5 packages

Set up monorepo structure with apps/cli, packages/core,
packages/registry-schema, packages/official-registry,
and packages/test-kit. Add shared tsconfig, eslint,
prettier, and vitest configuration.
```

```
feat(schema): implement RegistryItem Zod schema

Enforces schema version 1, kebab-case names, semver,
SHA-256 hashes, and empty dependencies invariant.
Exports inferred types and human-readable validation errors.
```

## 5. Pull Request Workflow

### Creating a PR

```bash
# 1. Create branch from main
git checkout main
git pull
git checkout -b feat/my-feature

# 2. Make changes and commit
git add <files>
git commit -m "feat(scope): description"

# 3. Push branch
git push origin feat/my-feature

# 4. Create PR (via GitHub CLI)
gh pr create \
  --title "feat(scope): description" \
  --body "## Changes\n\n- List of changes\n- With details\n\nCloses #123"
```

### PR Guidelines

- **Small PRs:** Ek PR me ek hi feature/fix rakhein
- **Descriptive title:** Conventional commit style
- **Description me batao:** Kya change kiya, kyun kiya, kaise test kiya
- **Review requests:** Relevant maintainers ko assign karo

## 6. Keeping Your Fork Updated

```bash
# Add upstream remote (once)
git remote add upstream https://github.com/original/repo.git

# Sync main branch
git checkout main
git pull upstream main
git push origin main

# Rebase your feature branch
git checkout feat/my-feature
git rebase main
# Resolve conflicts if any
git push origin feat/my-feature --force-with-lease
```

## 7. Code Review Etiquette

### As a contributor (review maang rahe ho)

- Small, focused PRs rakho
- Changes ko explain karo PR description me
- Feedback ko politely address karo
- Merge karne se pehle CI pass hone do

### As a reviewer (review de rahe ho)

- Respectful raho, code pe attack nahi
- "Iss tarah kyun nahi kiya?" ke bajaye "Iss approach ke baare me kya khayal?"
- Specific suggestions do
- Approve karo jab sab resolve ho jaye

## 8. Common Git Commands Reference

```bash
git status                    # Current state dekho
git log --oneline -10         # Recent 10 commits
git diff                      # Unstaged changes
git diff --staged             # Staged changes
git add -p                    # Interactive staging (per hunk)
git commit --amend            # Last commit edit karo (push nahi kiya to)
git rebase -i HEAD~3          # Last 3 commits squash/karo
git stash                     # Changes temporarily save karo
git stash pop                 # Stashed changes wapas lao
git reset HEAD~1              # Last commit undo (local hi karo)
git revert <commit-hash>      # Safe undo (shared branches pe)
```

## 9. This Project's Commit Convention

Iss repository ke liye specific rules:

1. **Type must be one of:** `feat`, `fix`, `docs`, `chore`, `refactor`, `test`, `style`
2. **Scope** is the package/area: `cli`, `core`, `schema`, `registry`, `root`, `docs`
3. **Body** is optional but recommended for non-trivial changes
4. **Breaking changes** add `!` after type: `feat!(schema): change manifest format`

### Example workflow:

```bash
git checkout -b feat/init-command
# ... code changes ...
git add apps/cli/src/commands/init.ts
git commit -m "feat(cli): implement init command"
git push origin feat/init-command
gh pr create --title "feat(cli): implement init command" --body "..." 
```

## 10. Merge vs Rebase

| Situation | Use |
|-----------|-----|
| Public branch (shared with team) | **Merge** — history preserve hoti hai |
| Personal feature branch | **Rebase** — clean linear history |
| PR with conflicts | **Rebase** on main, resolve conflicts |
| You want to preserve context | **Merge commit** — batata hai "ye PR merge hua" |

> **Suggestion:** Iss project ke liye **squash merge** use karo PRs me — ek feature ek commit.

## Resources

- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://docs.github.com/en/get-started/using-github/github-flow)
- [How to Write a Git Commit Message](https://cbea.ms/git-commit/)
