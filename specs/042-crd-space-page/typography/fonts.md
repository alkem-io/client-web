# Prototype Typography Audit & Proposed Unified Tokens

**Status**: Approved (2026-05-13). CSS implementation to follow.
**Goal**: Inventory every typography combination currently used in `prototype/src/`, then collapse the long tail into a unified, semantic token table. The same table will later be copied into `src/crd/styles/typography.css`, superseding the current 11-token CRD set.
**Approach**: "Truly from scratch" — the prototype dictates sizes/weights/leading; current CRD tokens are compared only at the end and flagged as diffs.
**Prototype-readonly exception**: This work is an explicit exception to the `prototype/CLAUDE.md` no-modify rule, granted for this typography pass.

---

## 1 — Audit findings

The prototype uses Tailwind v4 with `@theme inline` (same as `src/crd/`), so the unified table can be expressed as `@theme inline { --text-* }` tokens that Tailwind auto-promotes to `text-<name>` utilities. Setup is identical between the two roots.

### 1.1 Element-style base rules (`prototype/src/styles/theme.css`)

A `@layer base` block sets defaults for unclassed elements. Note the guard `:where(:not(:has([class*=" text-"]), :not(:has([class^="text-"]))))` — base styles only apply when no `text-*` utility is set. In practice almost every element has one, so these rarely fire.

| Element | Size | Weight | Line-height |
|---|---|---|---|
| `h1` | 48px (`--text-4xl`) | 800 | 1 |
| `h2` | 30px (`--text-3xl`) | 600 | 1.2 |
| `h3` | 24px (`--text-2xl`) | 600 | 1.33 |
| `h4` | 20px (`--text-xl`) | 600 | 1.4 |
| `p`  | 16px (`--text-base`) | 400 | 1.75 |
| `label` | 14px (`--text-sm`) | 500 | 1.43 |
| `button` | 16px (`--text-base`) | 500 | 1.5 |
| `input` | 16px (`--text-base`) | 400 | 1.5 |

CSS variables (theme.css lines 3–19): `--text-4xl: 48px`, `--text-3xl: 30px`, `--text-2xl: 24px`, `--text-xl: 20px`, `--text-base: 16px`, `--text-sm: 14px`.

### 1.2 Distinct typography combos (ordered by frequency / size)

| Combo | Count | HTML elements | Example | Likely role |
|---|---|---|---|---|
| `text-xs text-muted-foreground` | 58 | span, p, button label | `NotificationsPopover.tsx:253` | Caption / metadata / timestamp |
| `text-sm font-medium` | 42 | button, span, label | `Button.tsx`, `Header.tsx:167` | Button labels, section headers, form labels |
| `text-sm text-muted-foreground` | 41 | p, span, label | `SpaceHeader.tsx:47` | Body, taglines, helper text |
| `text-2xl font-bold tracking-tight` | 30 | h1, h2 | `PostDetailDialog.tsx:103` | Page title / dialog heading |
| `text-sm` | 28 | span, p, badge | various | General body, fallback |
| `text-xs text-muted-foreground uppercase tracking-wider` | 23 | span, label | `SpaceCard.tsx:297` | Uppercase section label ("LEADS") |
| `text-sm font-semibold` | 16 | h3, span, button label | `Header.tsx:167` | Section header, card subtitle, menu label |
| `text-xs` | 16 | span, small badge | `Badge.tsx:8` | Icon label, tiny meta, badge text |
| `text-lg font-semibold` | 14 | h3, header section label | `SubspaceSettingsSettings.tsx:108` | Subsection / dialog body title |
| `text-3xl font-bold` | 11 | h1, h2 | `PostDetailDialog.tsx:103` | Large dialog heading |
| `text-4xl font-bold` | 11 | h1 (with `clamp`) | `SpaceHeader.tsx:37` | Page hero (fluid sizing) |
| `text-base font-medium` | 10 | button, label | `ActivityFeed.tsx:246` | Medium button, form label |
| `text-xl` | 10 | section heading | `SpaceMembers.tsx` | Large section title |
| `text-sm text-muted-foreground leading-relaxed` | 10 | p | `PostCard.tsx:125` | Body with generous leading |
| `text-base` | 7 | p, button, input | theme base | Default paragraph, default button |
| `text-2xl font-semibold` | 6 | h2, header | `SubspaceSettingsSettings.tsx:86` | Page section heading (second tier) |
| `text-xs text-muted-foreground italic` | 6 | p, span | `Header.tsx:256` | Italic caption / note |
| `text-lg` | 6 | p, span | various | Medium body, optional emphasis |
| `text-xl font-semibold` | 5 | h3, header | `TemplateLibrary.tsx:375` | Subsection title, sidebar heading |
| `text-xs font-medium uppercase tracking-wider` | 5 | label, span | `SpaceCard.tsx` | Uppercase label with letter-spacing |
| `text-3xl md:text-4xl font-bold` | varies | h1 | `PostDetailDialog.tsx:103` | Responsive hero title |
| `text-xs font-semibold` | 4 | badge, label | Badge | Emphasized tiny text, uppercase label |
| `text-[11px] font-bold text-foreground` | 4 | h2 inline | `PostCard.tsx:171` | Document-preview mini-heading |
| `font-semibold text-sm` | 4 | span, label, button | various | Medium weight + small size |
| `text-sm leading-snug` | 3 | p | `NotificationsOverlay.tsx:320` | Compact paragraph |
| `text-[length:var(--text-xs)]` | 17 | span, label | `ResponseDetailDialog.tsx` | Variable-based tiny text |
| `text-[length:var(--text-sm)]` | 6 | span, label | various | Variable-based small text |
| `text-[length:var(--text-base)]` | 3 | p, span | various | Variable-based body |
| `text-[length:var(--text-lg)]` | 3 | h3, span | various | Variable-based medium heading |
| `text-[10px] font-medium` | varies | span, badge | `PostCard.tsx:90` | Tiny badge / role label |

### 1.3 Inline-style typography (not expressible as utilities)

| File:line | Element | Property | Value | Role |
|---|---|---|---|---|
| `SpaceHeader.tsx:36–39` | h1 | `fontSize` | `clamp(22px, 3vw, 32px)` | **Fluid page hero** |
| `SpaceHeader.tsx:38` | h1 | `lineHeight` | `1.2` | Tight heading leading |
| `SpaceCard.tsx:201–205` | h3 | `fontSize / fontWeight / lineHeight` | `var(--text-sm)` / `600` / `1.3` | Compact card title |
| `SpaceCard.tsx:238–243` | p | `fontSize / lineHeight` | `var(--text-sm)` / `1.5` | Card description |
| `SpaceCard.tsx:215` | p | `fontSize` | `11px` | Parent indicator (subspace) |
| `SpaceCard.tsx:297–302` | span | `fontSize / fontWeight / letterSpacing` | `10px` / `600` / `0.04em` | "LEADS" uppercase label |
| `SpaceCard.tsx:354–356` | span | `fontSize` | `11px` | Member count |
| `ChannelTabs.tsx:52–55` | tab label | `fontSize / fontWeight / lineHeight` | `14px` / `600`(active) `500`(inactive) / `20px` | Tab text |
| `ChannelTabs.tsx:63–65` | badge | `fontSize / fontWeight` | `10px` / `700` | Notification count badge |
| `CommunityFeed.tsx:67–69` | h3 | `fontSize / fontWeight` | `var(--text-xl)` / `600` | Feed section heading |
| `SpaceMembers.tsx:250–280` | label | `fontSize / fontWeight` | `var(--text-sm)` / `500` | Member role label |
| `PostCard.tsx:166–169` | mini-heading | `fontSize / fontWeight` | `11px` / `700` | Document-preview heading |
| `Footer.tsx:29` | span | `fontSize` | `var(--text-sm)` | Footer text |

### 1.4 Observations

1. **Real body size is 14px** (`text-sm`) — used heavily for descriptions, helper text, card body. `text-base` (16px) is reserved for form controls (button/input) and large activity contexts. `text-xs` (12px) is the caption tier.
2. **Most-used sizes** in descending order: `text-xs` (~344 occurrences), `text-sm` (~397), `text-lg` (~64). These three cover ~90% of text. The design avoids size proliferation.
3. **Card titles are intentionally a 2-tier system**:
   - Feed-tier (`PostCard`, `SpaceGridCard`): `text-lg` / 700 — one card per row, prominent.
   - Compact-tier (`SpaceCard`, `OrganizationCard`): 14px / 600 — dense grids, subdued.
4. **Uppercase labels** are consistently 12px (`text-xs`), `font-medium` / `font-semibold`, with `tracking-wider` (and one outlier using inline `letterSpacing: 0.04em` in SpaceCard).
5. **Page titles drift**: at least four distinct combos for the same role — `text-2xl font-bold tracking-tight` (×30), `text-3xl font-bold`, `text-3xl md:text-4xl font-bold` (responsive), and `clamp(22px, 3vw, 32px)` inline. No single source of truth.
6. **`text-sm font-medium` is overloaded** — 42 occurrences split across "button label", "form label", "menu row", and "card subtitle". Splitting it into `text-control` (tight leading, button/menu) and `text-body-emphasis` (normal leading, form/inline) clarifies intent.
7. **`text-xs text-muted-foreground` is similarly overloaded** — 58 occurrences cover timestamps, helper text, italic notes, and uppercase labels. The uppercase ones already have `uppercase tracking-wider` so they're separable; the rest are all "caption".
8. **Rare/edge-case sizes**: `text-[8px]`, `text-[7px]`, `text-[13px]`, `text-[22px]`, `text-6xl` — appear once or twice each. Candidates for elimination during the migration pass.
9. **`text-[length:var(--text-*)]` form** (~30 occurrences) duplicates the standard Tailwind size utilities through a CSS variable indirection. Unless dynamic theming is in play, simplify to plain `text-xs` / `text-sm` etc.
10. **Line-height strategy**: titles use 1.0–1.3, body uses 1.5–1.75, controls use 1.25 (`leading-snug`). Mostly consistent — the unification doesn't need to invent anything new here.

---

## 2 — Approved unified table (14 tokens)

Two **hero** tokens are fluid via `clamp()` — they scale smoothly with the viewport rather than relying on breakpoint-based composition. All other tokens are static.

| Token | Size | Weight | Leading | Tracking | HTML | Role | Replaces |
|---|---|---|---|---|---|---|---|
| `text-display` | `clamp(30px, 4vw, 48px)` | 700 | 1.0 | -0.025em | h1 | Largest hero on the platform (detail dialogs) — fluid | `text-4xl font-bold`, `text-3xl md:text-4xl font-bold` |
| `text-hero` | `clamp(22px, 3vw, 32px)` | 700 | 1.2 | -0.025em | h1 | Profile / space / user / org / VC hero — fluid (also the public-profile hero, replacing the dropped `text-profile-title`) | `text-3xl font-bold`, today's inline `clamp(22px,3vw,32px)` in SpaceHeader |
| `text-page-title` | 24px | 700 | 1.3 | -0.015em | h1 | Standard page headings (settings, list pages) | `text-2xl font-bold tracking-tight` × 30 |
| `text-section-title` | 20px | 600 | 1.3 | — | h2 | Section heading within a page | `text-xl font-semibold` × 5, `text-xl` × 10 |
| `text-subsection-title` | 18px | 600 | 1.4 | — | h3 | Subsection, dialog body title, **feed-tier card title** | `text-lg font-semibold` × 14, `text-lg font-bold` (PostCard) |
| `text-subheader` | 16px | 500 | 1.5 | — | h3 / label / p | 16px tier between `text-body` and `text-subsection-title` — settings/form labels, RadioGroup options, dialog body, empty-state titles, wizard form text. Override weight with `font-normal` / `font-semibold` / `font-bold` to match legacy `text-base` variants. | `text-base`, `text-base font-medium` / `font-semibold` / `font-bold`, `text-[length:var(--text-base)]`, inline `var(--text-base)` (~54 callsites) |
| `text-card-title` | 14px | 600 | 1.3 | — | h3 | **Compact-tier** card title | `text-sm font-semibold` × 16, SpaceCard inline 14/600/1.3 |
| `text-body` | 14px | 400 | 1.6 | — | p | Body text, descriptions | `text-sm`, `text-sm leading-relaxed` |
| `text-body-emphasis` | 14px | 500 | 1.5 | — | p/span | Form labels, link text, list-item emphasis | `text-sm font-medium` (form/inline half of its uses) |
| `text-control` | 14px | 500 | 1.25 | — | inline | Buttons, menu rows, dropdowns, tab labels — tight leading | `text-sm font-medium` (button/menu half of its uses) |
| `text-caption` | 12px | 400 | 1.5 | — | p/span | Timestamps, metadata, helper text | `text-xs`, `text-xs text-muted-foreground` × 58 |
| `text-label` | 12px | 600 | 1.3 | 0.05em | span | Uppercase section headers (in main content) | `text-xs uppercase tracking-wider` × 23 |
| `text-sidebar-label` | 11px | 600 | 1.3 | 0.05em | span | The prototype's distinctive 11px uppercase section header used in sidebars (SpaceSidebar, SubspaceSidebar, DashboardSidebar, SpaceChannelComposer, SearchOverlay) — denser vertical rhythm than `text-label`. Always compose with `uppercase`. | inline `style={{ fontSize: 11px, fontWeight: 600, textTransform: uppercase, letterSpacing: 0.04em-0.05em }}` (~15 blocks) |
| `text-badge` | 10px | 600 | 1.3 | 0.04em | span | Badges, tiny meta tags | `text-[10px] font-medium`, SpaceCard "LEADS" inline |

---

## 3 — Differences vs. current CRD (`src/crd/styles/typography.css`)

| Token | Current CRD | Approved | Why the change |
|---|---|---|---|
| `text-profile-title` (36px) | exists | **dropped** | No 36px usage in prototype; User/Org/VC public-profile hero now uses `text-hero` (the same fluid token Spaces use) |
| `text-display` | — | **new** — `clamp(30px, 4vw, 48px)` / 700 / 1.0 / -0.025em | Prototype's `text-4xl` and `text-3xl md:text-4xl` heroes had no token; one fluid token covers both |
| `text-hero` | — | **new** — `clamp(22px, 3vw, 32px)` / 700 / 1.2 / -0.025em | Replaces today's one-off inline `clamp()` in SpaceHeader; also takes over the public-profile hero slot |
| `text-page-title` | 30px | **24px** + -0.015em | Prototype uses 24px (`text-2xl`) for page titles 30× — CRD's 30px is bigger than the design system actually wants |
| `text-section-title` weight | 700 | **600** | Prototype favors `font-semibold` for section titles |
| `text-subsection-title` leading | 1.3 | **1.4** | Matches the prototype's `text-lg font-semibold` rendering |
| `text-subheader` | — | **new** — 16px / 500 / 1.5 | Captures the prototype's deliberate 16px tier (~54 callsites — settings labels, RadioGroup options, dialog body, empty-state titles, wizard fields) that previously had no token. Override weight with `font-normal` / `font-semibold` / `font-bold` to match legacy `text-base` variants |
| `text-card-title` leading | 1.4 | **1.3** | Matches SpaceCard's inline 1.3 — tighter for dense grids |
| `text-body` leading | 1.625 | **1.6** | Rounded to match `leading-relaxed` from the prototype's `text-sm leading-relaxed` |
| `text-body-emphasis` leading | 1.625 | **1.5** | Tighter to match form-label / inline-emphasis usage |
| `text-control` weight | 400 | **500** | Prototype's dominant button/menu combo is `text-sm font-medium` (500), not 400 |
| `text-label` size | 11px | **12px** | 12px (`text-xs`) is what the prototype actually uses (23 uses); `text-[11px]` is rare |
| `text-label` leading | 1.4 | **1.3** | Tighter — matches the prototype's uppercase-label rendering |
| `text-sidebar-label` | — | **new** — 11px / 600 / 1.3 / 0.05em | Captures the prototype's 11px uppercase sidebar headers (~15 inline blocks) — a distinct, denser tier than `text-label`; `text-label` stays 12px for main-content uppercase labels |
| `text-badge` weight | 500 | **600** | SpaceCard's `letterSpacing 0.04em` + 600 weight is the most-used badge treatment |
| `text-badge` tracking | — | **0.04em** | Promotes SpaceCard's inline `letterSpacing: 0.04em` into the token |
| `text-badge` leading | 1.4 | **1.3** | Tighter for the badge size class |

`text-caption` is the only token that survives unchanged.

---

## 4 — One-offs that stay as inline styles

With both heroes fluid via `clamp()`, there are **no remaining typography one-offs** in the prototype that should escape tokenization. The previous one-offs are absorbed:

- `SpaceHeader.tsx` inline `clamp(22px, 3vw, 32px)` → now `text-hero`.
- `PostDetailDialog.tsx` `text-3xl md:text-4xl font-bold` → now `text-display` (fluid takes over from the responsive composition).

---

## 5 — Implementation plan (once table is approved)

1. **Write** `prototype/src/styles/typography.css` — a new file with one `@theme inline { ... }` block containing the 12 tokens above. Comments at the top noting the prototype-readonly exception and the sync points (this spec, future CRD copy).
2. **Add** `@import './typography.css';` to `prototype/src/styles/index.css` after `tailwind.css` and before `theme.css` so the typography tokens are available wherever Tailwind utilities are.
3. **Do NOT** touch any `.tsx` files in this pass — the addition is purely additive. Existing raw-class usage keeps working until a separate migration replaces it.
4. **Later** (separate task) — copy `prototype/src/styles/typography.css` into `src/crd/styles/typography.css`, update `src/crd/CLAUDE.md` Rule #8 and `docs/crd/migration-guide.md` to match, and run a migration pass replacing raw class combos with semantic tokens per the "Replaces" column above.

---

## 6 — Approved decisions (2026-05-13)

1. **Table approved** as listed in §2 — 14 tokens (started at 12, added `text-subheader` and `text-sidebar-label` after the first migration pass surfaced ~54 + ~15 callsites that needed dedicated tokens).
2. **Two card-title tiers retained** — `text-subsection-title` for feed-tier (`PostCard`, `SpaceGridCard`), `text-card-title` for compact-tier (`SpaceCard`, `OrganizationCard`).
3. **All heroes are responsive** — both `text-display` and `text-hero` use `clamp()` so they scale fluidly with the viewport, no breakpoint composition needed.
4. **`text-profile-title` dropped** — User/Org/VC public-profile heroes use the same `text-hero` token Spaces use.
5. **Naming kept** — CRD-style names (`text-page-title`, `text-section-title`, …) preserved; only the underlying size/weight/leading/tracking values shift to match the prototype.
6. **`text-subheader` added** to capture the 16px tier — Space Settings labels, RadioGroup options, dialog body, empty-state titles, wizard fields. Default 500 weight, override with `font-normal` / `font-semibold` / `font-bold` to keep the original rendering. **Exception**: `prototype/src/app/components/ui/input.tsx` and `textarea.tsx` keep their `text-base md:text-sm` — iOS-zoom-prevention pattern, do not migrate.
7. **`text-sidebar-label` added** as a distinct 11px token (separate from the 12px `text-label`) for the prototype's denser sidebar uppercase headers — keeps the +1px vertical rhythm difference between sidebars and main content.
8. **Dynamic conditional weight** (`hasUnread ? 600 : 400`, `isActive ? 600 : 500`) — apply the token for size/leading/letter-spacing and override weight with a conditional `font-*` class via `cn()`: `cn('text-body', hasUnread && 'font-semibold')`.

---

## 7 — Migration rules (raw class → semantic token)

This is the rulebook for the prototype-wide migration pass. Apply mechanically except where a rule explicitly says "context-sensitive". When a combo doesn't match any rule, **leave it alone and flag it** in the migration report — don't guess.

### 7.1 Direct replacements (no context judgment needed)

Listed by token. Each row lists the legacy raw-class shape(s) to find and the exact replacement to write. **Drop `tracking-tight` / `tracking-wider` / `tracking-[…]` when the target token already supplies letter-spacing** (display, hero, page-title, label, badge). **Drop `leading-*` modifiers in all cases** — every token sets its own line-height.

| Find (raw classes) | Replace with |
|---|---|
| `text-4xl font-bold` | `text-display` |
| `text-3xl md:text-4xl font-bold` | `text-display` |
| `text-3xl font-bold` (standalone) | `text-hero` |
| `text-2xl font-bold tracking-tight` | `text-page-title` |
| `text-2xl font-bold` | `text-page-title` |
| `text-2xl font-semibold` | `text-page-title font-semibold` *(weight override preserves 600)* |
| `text-2xl` (standalone) | `text-page-title font-normal` *(if weight is default)*, else `text-page-title` |
| `text-xl font-bold` | `text-section-title font-bold` |
| `text-xl font-semibold` | `text-section-title` |
| `text-xl` (standalone) | `text-section-title font-normal` |
| `text-lg font-bold` | `text-subsection-title font-bold` *(feed-tier PostCard pattern)* |
| `text-lg font-semibold` | `text-subsection-title` |
| `text-lg font-medium` | `text-subsection-title font-medium` |
| `text-lg` (standalone) | `text-subsection-title font-normal` |
| `text-base font-bold` | `text-subheader font-bold` |
| `text-base font-semibold` | `text-subheader font-semibold` |
| `text-base font-medium` | `text-subheader` *(default weight matches — drop modifier)* |
| `text-base` (standalone) | `text-subheader font-normal` *(token default is 500; explicit `font-normal` preserves Tailwind's 400 default for plain `text-base`)* |
| `text-[length:var(--text-base)]` | `text-subheader font-normal` |
| `text-[length:var(--text-base)] font-medium` | `text-subheader` |
| `text-[length:var(--text-base)] font-semibold` | `text-subheader font-semibold` |
| `var(--text-base)` inline + `fontWeight: 400` | `className="text-subheader font-normal"` |
| `var(--text-base)` inline + `fontWeight: 500` | `className="text-subheader"` |
| `var(--text-base)` inline + `fontWeight: 600` | `className="text-subheader font-semibold"` |
| `text-sm font-semibold` | `text-card-title` |
| `text-sm font-bold` | `text-card-title font-bold` |
| `text-sm leading-relaxed` / `text-sm leading-normal` (paragraph context) | `text-body` |
| `text-sm leading-snug` (compact paragraph) | `text-body leading-snug` *(keep the snug — `text-body` is 1.6, snug is 1.375, intentional tightening)* |
| `text-sm` (standalone, paragraph/description) | `text-body` |
| `text-xs uppercase tracking-wider` | `text-label uppercase` |
| `text-xs font-semibold uppercase tracking-wider` | `text-label uppercase` |
| `text-xs font-medium uppercase tracking-wider` | `text-label uppercase` |
| `text-xs italic` | `text-caption italic` |
| `text-xs font-semibold` | `text-caption font-semibold` |
| `text-xs font-medium` | `text-caption font-medium` |
| `text-xs` (standalone) | `text-caption` |
| `text-[10px] font-medium` / `text-[10px] font-semibold` | `text-badge` |
| `text-[9px]` (any weight) | `text-badge` |
| `text-[11px] font-bold` | `text-caption font-bold` |
| `text-[11px]` (standalone) | `text-caption` |

### 7.2 Context-sensitive replacements

Read the surrounding JSX before replacing — the same raw class maps to different tokens depending on what it's applied to.

**`text-sm font-medium`** (42 occurrences) — split based on element:
- On `<button>`, menu item (`DropdownMenuItem`), tab trigger (`TabsTrigger`), dropdown row, select trigger (`SelectTrigger`), command item, or any `cursor-pointer` row inside a popover → **`text-control`**
- On `<label>`, form-field text, inline span used for emphasis inside a paragraph, list-item title text where the row is not interactive → **`text-body-emphasis`**
- When in doubt, default to `text-body-emphasis` (it's the safer fallback — wider leading)

**`text-xs text-muted-foreground`** (58 occurrences) — split:
- If the element also has `uppercase` or `tracking-wider` → **`text-label uppercase text-muted-foreground`**
- Otherwise (the vast majority — timestamps, helper text, metadata) → **`text-caption text-muted-foreground`**

**Variable-based classes** (`text-[length:var(--text-*)]`):
- `text-[length:var(--text-xs)]` → `text-caption`
- `text-[length:var(--text-sm)]` → `text-body` (or `text-control` if on a button/menu — same context rule as above)
- `text-[length:var(--text-base)]` → **leave alone** (no 16px token, see §7.4)
- `text-[length:var(--text-lg)]` → `text-subsection-title font-normal` (if no `font-*` adjacent), else inherit the weight

### 7.3 Inline `style={...}` typography

Replace inline `fontSize` / `fontWeight` / `lineHeight` / `letterSpacing` with a `className` token **when the combination exactly matches a token**. When values are close but not exact, leave the inline style alone and flag.

Known exact matches in the prototype:

| Inline style | Replace with |
|---|---|
| `style={{ fontSize: 'var(--text-sm)', fontWeight: 600, lineHeight: 1.3 }}` (SpaceCard.tsx h3) | `className="text-card-title"` (drop the inline style) |
| `style={{ fontSize: 'var(--text-sm)', lineHeight: 1.5 }}` (SpaceCard.tsx p description) | `className="text-body"` *(line-height becomes 1.6 — accept the +0.1)* |
| `style={{ fontSize: '10px', fontWeight: 600, letterSpacing: '0.04em' }}` (SpaceCard "LEADS" span) | `className="text-badge uppercase"` *(letter-spacing is already in the token)* |
| `style={{ fontSize: 11px, fontWeight: 700 }}` (PostCard document mini-heading) | `className="text-caption font-bold"` |
| `style={{ fontSize: 'var(--text-xl)', fontWeight: 600 }}` (CommunityFeed h3) | `className="text-section-title"` |
| `style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--font-weight-medium)' }}` (SpaceMembers label) | `className="text-body-emphasis"` |
| `style={{ fontSize: 14, fontWeight: 600, lineHeight: '20px' }}` (ChannelTabs active) | `className="text-control font-semibold"` *(600 instead of 500)* |
| `style={{ fontSize: 14, fontWeight: 500, lineHeight: '20px' }}` (ChannelTabs inactive) | `className="text-control"` |
| `style={{ fontSize: 10, fontWeight: 700 }}` (ChannelTabs badge) | `className="text-badge font-bold"` |
| `style={{ fontSize: 'var(--text-sm)' }}` (Footer span) | `className="text-body"` |
| `style={{ fontSize: 11 }}` (any standalone) | `className="text-caption"` |

**`SpaceHeader.tsx` inline `clamp(22px, 3vw, 32px)`** → replace the entire inline `style={{ fontSize, fontWeight, lineHeight, letterSpacing }}` block with `className="text-hero"`. This is the headline migration — the whole reason `text-hero` is fluid.

**11px uppercase sidebar headers** — `style={{ fontSize: '11px', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.04em' or '0.05em' }}` (occurs ~15× in `SpaceSidebar.tsx`, `SubspaceSidebar.tsx`, `DashboardSidebar.tsx`, `SpaceChannelComposer.tsx`, `SearchOverlay.tsx`) → `className="text-sidebar-label uppercase"`. Drop the inline `style` block entirely; the token covers size, weight, leading, and letter-spacing. If the element already has companion classes (`text-muted-foreground`, etc.), keep them.

### 7.3a Dynamic conditional weight

When the legacy code uses `style={{ fontSize: ..., fontWeight: condition ? A : B }}` — i.e. weight depends on runtime state (hasUnread, isActive, isSelected) — convert the size/leading via the matching token, then express the weight as a conditional className via `cn()`. Pick the token whose **default weight matches the "off" state**, then add the "on" state as a conditional class.

| Legacy pattern | Replace with |
|---|---|
| `style={{ fontSize: 'var(--text-sm)', fontWeight: hasUnread ? 600 : 400 }}` | `className={cn('text-body', hasUnread && 'font-semibold')}` |
| `style={{ fontSize: 'var(--text-sm)', fontWeight: hasUnread ? 600 : 500 }}` | `className={cn('text-body-emphasis', hasUnread && 'font-semibold')}` |
| `style={{ fontSize: 12, fontWeight: isActive ? 600 : 500 }}` | `className={cn('text-caption font-medium', isActive && 'font-semibold')}` *(note: later class wins, so isActive promotes weight)* |
| `style={{ fontSize: 11, fontWeight: hasUnread ? 600 : 400 }}` | `className={cn('text-caption', hasUnread && 'font-semibold')}` *(note: 11px collapses to 12px caption — acceptable; if 11px must be preserved, keep inline)* |
| `style={{ fontSize: 'var(--text-sm)', fontWeight: isActive ? 600 : 400 }}` (tab triggers) | `className={cn('text-control font-normal', isActive && 'font-semibold')}` |

When the size also needs to change conditionally (rare — search those out and flag), leave inline and flag.

When the weight option pair isn't a clean Tailwind weight (e.g. `fontWeight: someNumber ? 550 : 450` — impossible but if encountered), leave inline.

### 7.4 Leave alone (flag in report)

Do **not** rewrite these — log them in the migration report instead so we can decide case-by-case later:

- **`prototype/src/app/components/ui/input.tsx` and `textarea.tsx`** — keep their `text-base md:text-sm`. This is the iOS-zoom-prevention pattern (inputs under 16px on mobile cause iOS to zoom the viewport on focus). Do **not** migrate these two files' base size classes regardless of the `text-base` → `text-subheader` rule above.
- **Rare/edge sizes**: `text-[7px]`, `text-[8px]`, `text-[9px]` (when not in a clear badge context), `text-[12px]`, `text-[13px]`, `text-[22px]`, `text-6xl`, `text-5xl` — appear once or twice, likely chart axes, overlays, document-preview mocks, or design debt. Decide individually.
- **`DocumentDetailDialog.tsx` / `PostDetailDialog.tsx` document-preview body content** (~50 inline sizes ranging 7px–22px in the mock document/post body) — these intentionally simulate a printed document's typography hierarchy and should keep their raw sizes.
- **`AnalyticsGraphExplorer.tsx` chart UI inline sizes** (10–12px micro-variants) — chart chrome with many bespoke size/weight/letter-spacing combinations that don't map cleanly. Decide individually if needed; otherwise leave.
- **Typography demo pages** (`TypographySystemPage.tsx`, `TypographyDecisionPage.tsx`, `DesignSystemPage.tsx`) — these intentionally show raw class variants for design reference. Skip entirely.
- **Anything with a `text-*` size that doesn't match a rule above.**

### 7.5 General rules

- **Drop redundant modifiers**: when the target token already supplies `letter-spacing` (display, hero, page-title, label, badge), drop any `tracking-tight` / `tracking-wider` / `tracking-[…]` next to it. When the target token supplies `font-weight`, drop the matching `font-*` (e.g. drop `font-bold` when targeting `text-page-title`, which is already 700). Drop `leading-*` everywhere — every token sets its own line-height.
- **Preserve unrelated classes**: color (`text-muted-foreground`, `text-destructive`), truncation (`truncate`, `line-clamp-*`), layout (`flex`, `gap-*`), responsive variants (`md:*`), state (`hover:*`, `group-hover:*`) — all stay untouched.
- **Preserve weight overrides**: when the legacy combo's weight differs from the token's default, keep the override (e.g. `text-page-title font-semibold` when migrating `text-2xl font-semibold`). Don't silently change the rendered weight.
- **Don't migrate `.css` files** — only `.tsx` / `.jsx` / `.ts` / `.js`. The CSS is the source of truth.
- **One file, one commit-worthy unit** — if a file has 20 raw combos, fix them all in that file, don't half-migrate.
- **Don't change file structure** — no renames, no new files, no JSX restructuring. Pure className/style swaps.
- **Skip `prototype/node_modules/` and `prototype/dist/`** — never touch these.
- **Flag, don't guess** — when a combo doesn't clearly map to a token, leave it and add it to your report.
