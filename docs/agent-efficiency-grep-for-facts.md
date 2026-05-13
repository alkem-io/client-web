# Working Faster with AI Agents: Grep for Facts, Read for Code

A short rule that cut a recent bug-fix in client-web from ~10 minutes to ~3 — and that applies to any human or AI pair-programmer working in a large codebase.

## The Rule

> **Use `grep` when you need a fact. Use `Read`/open-the-file when you need to write similar code.**

If the question can be answered with "yes / no" or "where", grep. If you need to *understand* the code well enough to modify or mirror it, then read.

## Why This Matters in client-web

This repo has structural traits that make full-file reads expensive:

- ~18k modules, files commonly **400–700 lines**, with large generated GraphQL files (`apollo-hooks.ts` is 500KB+).
- Migration in flight: MUI design system in `src/domain/*` and `src/core/ui/`, CRD design system in `src/crd/` + `src/main/crdPages/`. The same concept often lives in **two parallel trees**.
- Ambient React context providers (auth, storage, theme, i18n) are mounted at **shell layouts**, far from the components that consume them. The relevant question is rarely "what's in this dialog" — it's "what's wrapped above it."

Every full read fills working memory (yours, or an LLM's context window) with code that doesn't move the task forward. The bigger the file, the more tempting it is to read in full *and* the less useful it actually is.

## Symptoms — You're About to Waste Time If…

- You catch yourself thinking *"let me read this file to understand the context"* — that usually means you haven't formulated a specific question yet.
- You open a 600-line file to confirm one fact.
- You read three sibling files when one grep across all three would do.
- You're "checking how MUI does it" and have already opened the full MUI file before identifying which line you care about.

## The Pattern: Formulate, Grep, Then (Maybe) Read

1. **Formulate** a *specific* question. Not "what does this do?" — but "does this file import X?" or "where is provider Y mounted?"
2. **Grep** for the answer. One grep with `\|` alternation or `-E "p1|p2|p3"` is better than three sequential greps.
3. **Read** only if grep tells you "yes, in this 5-line block — and now I need to edit/mirror it."

## Cookbook — Recurring Questions in client-web

| Question | Don't | Do |
|---|---|---|
| Does file A import symbol Y? | Read A | `grep "from.*Y" A` |
| Where is Y declared / mounted / used? | Read suspected file | `grep -rln Y src` |
| What props does component Z accept? | Read Z's full file | `grep -A 20 "type ZProps" Z.tsx` |
| Does shell A mount provider B? | Read A's full layout | `grep -n B src/.../A.tsx` |
| Which CRD page is the twin of MUI page X? | Read CRD route tree | `grep -rln "Crd<X-name>" src/main/crdPages` |
| Which GraphQL query returns field F? | Read schema | `grep -rln "F\b" src/**/*.graphql` |
| What location types does Storage support? | Read `useStorageConfig.tsx` (226L) | `grep "locationType:" useStorageConfig.tsx` |
| Does the dev server need a backend? | Read README / CLAUDE.md | `grep -i "backend\|localhost:3000" CLAUDE.md` |

## Batch Your Greps

Sequential greps round-trip through tool/permission overhead. Combine them:

```bash
# Three sequential greps — slow:
grep -rln StorageConfigContextProvider src
grep -rln useMarkdownEditorIntegration src
grep -rln "locationType=" src

# One alternation — fast:
grep -rln -E "StorageConfigContextProvider|useMarkdownEditorIntegration|locationType=" src
```

For AI agents this matters even more — each tool call has prompt-tax overhead.

## Verification-Before-Deletion

Before deleting a "defensive" code path (optional context variants, fallback branches, "just in case" guards), run a verification grep pass:

1. Where is the **strict** version used?
2. Where do those callers render?
3. Do **all** the containing shells satisfy the strict version's preconditions?

Skipping step 3 is how you ship a fix that immediately breaks a sibling page that turned out to never mount the required provider. Five greps in 30 seconds prevent that round-trip.

## When Full Read *Is* Right

Don't over-correct. Read the whole file when:

- You're about to **edit** it and need full context to avoid breaking adjacent code.
- You're **writing a new file that mirrors its structure** (e.g., porting an MUI page to CRD).
- It's **≤ ~200 lines** and you need **≥ 3 separate facts** from it (cheaper than grepping 3 times).
- It's a **single source of truth** like a config, schema, or type-definitions file you'll reference repeatedly in the task.

## TL;DR for Your AI Pair-Programmer

If you're prompting an AI agent (Claude, Cursor, Copilot, etc.) on this repo, include something like this in your project rules / `CLAUDE.md` / `.cursorrules`:

> When the question is binary (does X have Y? where is Y mounted? what props does Z accept?), use grep — never full Read. Reserve Read for files you're about to edit or whose structure you're mirroring. Batch greps with `\|` alternation. Before deleting defensive code paths, grep-verify that every caller satisfies the strict path's preconditions.

This single rule, applied consistently, can cut investigation time **2–4×** on a repo this size.

## Worked Example: Diagnosing an Ambient-Context Bug

Suppose a strict context hook throws "No XxxContext provided" on one page but not its siblings. The investigation collapses to four greps:

```bash
# 1. Where is the strict hook used?
grep -rln useXxxContext src

# 2. Who calls those callers? (climb until you find page-shell layouts)
grep -rln <consumer-name> src

# 3. Which shells render those callers? Trace the route tree once.

# 4. Do all those shells mount the matching provider?
grep -rln XxxContextProvider src/main/crdPages/*/layout
#   → "shell A: yes. shell B: yes. shell C: NO."  ← the gap.
```

**The slow alternative**: open the failing dialog file, read it in full, follow imports into the integration hook, read that, read its dependencies, finally derive that the missing provider must be at the shell level. Twenty minutes of reading reaches the same conclusion four greps would have produced in two.

The greps work because the question is *locational* ("which file is missing X"), not *behavioral* ("how does X work"). Full reads serve behavioral questions. Don't use them for locational ones.
