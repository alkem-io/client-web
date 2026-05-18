# Phase 1 Quickstart — Manual Verification Plan

Layout-only changes don't lend themselves to automated regression tests in this repo (no Storybook visual diffing or Playwright suite). This quickstart is the test plan a reviewer can run end-to-end.

## Setup

```bash
# Install (if not already)
pnpm install

# Path A — standalone CRD preview app (fastest design loop)
pnpm crd:dev               # → http://localhost:5200

# Path B — full app integration
pnpm start                 # → http://localhost:3001
# Requires backend at localhost:3000 — without it, GraphQL fails but headers render with placeholder data
```

Toggle CRD ON for path B if it isn't already:

```js
localStorage.setItem('alkemio-design-version', '2');
location.reload();
```

## Test viewports

For every test below, sample at: **320px, 768px, 1024px, 1440px, 1920px**.

Browser DevTools → Toggle device toolbar → set responsive width.

## US1 — Full-width edge-to-edge banner

| # | Check | Pass criterion |
|---|-------|----------------|
| 1.1 | Open a Space with a banner image | Banner image touches both viewport edges (no gutter, no padding). Inspect element: banner `<div>` has `w-full aspect-[6/1]`, no horizontal `px-*` on its wrapper. |
| 1.2 | Open a Subspace with a parent banner image | Same — edge-to-edge, identical aspect ratio at the same viewport. |
| 1.3 | Open a Space without a banner image | Deterministic colour-gradient fills the same `aspect-[6/1]` region edge-to-edge. |
| 1.4 | Resize from 320 → 1920 | Banner height scales smoothly with viewport (no jumps). At 1920px banner is ~320px tall; at 1024px ~171px; at 768px ~128px. |
| 1.5 | Inner content below banner | Sidebar and main-body widths byte-identical to `develop` branch at the same viewport (use DevTools "Computed → width" panel — record before/after). |

## US2 — Title and subtitle below the banner

| # | Check | Pass criterion |
|---|-------|----------------|
| 2.1 | Inspect title element | `<h1>` carries the `text-hero` class. Text colour = `text-foreground` (dark in light theme, light in dark theme), NOT `text-primary-foreground`. |
| 2.2 | Inspect tagline | `<p>` carries the `text-body` class with `text-muted-foreground`. `truncate` class present. |
| 2.3 | Space vs Subspace overlay diff | Open Space and Subspace side-by-side at the same viewport. Title's vertical offset from the banner bottom matches between the two. Inner-content horizontal alignment matches. |
| 2.4 | Long title | Edit a Space's name to be very long (use admin or local mock). Title truncates with ellipsis; subtitle and action buttons remain visible and aligned. |
| 2.5 | Missing tagline | Page collapses cleanly — no extra whitespace where subtitle would have been. |
| 2.6 | Dark mode | Toggle dark theme. Title and subtitle remain readable (contrast ≥4.5:1) with no white-on-dark or dark-on-dark glitches. |

## US3 — Action buttons on right of title row

| # | Check | Pass criterion |
|---|-------|----------------|
| 3.1 | Buttons visible | Activity, Video, Share, Settings icons render right-aligned on the title row, vertically centred relative to the title. Styling = ghost icon buttons (neutral), NOT white-on-translucent-dark. |
| 3.2 | Right edge alignment | Rightmost button's right edge aligns pixel-for-pixel with the right edge of the sidebar/body content below. DevTools: hover both elements and compare `x + width`. |
| 3.3 | Partial permissions | Test with a user who only has settings permission (or whatever subset). Only the available buttons render; the group stays right-aligned at the same right edge. |
| 3.4 | Hover and focus states | Mouse-over each button → background tint. Keyboard-focus each → visible `focus-visible:ring`. |
| 3.5 | Aria labels | Inspect each icon button → `aria-label` is set (e.g. "Activity"). No raw "Activity" text rendered. |
| 3.6 | Title vs buttons priority on narrow viewport | At 320px with a long title: title truncates with ellipsis; buttons stay visible on the same row. |

## A11y spot checks (FR-012, SC-004)

- Banner element has `role="img"` and an `aria-label`.
- All decorative icons (inside the title row, inside buttons) have `aria-hidden="true"`.
- Tab through the title row in keyboard: title is not focusable; each visible action button is focusable in left-to-right order; `focus-visible:ring` shows for each.
- Axe DevTools or Lighthouse: no new contrast violations introduced by the change. Title contrast on theme background ≥4.5:1 (light AND dark).

## Removed-features regression check

Verify these are NOT visible anywhere in the header:

- ❌ Member-avatar stack (was bottom-right on the banner)
- ❌ Subspace level badge ("Subspace" / "Sub-subspace" pill) (was top-right on the banner)
- ❌ Parent-avatar tile behind the Subspace avatar (was bottom-left, layered with `-mt-12`)

The Subspace shows a SINGLE 56px avatar inline with its title — no second tile.

## Constitutional checks

- [ ] `pnpm lint` passes — Biome + ESLint + TS (FR-011, SC-006).
- [ ] `pnpm vitest run` passes — no test was depending on member-avatar/badge rendering in a way that breaks now.
- [ ] Grep for new MUI/Emotion imports in touched files: `git diff develop... -- src/crd src/main/crdPages | grep -E '@mui|@emotion'` → no matches.
- [ ] Grep for `useMemo`/`useCallback`/`React.memo` in touched files → no matches (React Compiler does this).
- [ ] Grep for `dayjs` in touched files → no matches (CRD § 7).
- [ ] `pnpm codegen` not required (no GraphQL changes).

## Done = ship

When every row above is checked and a reviewer has compared Space and Subspace side-by-side at three viewports (mobile, desktop, wide), the change is ready to merge.
