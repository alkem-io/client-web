# CRD Typography System — Specification

## Problem

Typography across `src/crd/` is inconsistent. The same semantic role (e.g., "card title") uses different size/weight/leading combinations in different components. There is no defined type scale — developers eyeball sizes, leading to drift.

### Audit findings (50+ files analyzed)

| Issue | Severity | Examples |
|-------|----------|---------|
| Page title sizes vary | High | `text-2xl` (SpaceExplorer), `text-3xl` (CalloutDetailDialog), dynamic `clamp()` (SpaceHeader) |
| Card title hierarchy unclear | High | `text-lg font-bold` (PostCard) vs `text-sm font-semibold` (SpaceCard, SearchResults) |
| Body text line-height scattered | Medium | `leading-relaxed` vs `leading-normal` for the same role |
| Small text sizes fragmented | High | `text-xs`, `text-[9px]`, `text-[10px]`, `text-[11px]` used interchangeably |
| Uppercase section labels inconsistent | Medium | `text-xs tracking-wider` and `text-[11px] tracking-wider` in sidebar |
| Custom spacing values | Medium | `leading-[1.3]`, `tracking-[0.04em]` instead of standard scale |
| Dialog title sizes vary | Medium | `text-lg`, `text-base`, `text-xl` across different modals |

---

## Existing State

### `core/ui/typography` (MUI — what we're replacing)

The MUI layer has 10 semantic components built on `<Typography>`:

| Component | MUI variant | HTML | Purpose |
|-----------|-------------|------|---------|
| `PageTitle` | h2 | h1 | Main page heading |
| `BlockTitle` | h3 | h2 | Block-level heading |
| `BlockSectionTitle` | h4 | h3 | Sub-section heading |
| `Tagline` | subtitle1 | h4 | Subtitle/tagline (italic) |
| `Text` | body1 | p | Regular body text |
| `CardTitle` | — | p | Card heading (bold) |
| `CardText` | body2 | div | Card body (lighter) |
| `Caption` | caption | p | Small caption |
| `CaptionSmall` | caption | p | Italic caption |

These use `provideStaticProps` to set default MUI variant/component/fontWeight.

### `theme.css` (current CRD tokens)

The current theme defines raw CSS variables (`--text-4xl` through `--text-sm`) and base element styles for `h1`–`h4`, `p`, `label`, `button`, `input`. However:

- These variables are **not registered in `@theme`** — Tailwind doesn't generate semantic utilities from them
- The base styles are wrapped in `:where(:not(:has(...)))` which limits their reach
- Components override these with ad-hoc Tailwind classes, causing the drift

---

## Research: Industry Patterns

### How shadcn/ui handles typography

**shadcn/ui has no typography component.** Their [docs page](https://ui.shadcn.com/docs/components/radix/typography) shows copy-paste class combos, not installable components. This is deliberate — they treat typography as a styling concern. The community has been requesting components since 2023 (Discussion #1527, #3257, Issue #315) but none were added.

### Five approaches evaluated

| Approach | Description | Pros | Cons | Used by |
|----------|-------------|------|------|---------|
| **A. Many wrapper components** | `<Heading>`, `<Body>`, `<Caption>` | Semantic, self-documenting | Too many files for className presets, rigid | MUI, Chakra UI |
| **B. Raw Tailwind classes** | Use utility classes directly | Zero overhead, composable | No enforcement, causes drift (our current problem) | shadcn/ui docs |
| **C. Single `<Text>` component (CVA)** | One component with `variant` prop | Type-safe, auto-maps HTML elements, single file | Still a component wrapper | Community consensus for shadcn projects |
| **D. CSS custom properties only** | Define tokens, apply manually | Framework-agnostic | No enforcement, poor DX | — |
| **E. `@theme` tokens (Tailwind v4)** | Register scale in `@theme`, get auto-generated utilities | CSS-native, bundles size+weight+leading, zero JS, works with responsive modifiers | No semantic HTML enforcement | Vercel Geist, Porsche DS |

### What popular systems do

| System | Approach |
|--------|----------|
| **shadcn/ui** | B — utility classes, no component |
| **Radix Themes** | A — `<Text>` and `<Heading>` components with size/weight props |
| **Vercel Geist** | E — Tailwind utilities that pre-set size + line-height + weight |
| **Porsche Design System** | E — Custom Tailwind typography utilities via plugin |
| **Community shadcn projects** | C — Single `<Text>` with CVA variants |

---

## Decision: Approach E — `@theme` tokens only

### Rationale

The inconsistency isn't because we lack components — it's because **there's no defined scale**. Developers are eyeballing sizes. The fix is defining the scale as Tailwind utilities via `@theme` tokens. No wrapper components.

### Why not components (approach A or C)?

- CRD components already use Tailwind classes everywhere — wrapper components add indirection and friction
- Typography needs to compose with other utilities (`text-page-title md:text-section-title`, `text-body text-destructive`)
- Wrapper components can't anticipate every context (inline text in a flex row, text inside a button, etc.)
- The token names already encode intent (`text-page-title` implies `<h1>`) — a component doesn't add meaningful enforcement

### Why not just raw classes (approach B)?

- It's what we have now, and it drifted. The problem is there's no named scale to enforce.

### Why `@theme` tokens?

- `text-page-title` is greppable, lintable, and bundles size+weight+leading in a single utility
- Zero JS overhead — pure CSS
- Composes naturally with Tailwind responsive modifiers, color overrides, etc.
- When the design scale changes, updating one token fixes all components

---

## Type Scale Definition

### Semantic tokens

These will be registered in `@theme inline` in `theme.css`. Tailwind v4 auto-generates a utility class for each `--text-*` token, bundling font-size, line-height, font-weight, and letter-spacing.

| Token name | Size | Weight | Line-height | Letter-spacing | HTML | Purpose |
|-----------|------|--------|-------------|----------------|------|---------|
| `text-page-title` | 30px | 700 | 1.2 | -0.025em | h1 | Main page headings |
| `text-section-title` | 20px | 700 | 1.3 | — | h2 | Section headings within a page |
| `text-subsection-title` | 18px | 600 | 1.3 | — | h3 | Subsection headings, dialog titles |
| `text-card-title` | 14px | 600 | 1.4 | — | h3 | Card headings, list item titles |
| `text-body` | 14px | 400 | 1.625 | — | p | Body text, descriptions |
| `text-body-emphasis` | 14px | 500 | 1.625 | — | p/span | Emphasized body text, links |
| `text-control` | 14px | 400 | 1.25 | — | span/inline | UI-chrome in single-line controls (menu items, dropdown rows, select triggers, inputs, button labels). Same size/weight as body but tighter leading so rows don't grow vertically. |
| `text-caption` | 12px | 400 | 1.5 | — | p/span | Timestamps, metadata, secondary text |
| `text-label` | 11px | 600 | 1.4 | 0.05em | span | Uppercase section headers, sidebar labels |
| `text-badge` | 10px | 500 | 1.4 | — | span | Badge text, tag labels |

### CSS implementation in `theme.css`

```css
@theme inline {
  /* ... existing color tokens ... */

  /* Typography scale */
  --text-page-title: 30px;
  --text-page-title--line-height: 1.2;
  --text-page-title--font-weight: 700;
  --text-page-title--letter-spacing: -0.025em;

  --text-section-title: 20px;
  --text-section-title--line-height: 1.3;
  --text-section-title--font-weight: 700;

  --text-subsection-title: 18px;
  --text-subsection-title--line-height: 1.3;
  --text-subsection-title--font-weight: 600;

  --text-card-title: 14px;
  --text-card-title--line-height: 1.4;
  --text-card-title--font-weight: 600;

  --text-body: 14px;
  --text-body--line-height: 1.625;
  --text-body--font-weight: 400;

  --text-body-emphasis: 14px;
  --text-body-emphasis--line-height: 1.625;
  --text-body-emphasis--font-weight: 500;

  --text-control: 14px;
  --text-control--line-height: 1.25;
  --text-control--font-weight: 400;

  --text-caption: 12px;
  --text-caption--line-height: 1.5;
  --text-caption--font-weight: 400;

  --text-label: 11px;
  --text-label--line-height: 1.4;
  --text-label--font-weight: 600;
  --text-label--letter-spacing: 0.05em;

  --text-badge: 10px;
  --text-badge--line-height: 1.4;
  --text-badge--font-weight: 500;
}
```

This generates the following utilities automatically:
- `text-page-title` — sets font-size: 30px, line-height: 1.2, font-weight: 700, letter-spacing: -0.025em
- `text-section-title` — sets font-size: 20px, line-height: 1.3, font-weight: 700
- etc.

### Usage in components

```tsx
// Before (inconsistent)
<h1 className="text-2xl font-bold tracking-tight">Explore Spaces</h1>
<h1 className="text-3xl font-bold leading-tight">About</h1>

// After (consistent)
<h1 className="text-page-title">Explore Spaces</h1>
<h1 className="text-page-title">About</h1>
```

```tsx
// Before (fragmented small text)
<span className="text-[11px] font-semibold uppercase tracking-wider">Section</span>
<span className="text-xs font-semibold uppercase tracking-wider">Section</span>

// After
<span className="text-label uppercase">Section</span>
```

### Composability with Tailwind

Because these are standard Tailwind utilities, they compose naturally:

```tsx
// Responsive
<h1 className="text-section-title md:text-page-title">Title</h1>

// Color override
<p className="text-body text-destructive">Error description</p>

// Weight override (font-weight from the token can be overridden)
<span className="text-caption font-semibold">Bold caption</span>
```

---

## Tooling: Figma Make

### Problem

We use Figma Make for code generation. Figma Make always outputs raw Tailwind utility classes (`text-xl font-bold leading-tight`) — there is no mechanism to configure it to emit custom semantic classes like `text-page-title`. As of 2026, Figma Make does not support:
- Custom Tailwind config or `@theme` token imports
- Mapping Figma text styles to custom utility classes
- Tailwind v4 `@theme` tokens in generated output

Naming Figma text styles to match our tokens (e.g., `page-title`) does not change Make's output — it still decomposes styles into constituent utilities.

### Workflow

Since Figma Make output will always use raw classes, the workflow for new CRD components is:

1. **Generate** — Use Figma Make for layout/structure scaffolding (JSX skeleton, layout classes)
2. **Replace** — Swap raw Tailwind class combos with semantic tokens using the Migration Reference table in this spec
3. **Review** — Verify semantic HTML elements match the token intent (`text-page-title` on `<h1>`, etc.)

This replacement step is mechanical — the Migration Reference table maps every raw class combo to its semantic token. A codemod script can automate this if the volume of Figma Make output justifies it.

### Recommendation for Figma

Name Figma text styles to match our token names (`page-title`, `section-title`, `body`, `caption`, `label`, `badge`). This won't change Make's output, but it makes the mapping obvious when a developer reads the Figma design and knows which token to apply.

---

## Migration Strategy

### Phase 1: Add `@theme` tokens (non-breaking)
1. Add the typography tokens to `@theme inline` in `theme.css`
2. Verify existing components still work (the tokens don't affect anything until used)

### Phase 2: Migrate existing components (incremental)
Replace ad-hoc class combos with semantic tokens, component by component:
- Start with the highest-drift areas (page titles, card titles, labels)
- Each migration is a single-line class change, easy to review
- No behavior changes — purely visual consistency

---

## Migration Reference

This table maps current inconsistent usage to the standardized token:

| Current classes | Replace with | Components affected |
|----------------|-------------|---------------------|
| `text-2xl font-bold tracking-tight` | `text-page-title` | SpaceExplorer, SpaceMembers, SpaceSubspacesList |
| `text-3xl font-bold leading-tight` | `text-page-title` | CalloutDetailDialog, SpaceAboutView |
| `text-xl font-bold` | `text-section-title` | CalloutDetailDialog (sections) |
| `text-lg font-semibold` | `text-subsection-title` | SpaceAboutView, SpaceFeed, SpaceMembers, CalloutDetailDialog |
| `text-lg font-medium` | `text-subsection-title` | SpaceSubspacesList (empty state) |
| `text-lg font-bold` (PostCard title) | `text-subsection-title font-bold` | PostCard (feed-tier card, intentionally larger — see Prototype Reference) |
| `text-sm font-semibold` | `text-card-title` | SpaceCard, SearchResults, CompactSpaceCard (compact-tier cards) |
| `text-sm` on UI-chrome (menu/dropdown/select rows, inputs, buttons, calendar day cells) | `text-control` | shadcn primitives: dropdown-menu, select, calendar, button, input |
| `text-sm font-medium` on button base label | `text-control font-medium` | button.tsx primitive |
| `text-sm text-muted-foreground leading-relaxed` | `text-body text-muted-foreground` | InfoBlock, ExpandableDescription, SpaceCard |
| `text-sm text-muted-foreground leading-normal` | `text-body text-muted-foreground` | SpaceExplorer, ActivityItem |
| `text-xs text-muted-foreground` | `text-caption text-muted-foreground` | PostCard timestamp, CommentItem, ActivityItem |
| `text-[11px] font-semibold uppercase tracking-wider` | `text-label uppercase` | Sidebar section headers, ContentBlock labels |
| `text-xs font-semibold uppercase tracking-wider` | `text-label uppercase` | AddPostModal labels |
| `text-[10px] font-medium` | `text-badge` | Badges, SpaceCard tags |
| `text-[9px] font-semibold` | `text-badge` | AvatarFallback initials |
| `text-lg font-semibold tracking-tight` | `text-subsection-title` | AddPostModal, PollSettingsDialog titles |

### Custom values to eliminate

| Current | Standard replacement |
|---------|---------------------|
| `leading-[1.3]` | (handled by token's built-in line-height) |
| `tracking-[0.04em]` | `text-label` (includes tracking: 0.05em) or remove |

---

## Files to create/modify

| File | Action |
|------|--------|
| `src/crd/styles/typography.css` | New file — `@theme inline` typography tokens |
| `src/crd/styles/crd.css` | Add `@import './typography.css'` |
| 50+ component files | Replace ad-hoc classes with semantic tokens (Phase 2) |

---

## Prototype Reference

The prototype (`prototype/src/app/components/`) is the design source of truth. Typography patterns observed:

### Card title hierarchy (from prototype)

| Card type | File | Element | Size | Weight | Context |
|-----------|------|---------|------|--------|---------|
| **PostCard** | `space/PostCard.tsx` | `<h3>` | `text-lg` (18px) | `font-bold` (700) | Feed layout — one card per row, prominent |
| **SpaceGridCard** | `space/SpaceGridCard.tsx` | `<h3>` | `text-lg` (18px) | `font-semibold` (600) | Grid layout — same size as PostCard, lighter weight |
| **SpaceCard** | `space/SpaceCard.tsx` | `<h3>` | 14px (inline `var(--text-sm)`) | 600 | Compact grid — many cards per row, subdued |
| **OrganizationCard** | `OrganizationCard.tsx` | `<h3>` | inherited (default) | `font-semibold` (600) | Compact listing |

**Finding:** The prototype intentionally uses **two tiers** of card titles:
- **Featured/feed tier** (PostCard, SpaceGridCard): `text-lg` — these appear in feed layouts where each card gets a full row
- **Compact/grid tier** (SpaceCard, OrganizationCard): `text-sm` — these appear in dense grids with many cards visible at once

### Other prototype typography patterns

| Role | Prototype usage | Notes |
|------|----------------|-------|
| Page titles | `text-3xl font-bold` or dynamic `clamp()` | Varies by page |
| Section headings | `text-xl font-bold` | Consistent |
| Subsection headings | `text-lg font-semibold` | Consistent |
| Body text | `text-sm` with muted color | Consistent |
| Metadata/timestamps | `text-xs text-muted-foreground` | Consistent |
| Uppercase labels | `text-[11px] font-semibold uppercase tracking-wider` | Sidebar sections |
| Badge text | `text-[10px] font-medium` | Tags, status badges |

---

## Decisions Log

### Decision 1: PostCard title size — Use `text-subsection-title`, no new token

**Decision:** PostCard titles use `text-subsection-title` (18px, font-weight 600). No dedicated `text-card-title-lg` token.

**Rationale:** The prototype confirms PostCard titles are intentionally larger than compact card titles. However, functionally they are subsection headings within a feed layout — they serve the same role as `text-subsection-title`. Reusing an existing token avoids scale bloat. The weight difference (prototype uses 700, token uses 600) is acceptable; if bolder is needed, `text-subsection-title font-bold` overrides it.

**Migration:**
- PostCard title: `text-lg font-bold` → `text-subsection-title font-bold`
- SpaceCard/CompactSpaceCard title: `text-sm font-semibold` → `text-card-title`

### Decision 2: SpaceHeader dynamic sizing — Keep as one-off exception

**Decision:** Keep `clamp(28px, 5vw, 48px)` as an inline style in SpaceHeader. Do not create a token for it.

**Rationale:** The prototype uses this exact `clamp()` value (confirmed in `prototype/src/app/components/space/SpaceHeader.tsx` line 93-105, with `fontWeight: 700`, `letterSpacing: -0.02em`, `lineHeight: 1.1`). It's the only component in the entire prototype that uses fluid font sizing — it's a hero banner treatment. Tailwind's `@theme` can't accept `clamp()` as a `--text-*` value, and responsive breakpoints would lose the fluid scaling. One-off exceptions are acceptable when they serve a specific design intent and only affect a single component.

**Prototype reference:** SpaceHeader `<h1>` uses inline styles: `fontSize: "clamp(28px, 5vw, 48px)"`, `fontWeight: 700`, `letterSpacing: "-0.02em"`, `lineHeight: 1.1`, `color: "var(--primary-foreground)"`.

### Decision 3: `text-body` vs `text-sm` — Use semantic tokens everywhere

**Decision:** Use `text-body` (and all other semantic tokens) instead of raw Tailwind size classes like `text-sm`, `text-xs`, `text-lg`. Accept the migration cost.

**Rationale:** The whole point of this typography system is to make intent explicit. `text-body` communicates "this is body text" while `text-sm` only says "this is 14px". When the design scale changes (e.g., body text moves from 14px to 15px), updating one token fixes everything; with raw classes, you'd need to grep for `text-sm` and guess which ones are body text vs. something else that happens to be 14px. The upfront migration is large (~50+ files) but each change is a simple class replacement with no behavior change.

### Decision 4: No `<Text>` component — tokens only

**Decision:** No `<Text>` wrapper component. Use `@theme` tokens as Tailwind utility classes directly on semantic HTML elements.

**Rationale:** A `<Text>` component's only value would be automatic HTML element mapping (e.g., `<Text variant="pageTitle">` always renders `<h1>`). This is insufficient justification because:

1. **Token names already encode the element.** `text-page-title` → `<h1>`, `text-section-title` → `<h2>`, `text-caption` → `<p>` or `<span>`. Any developer reading the class knows what element to use.
2. **Code review catches semantic errors.** Putting `text-page-title` on a `<div>` is the same category of mistake as using the wrong heading level — a component wrapper wouldn't prevent it if the developer doesn't care about semantics.
3. **Tailwind classes compose, components don't.** `<h2 className="text-section-title text-destructive truncate">` works naturally. A `<Text>` component would need to expose every possible prop (`color`, `truncate`, `className`) and becomes a pass-through wrapper for no reason.
4. **`@theme` tokens already bundle everything.** `text-body` sets size + weight + line-height in one class — that's the consistency a component would have provided, without React overhead.

