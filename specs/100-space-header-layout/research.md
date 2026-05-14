# Phase 0 Research: Space & Subspace Header Layout

All four `[NEEDS CLARIFICATION]` markers were resolved during `/speckit.clarify`. This document captures the remaining technical research needed to lock the implementation approach.

## R1 — `aspect-ratio: 6 / 1` in Tailwind v4

**Decision**: Use `aspect-[6/1]` (arbitrary-value variant) on the banner `<div>`. Drop the existing `h-[256px]` / `h-52 md:h-64` fixed heights.

**Rationale**:
- Tailwind v4's `aspect-[6/1]` compiles to `aspect-ratio: 6 / 1` — native CSS, no JS, no observer.
- `aspect-ratio` is at 96.4% global support (caniuse, May 2026) — well above the project's 90% bar. Safari ≥15, Chrome ≥88, Firefox ≥89, all Edge.
- With `w-full` on the same element, height is derived from width — banner scales smoothly as the viewport widens. At 320px → ~53px tall; at 1024px → ~171px; at 1920px → 320px tall.
- Replaces the current fixed heights (256px on Space, 208/256px on Subspace) — confirmed by clarification Q1.

**Alternatives considered**:
- *Keep fixed heights*: rejected by Q1 (user chose option B).
- *Adopt the prototype's full treatment with `-64px` underlap into a transparent platform header*: rejected by Q1 (option C explicitly deferred to a separate next spec).
- *Use CSS `padding-bottom: 16.66%` hack* (the pre-`aspect-ratio` polyfill): unnecessary — `aspect-ratio` has sufficient browser support.

**Notes**:
- On mobile (<320px width), the banner becomes very short (≤53px). This is acceptable because the prototype assumes the same fluid behaviour. If product later wants a `min-height` floor on mobile, that's a tweak (`aspect-[6/1] min-h-32` or similar) — not in scope for this spec.

## R2 — Where exactly the banner gets `w-full` to reach the viewport edge

**Decision**: No structural escape needed. The banner is already rendered outside any `px-6 md:px-8` padded parent.

**Rationale**: Investigation confirmed:
- `SpaceShell.tsx` renders `{header}` *outside* its padded content `<div>` (line 18, before the `px-6 md:px-8` wrapper at line 20). So `<SpaceHeader>` placed in the `header` prop is unconstrained.
- `CrdLayout.tsx` (the platform shell) wraps content in `<div className="crd-root flex min-h-screen flex-col bg-background text-foreground">` — no horizontal padding.
- `CrdSubspacePageLayout.tsx` mounts `<SubspaceHeader>` directly inside a `<div className="flex flex-col bg-background min-h-screen">` — no horizontal padding either; padding (`px-6 md:px-8`) lives only on the content `<main>` below.
- `SubspacePage.tsx` (standalone) mirrors this: `<div className="min-h-screen bg-background flex flex-col"><SubspaceHeader />…</div>`.

The banner `<div>` inside both header components is already `w-full`. We keep that, drop the fixed height, add `aspect-[6/1]`.

**Alternatives considered**:
- *Full-bleed escape via `w-screen ml-[calc(50%-50vw)]`*: would be needed if the banner were inside a padded parent; it isn't, so we don't introduce the trick.
- *Move banner out of the component into the page shell*: rejected. Keeps the design system primitive responsible for its own visual contract; consumers shouldn't need to know about banner-vs-content separation.

## R3 — Title row layout: title left, buttons right, on a single row, with truncation rules

**Decision**: A 12-column grid row inside `lg:col-start-2 / lg:col-span-10`, with the title in a `min-w-0 flex-1` cell and the action buttons in a `shrink-0 flex items-center gap-2` cell, both inside a parent `flex items-center justify-between gap-4`. Title uses Tailwind `truncate` so overflow ellipses; buttons stay visible (FR-008).

**Rationale**:
- `flex items-center justify-between gap-4` keeps title left and buttons right; vertical alignment matches the `text-hero` baseline.
- `flex-1 min-w-0` on the title cell is the canonical CSS recipe to allow `truncate` to work inside a flex parent — without `min-w-0`, the title would push the buttons off-screen on narrow viewports.
- `shrink-0` on the button group prevents the buttons from being compressed.
- Subspace adds a leading `shrink-0` avatar (56px) before the title (a third flex child); flex order: avatar → title → buttons.

**Alternatives considered**:
- *CSS grid 3-column layout*: rejected. Flex is simpler for this row; grid offers no advantage when we have a deterministic three-element layout with one greedy middle cell.
- *Stack buttons under title at narrow viewports*: rejected for v1. The spec's FR-008 is explicit: buttons stay visible, title truncates. We can revisit if user testing surfaces issues.

## R4 — Subtitle row: truncate or wrap?

**Decision**: Truncate on a single line (`truncate` class), matching the current Subspace behaviour. Same on Space.

**Rationale**:
- Today both prototypes and current CRD use `truncate` on the tagline; preserving this avoids reflow surprises.
- A long tagline that wraps to multiple lines would push the action button cell down or break visual parity between Space and Subspace.
- If product later wants two-line wrap, this is a one-class change (`line-clamp-2`) — not blocking.

**Alternatives considered**:
- *Two-line `line-clamp-2`*: keeps more content visible but breaks vertical rhythm with the buttons row.
- *No truncate (full wrap)*: would push subtitle to arbitrary heights — visually inconsistent.

## R5 — Removing markup and i18n keys for dropped features

**Decision**: Remove the JSX and prune i18n keys whose strings are only referenced by removed JSX. Keep the prop type fields as deprecated-but-accepted in v1 (with a comment) to avoid forcing a breaking refactor in the consumers; consumers stop passing them.

**Rationale**:
- Removed markup: member-avatar stack, layered parent-avatar tile (Subspace), level badge (Subspace), all banner-overlay rows for title/tagline/buttons.
- i18n keys to audit and remove if confirmed orphaned:
  - `crd-subspace`: `badge.subspace`, `badge.subSubspace`, `a11y.parentLink`, `members.viewCommunity` (member-stack aria-label)
  - `crd-space`: `members.title` (member-stack aria-label)
- Prop fields to mark unused (FR-013 governs): `memberAvatars`, `onMemberClick`, `SubspaceHeader.badgeKind`, `SubspaceHeader.parentInitials`, `SubspaceHeader.parentColor`. We *will* remove these in v1 since CRD § 4 (props are plain TS) and ISP both favour a minimal interface. The consumers in `src/main/crdPages/` are within the same PR scope and will be updated.

**Alternatives considered**:
- *Keep props as accepted-but-ignored*: would leave dead surface area indefinitely. Rejected.
- *Defer prop removal to a follow-up PR*: adds churn without benefit. Rejected.

## R6 — Avatar fallback (gradient) on the now-fluid banner

**Decision**: Keep the existing fallback. When `bannerUrl` / `parentBannerUrl` is missing, the deterministic gradient from `pickColorFromId` renders in the same `aspect-[6/1]` div — no change to fallback logic, only to host height.

**Rationale**:
- `pickColorFromId` is already used (see CRD § Deterministic Accent Colors). It produces a 135deg gradient that looks good at any aspect ratio.
- The fallback test in current SpaceHeader (line 67–73) already gates on `!bannerUrl && !color` for the muted bg — keep that logic intact.

**Alternatives considered**:
- *Add a placeholder image*: rejected; the deterministic gradient is the project's chosen fallback (CRD § Deterministic Accent Colors).

## R7 — Standalone preview app vs main app

**Decision**: Update both paths in lockstep. Standalone pages in `src/crd/app/pages/SpacePage.tsx` and `SubspacePage.tsx` get their mock data trimmed (drop `memberAvatars` etc.). Main-app integration in `src/main/crdPages/space/layout/CrdSpacePageLayout.tsx` and `src/main/crdPages/subspace/layout/CrdSubspacePageLayout.tsx` stops passing the same props.

**Rationale**:
- Both surfaces must build to keep the standalone designer-preview app (`pnpm crd:dev`) usable.
- Standalone is the fastest visual review loop for this change.

**Alternatives considered**:
- *Update only the main app first*: would break `pnpm crd:dev`. Rejected.

## R8 — Visual regression evidence for SC-005 (byte-identical inner width)

**Decision**: Manual side-by-side screenshots at viewport widths 320, 768, 1024, 1440, 1920 — before and after, on both Space and Subspace. Capture the sidebar width (px) and main-body content width (px) using DevTools and assert no change.

**Rationale**:
- The `lg:col-start-2 / lg:col-span-10` grid is the inner-width token. We don't touch `SpaceShell.tsx`, so any drift would be a bug, not a design choice.
- A screenshot diff at the inner-content level is the cheapest, most reliable check for "did we accidentally change the gutter".

**Alternatives considered**:
- *Add a Playwright/Storybook visual-regression suite*: out of scope for this spec — the project doesn't have one set up. The manual check is sufficient for a layout-only PR.
- *Trust types alone*: insufficient — width is a runtime CSS outcome, not a typed contract.

## Open questions (post-research)

None. All technical decisions are pinned. Implementation may begin from this plan + tasks.

## Performance note

This change *reduces* DOM (removes 2 stacked-avatar `<button>`s + 5 `<Avatar>` children on Space, plus the same on Subspace, plus the parent-tile `<div>` and the level-badge `<Badge>` on Subspace) and removes one absolute-positioning layer. Net effect on initial paint is neutral-to-positive. React Compiler handles memoisation; no manual hooks introduced.
