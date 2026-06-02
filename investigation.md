# Markdown list rendering investigation

Investigation into a bug where stored markdown renders as **two separate `<ul>`s** with
**inconsistent `<li>` content** (some items wrapped in `<p>`, some not). This document
captures the architecture, the empirical tests, the root cause, and the fix options.

> **TL;DR** — The rendering code is **not** buggy. It faithfully renders markdown that
> is _correct per the CommonMark spec_. The inconsistency is baked into the **stored
> markdown** by the editor's **save path** (`HTMLToMarkdown` → `remark-stringify`):
> (1) `remark-stringify` alternates the bullet marker between adjacent lists (`*` then
> `-`), and (2) tiptap wraps every `<li>` in a `<p>`, which makes serialized lists
> "loose". On render, CommonMark then (1) splits on the marker change into two `<ul>`s
> and (2) wraps loose-list items in `<p>`.

---

## 1. The bug report

### Input markdown (abbreviated)

```markdown
<br>

Team / mensen:

* Nieuwe mensen: <strong>Marco Herben</strong> is bij het opschalingstickets team begonnen...

- Op 26 mei hebben we een mooie <strong>Digicampus heidag</strong> gepland...

- Een speciaal bedankje aan Monique...

- We hadden met Jet en Monique een goed gesprek...

Kantoordag 12 mei:
```

Note the two distinguishing traits of the source:

- The **first list item uses `*`**, the rest use `-`.
- The `-` items are **separated by blank lines**.

### Rendered HTML (the symptom)

- `Team / mensen:` → a `<p>`
- **First `<ul>`**: one `<li>` (the `*` item), **bare text, no `<p>`**
- **Second `<ul>`**: three `<li>`s (the `-` items), **each wrapped in `<p>`**
- `Kantoordag 12 mei:` → a `<p>`

The two complaints:

1. How did the markdown end up with **mixed `*`/`-` list markers**? (MS Word paste? other causes?)
2. Why do different markers produce **two `<ul>`s**, and why does one list get `<p>` inside `<li>` and the other not?

---

## 2. Architecture

The MUI markdown editor (ignore `src/crd/**` and `src/main/crdPages/**` — different stack).

### Relevant files

| File | Role |
|------|------|
| `src/core/ui/forms/MarkdownInput/hooks/useMarkdownEditor.ts` | Wires tiptap to the converter. On edit: `editor.getHTML()` → `HTMLToMarkdown()` → emits markdown via `onChange`. On load: `value` (markdown) → `markdownToHTML()` → tiptap `content`. |
| `src/core/ui/forms/MarkdownInput/hooks/useEditorConfig.ts` | tiptap config. Uses `@tiptap/starter-kit`, whose `listItem` wraps each item's content in a `<p>`. |
| `src/core/ui/markdown/html/UnifiedConverter.ts` | The two unified pipelines: `markdownToHTML` (MD→HTML, render-into-editor) and `HTMLToMarkdown` (HTML→MD, **save**). |
| `src/core/ui/markdown/WrapperMarkdown.tsx` | The **display** renderer. `react-markdown` + `remark-gfm` + `rehype-raw`. Maps `ul`/`ol`/`li`/`p` to MUI components (`src/core/ui/markdown/components/`). |

### Data flow

```
                          ┌─────────────────────── EDIT ───────────────────────┐
                          │                                                     │
  tiptap editor ──getHTML──▶ HTMLToMarkdown (rehype-parse → rehype-remark       │
                          │                  → remark-gfm → remark-stringify)   │
                          │                            │                        │
                          │                            ▼                        │
                          │                     stored markdown  ◀──────────────┘
                          │                            │
   ┌── LOAD INTO EDITOR ──┘                            │
   │                                                   │
   markdownToHTML (remark-parse → remark-gfm           │
     → remark-rehype → rehype-sanitize → stringify)    │
                                                       ▼
                                              DISPLAY (WrapperMarkdown):
                                              react-markdown + remark-gfm
                                                      → HTML
```

Both the display path (`WrapperMarkdown`) and the editor-load path (`markdownToHTML`)
use **remark-gfm**, so both interpret the stored markdown with the same CommonMark rules.

---

## 3. The rendering is correct CommonMark (proof)

Running the bug's markdown through the same `remark-parse → remark-gfm → remark-rehype`
pipeline `WrapperMarkdown` uses (no custom code involved) reproduces the exact reported
HTML, and the mdast shows _why_:

```
list ordered=false spread=false items=1   ← the *  list  → TIGHT  → no <p>
list ordered=false spread=true  items=3   ← the -  list  → LOOSE  → <p> in each <li>
```

Two independent, spec-mandated rules fire:

### Rule 1 — marker change starts a new list → two `<ul>`s

CommonMark starts a **new list** whenever the bullet marker changes (`*` → `-`).
So `* …` followed by `- …` is, by definition, two separate lists. This is not a choice
made by our code.

### Rule 2 — tight vs. loose lists → the `<p>` difference

A list is **loose** (each item's content wrapped in `<p>`) **iff there is a blank line
_between two of its items_** (or between block children inside one item). Otherwise it's
**tight** (bare content in `<li>`).

- The `*` list has **one item** → no "between items" gap is possible → **tight** → no `<p>`.
- The `-` list has **three items separated by blank lines** → **loose** → `<p>` in each `<li>`.

---

## 4. The "is it the item count?" theory — tested and refined

Hypothesis under test: _"the `<p>` only appears depending on how many `<li>`s a list has;
a 1-item list yields a `<li>` without a `<p>`."_

### Test cases

| Case | Markdown | Blank lines between items? |
|------|----------|----------------------------|
| **A** | `- aaaa1` / `- aaaa2` / `* bbbb1` / `* bbbb2` (consecutive) | No |
| **B** | `- aaaa1` / `* bbbb1` / `* bbbb2` (consecutive) | No |
| **C** | `- aaaa1` ⏎⏎ `* bbbb1` ⏎⏎ `* bbbb2` | Yes |
| **D** | `- aaaa1` ⏎⏎ `- aaaa2` ⏎⏎ `* bbbb1` ⏎⏎ `* bbbb2` | Yes |

### Results

```
========== A) two items + two items (NO blank lines) ==========
mdast lists -> items=2 spread=false  |  items=2 spread=false
<ul>
<li>aaaa1</li>
<li>aaaa2</li>
</ul>
<ul>
<li>bbbb1</li>
<li>bbbb2</li>
</ul>

========== B) one item + two items (NO blank lines) ==========
mdast lists -> items=1 spread=false  |  items=2 spread=false
<ul>
<li>aaaa1</li>
</ul>
<ul>
<li>bbbb1</li>
<li>bbbb2</li>
</ul>

========== C) one item + two items (BLANK lines between) ==========
mdast lists -> items=1 spread=false  |  items=2 spread=true
<ul>
<li>aaaa1</li>
</ul>
<ul>
<li>
<p>bbbb1</p>
</li>
<li>
<p>bbbb2</p>
</li>
</ul>

========== D) two items + two items (BLANK lines between) ==========
mdast lists -> items=2 spread=true  |  items=2 spread=true
<ul>
<li>
<p>aaaa1</p>
</li>
<li>
<p>aaaa2</p>
</li>
</ul>
<ul>
<li>
<p>bbbb1</p>
</li>
<li>
<p>bbbb2</p>
</li>
</ul>
```

### Verdict

The driver is **blank lines between items**, *not* the item count directly:

- **A vs B** are identical in `<p>` behaviour (both tight, no `<p>`) — the 1-vs-2 item
  count alone changes nothing.
- The item count matters **only as a proxy**: a 0- or 1-item list has no "between items"
  gap, so it can _never_ be loose → always tight → bare `<li>` (see case C's single dash item).

**Final rule:**

| Items | Blank line between items? | Result |
|-------|---------------------------|--------|
| 0–1   | (impossible)              | **tight** → bare `<li>` |
| 2+    | No                        | **tight** → bare `<li>` |
| 2+    | Yes                       | **loose** → `<p>` in each `<li>` |

This exactly matches the original bug: the `*` list (1 item) was tight; the `-` list
(3 items, blank-line separated) was loose.

---

## 5. Root cause — the save path produces this markdown

The inconsistency is **written by the editor**, in `HTMLToMarkdown`
(`UnifiedConverter.ts`, the `constructHtmlToMarkdownPipeline` ending in
`.use(remarkStringify)` with **no options**). Two `remark-stringify` behaviours combine:

### Defect 1 — bullet marker alternation (`*` then `-`) → the two-`<ul>` split

When the tiptap document contains **two adjacent bullet lists** (two `<ul>` elements),
`remark-stringify` deliberately renders the second list with a **different marker** so
the two don't merge back into one on re-parse. Default `bullet: '*'`, fallback
`bulletOther: '-'`.

Reproduction (two adjacent `<ul>` from tiptap → MD):

```
<ul><li><p>only star item</p></li></ul><ul><li><p>dash 1</p></li><li><p>dash 2</p></li></ul>
   ↓ HTMLToMarkdown
"* only star item\n\n- dash 1\n\n- dash 2\n"
```

That is the exact `*`-then-`-` pattern seen in the reported content. It is a
**safety feature** of remark-stringify, not a glitch — but it then triggers Rule 1 on
render (split into two `<ul>`s).

### Defect 2 — tiptap `<li><p>` makes every saved list "loose" → the `<p>` wrapping

`@tiptap/starter-kit`'s `listItem` wraps each item's content in a `<p>`. When
`rehype-remark` converts `<li><p>…</p></li>`, it marks the list `spread: true`, and
`remark-stringify` then emits **blank lines between items**. So lists round-tripped
through the editor come back as **loose** markdown.

Reproduction (single clean tiptap list → MD):

```
<ul><li><p>item 1</p></li><li><p>item 2</p></li><li><p>item 3</p></li></ul>
   ↓ HTMLToMarkdown
"* item 1\n\n* item 2\n\n* item 3\n"   ← blank lines between every item = LOOSE
```

### Why blank lines (newlines) matter so much here

This is the crux. In **HTML** newlines are insignificant; in **Markdown** a blank line
between list items flips a list from tight to loose, which changes whether each item is
wrapped in `<p>`. The whole `UnifiedConverter` exists to reconcile these two worlds
(see its header comment about `<br>` ⇄ empty `<p>` handling). For lists specifically:

- tiptap `<li>` always contains a block `<p>` →
- `rehype-remark` sets the list `spread: true` →
- `remark-stringify` writes blank lines between items →
- on render, those blank lines make the list **loose** →
- each `<li>` is wrapped in `<p>`.

A single-item list escapes this only because "loose" requires a gap _between_ items,
and there is no second item.

---

## 6. How the mixed markers happen in practice (reproducing Defect 1)

Defect 1 requires **two adjacent bullet lists in the editor**. That arises from:

1. **MS Word / Outlook / Google Docs paste** (most likely here). Their list HTML
   (`mso-list` paragraph runs) frequently lands in tiptap as several fragmented `<ul>`
   blocks rather than one — especially when a non-list line sat between bullets in the
   source.
2. **Manual editing**: create a list, press Enter twice to exit it, type a normal line,
   then start a new list → two `<ul>`s.
3. **Re-saving already-split content**: open content that already had two lists and save
   again → the marker alternation persists.

**Deterministic repro:** paste a Word doc whose bullets are interrupted by a paragraph,
or hand-build tiptap HTML with two `<ul>`s and save — the `*`/`-` split appears every time.

---

## 7. Fix options

The bug lives in the **save path** (`UnifiedConverter.ts`), but the goal determines where
to fix. These are genuinely different behaviours:

### Option A — fix the save path (root cause, new content only)

Normalize inside `HTMLToMarkdown` so the editor stops writing inconsistent markdown:

- **Force tight lists** (kills Defect 2 / the `<p>` wrapping): normalize the mdast before
  stringify so `list.spread = false` and `listItem.spread = false` for items whose only
  child is a single paragraph. (A small custom unified plugin between `rehype-remark` and
  `remark-stringify`, or an `unist-util-visit` pass.)
- **Single, consistent bullet marker / merge adjacent lists** (addresses Defect 1):
  optionally merge adjacent same-type lists in the mdast so they don't get the
  alternating marker. Note the marker alternation is a _correctness_ feature — only safe
  to override once adjacent lists are merged.

✅ Clean root-cause fix. ❌ Does **not** repair content already stored in the DB.

### Option B — fix the render path (cosmetic, existing + new content)

Normalize at display time in `markdownToHTML` / `WrapperMarkdown` (e.g. a remark plugin
that forces `spread:false` and optionally merges adjacent lists before
`remark-rehype`).

✅ Fixes **existing** stored content immediately, plus new content. ❌ Cosmetic only —
the bad markdown remains in the DB; merging adjacent `*`/`-` lists into one `<ul>` is
slightly non-standard (changes CommonMark semantics for display).

### Option C — both A + B

Stop producing bad markdown going forward (A) **and** make all existing content render
cleanly (B). Most thorough; touches both pipelines.

### Decision factors

- **Where does the content come from?** Mostly pasted (Word/Docs) → save-path fix has
  limited reach for existing data; render-path fix helps everyone now.
- **Does already-stored content need to look right?** If yes → B (or C).
- **What is "correct"?** Should `* …` then `- …` become **one** `<ul>` (visual intent) or
  stay **two** (CommonMark-strict)? And is the `<p>`-in-`<li>` itself a problem, or only
  the visual inconsistency?
- **Risk:** render-only is low-risk/cosmetic; touching the save serializer changes what's
  written to the DB and round-trips through the editor — higher stakes.

---

## 8. Appendix — repro script

`_repro_md.mjs` (project root, throwaway) reproduces all of the above using the repo's
own `unified`/`remark`/`rehype` dependencies. Run from the project root so `node_modules`
resolves:

```bash
node _repro_md.mjs
```

It renders cases A–D from §4 and prints both the mdast `spread` flags and the resulting
HTML. (Not in a linted/committed folder, but shows up as untracked in `git status` —
delete when done.)



which way of fixing it you think it's the best, I don't care about stored data in the DB, just want newly saved texts to be good, even if just reopened and saved

● Clear answer: Option A — fix the save path (HTMLToMarkdown in UnifiedConverter.ts). That's exactly the right tool for "new saves should be good, and reopening + saving old content fixes it too" —
  because reopening runs the content back through tiptap and re-serializes on save.

  But Option A only fully works if it does both normalizations, and there's a subtlety worth verifying: when you reopen the bad content, markdownToHTML turns * … / - … back into two adjacent <ul>s,
  tiptap keeps them as two lists, and on save remark-stringify would alternate the markers again. So just forcing tight lists isn't enough — I also need to merge adjacent lists. Let me verify the
  combined fix actually produces clean output before recommending it.


   Recommendation: Option A, in the save path, with both normalizations

  A small mdast-transformer plugin inserted into the HTMLToMarkdown pipeline. It does two things:

  1. Merge consecutive same-type lists → kills the */- alternation (and the two-<ul> split). Only merges directly adjacent lists; anything with content between them stays separate (sanity test
  confirms).
  2. Force spread = false on all lists/items → kills the loose-list <p> wrapping. Safe because tiptap can't even express a loose-vs-tight distinction — every editor list should be tight.

  This nails your requirement: new saves are clean, and old content gets fixed the moment it's reopened and saved (reopen → tiptap → re-serialize through the plugin).
