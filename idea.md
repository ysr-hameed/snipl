# Snippet CLI — Idea Document

## What is it?

A **shadcn-style CLI** that adds code snippets directly into your project as **source code** (no dependencies, fully customizable).

```bash
npx snipl add debounce         # → src/snippets/debounce.ts
npx snipl add format-date      # → src/snippets/format-date.ts
npx snipl add throttle
npx snipl add deep-clone
npx snipl add sleep
npx snipl add retry
npx snipl add memoize
```

---

## shadcn Vibe — Same Philosophy

| shadcn/ui                    | snipl                        |
| ---------------------------- | ---------------------------- |
| `shadcn add button`          | `snippet add debounce`       |
| → `components/ui/button.tsx` | → `src/snippets/debounce.ts` |
| Source copy, no dependency   | Source copy, no dependency   |
| Fully editable               | Fully editable               |

---

## Problem Solved

Har developer roz **copy-paste** karta hai:

- StackOverflow se utility functions
- GitHub se common patterns
- Purane projects se apne likhe snippets

**Time waste** + **inconsistent code** + **no versioning**.

---

## Features

| Feature             | How                                                                    |
| ------------------- | ---------------------------------------------------------------------- |
| **Source copy**     | shadcn jaisa — tumhare project mein copy hota hai, tumhara ho jata hai |
| **No dependency**   | koi npm package install nahi hota                                      |
| **Customizable**    | add karne ke baad freely edit kar sakte ho                             |
| **Language expand** | pehle JS/TS, baad mein Python, Go, Rust                                |
| **Search**          | `snippet search debounce` — saved snippets dhoondo                     |
| **List**            | `snippet list` — sab dikhao                                            |
| **Sync**            | GitHub gist ya cloud pe backup                                         |
| **Template vars**   | `snippet add logger --name myapp` — customized code                    |

---

## Snippets Included (Planned 100+)

### Utility (Most Used)

debounce, throttle, sleep, retry, memoize, once, pipe, compose, deep-clone, deep-merge, shallow-equal

### Formatting

format-date, format-currency, format-number, format-file-size, truncate, slugify, capitalize, pluralize

### Async

async-queue, promise-all-settled, timeout, with-retry, race-with-timeout, p-map, p-filter

### Web

get-cookie, set-cookie, get-params, is-mobile, copy-to-clipboard, detect-os, detect-browser

### Type Checking

is-object, is-array, is-empty, is-email, is-url, is-phone, type-of

### Math

clamp, random-int, random-id, random-color, sum, average, round-to

---

## Community Size Estimate

~5M+ developers. Har language ke developer use kar sakte hain.

---

## Monetization Model

| Tier     | What                                               |
| -------- | -------------------------------------------------- |
| **Free** | Core CLI, 100+ snippets                            |
| **Pro**  | Premium snippet packs (database, auth, deployment) |
| **Team** | Team shared snippets, private registry             |

---

## Why This Will Work

1. **Universal use case** — har developer har roz snippets use karta hai
2. **shadcn ki copy-paste philosophy** — proven pattern, but **unused domain** me
3. **No existing competitor** — koi nahi bana raha (shadcn sirf UI ke liye hai)
4. **Plugin ecosystem potential** — community apne snippets contribute kar sake

---

## Implementation Stack

- **CLI:** Node.js (commander / yargs)
- **Templates:** Local JS/TS files ya GitHub registry
- **Distribution:** npx / npm package
- **Binary (optional):** pkg for compiled version if IP protection needed

---

## Source Visible Ya Hidden?

**Recommendation:** Source visible rakho, license daalo (MIT / custom).

Reason:

- Koi realistically copy karke apna nahi banaega (shadcn ka code bhi public hai)
- Visible source = faster adoption, trust, contributions
- Real moat **brand + ecosystem + registry** mein hai, IP mein nahi

---

## One-Liner Pitch

> _shadcn for code snippets — copy nahi, CLI se add karo, customize karo, dependency zero._
