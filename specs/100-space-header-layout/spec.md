# Feature Specification: Space & Subspace Header Layout — Full-Width Banner with Title Below

**Feature Branch**: `100-space-header-layout`
**Created**: 2026-05-14
**Status**: Draft
**Input**: User description: "Changes to banner and title placement in a Space and Subspace (both have the same look). The new look: banner is full-width edge-to-edge; content has the same inner width as today (unchanged); title and subtitle are placed BELOW the banner (not on top of it); action buttons that were previously on top of the banner are now on the RIGHT side of the title row, at the far right end of the content placement. Apply to both Space and Subspace. Reference the prototype for these specific changes only — ignore other prototype changes. This design is not present in MUI; update the CRD layer accordingly. Follow `src/crd/CLAUDE.md` for CRD migration practice."

## Visual fields — canonical usage (project-wide rule)

The platform stores up to **three separate visual fields** on a space/subspace profile, each with a **distinct semantic role**. They MUST NEVER be substituted for each other (no "show cardBanner where avatar would go" fallbacks, no "show avatar where cardBanner would go" inversions).

**Critical: L0 has no avatar concept.** L0 spaces have only a page banner and a card banner — there is no L0 avatar, and L0 cards display **title + cardBanner**, never an avatar. L1 and L2 subspaces have an avatar and a card banner; they have no settable page banner and inherit the L0 root's.

| Field | Settable on | Used for |
|-------|-------------|----------|
| `banner` (Visual type `BANNER`, ~1920×320) | **L0 only** | The full-width page banner on a space's page layout — on top of the L0 page, **and** on top of L1/L2 pages (which inherit it from the L0 root of their ancestry chain). |
| `cardBanner` (Visual type `CARD`, ~416×256) | **L0, L1, L2** | The big banner image on every space/subspace **card** display (explorer cards, subspace grid cards, hierarchy cards). |
| `avatar` (Visual type `AVATAR`) | **L1 and L2 only** | The small inset image for an L1/L2. Used in the L1/L2 page header (inline next to the title) and in any list-style display of an L1/L2 (sidebar lists, admin Subspaces rows, notification icons, activity-item icons). |

**Canonical compositions:**

- **L0 page header** → `banner` + title (no avatar).
- **L0 card** (everywhere an L0 is shown as a card) → `cardBanner` + title (no avatar).
- **L0 in a list/small entry** → title only (no avatar, no cardBanner thumbnail). L0 is a top-level space — its small-entry representation is text-only.
- **L1/L2 page header** → `banner` (inherited from the **L0 root**, not the immediate parent for L2) + inline `avatar` + title.
- **L1/L2 card** → `cardBanner` + `avatar` + title.
- **L1/L2 in a list/small entry** → `avatar` + title.

**Hard rules:**

1. Do not use `cardBanner` as a fallback for `avatar` (and vice versa). They have different aspect ratios, different sizes, and different semantics. A missing `avatar` falls back to the deterministic default-avatar visual (`getDefaultSpaceVisualUrl(VisualType.Avatar, spaceId)` in MUI, or the colour-from-id gradient in CRD) — **never** to `cardBanner`.
2. Do not source the L1/L2 page banner from the immediate parent when L0 differs. For an L2, the immediate parent is L1 (which does not have a settable page banner); the page banner MUST come from the L0 root.
3. L0 settings UI MUST expose uploaders for `banner` (page) and `cardBanner` only — **not** avatar. L1/L2 settings UI MUST expose `avatar` and `cardBanner` only — **not** the page banner.
4. List/small-entry renderers that may be passed an L0 should suppress the avatar slot for L0. Components that currently render a generic placeholder for "L0 without avatar" are acceptable for now but should ideally hide the avatar entirely when the entity is an L0.

This rule applies to **both** the MUI legacy layer (`src/core/ui/`, `src/domain/space/`) and the CRD layer (`src/crd/`, `src/main/crdPages/`). It is project-wide and predates this spec — this spec only codifies it because the spec's page-banner decisions (A7a) depend on it, and several existing MUI substitution bugs were found while implementing this spec (`SubspaceLinkList`, `SpaceCardHorizontal`, `InAppNotificationBaseView`, `MyLatestContributions`, `useSubspaceCardData`, `useParentSpaceInfo` — all fixed in this branch).

## Clarifications

### Session 2026-05-14

- Q: Banner height — keep current fixed heights, adopt prototype's `aspectRatio: 6/1` fluid height, or adopt the full prototype treatment (fluid + `-64px` underlap into a transparent platform header)? → A: Adopt `aspectRatio: 6/1` fluid height **without** the `-64px` header underlap. The transparent-header underlap is deferred to a separate adjacent spec.
- Q: Subspace avatar treatment — keep the current two-tile layered avatar (parent-behind-subspace with `-mt-12` upward overlap into the banner), simplify to a single subspace avatar inline with the title (prototype style), or keep both tiles but with no upward overlap? → A: Simplify to a **single subspace avatar (~56px)** inline with the title row, no parent tile, no upward overlap into the banner. Parent identity is conveyed by the parent banner image still being used as the banner background.
- Q: Member avatar stack placement — keep on the title row alongside buttons, move to subtitle row, place on a new row below, or remove from the header entirely? → A: **Remove the member-avatar stack from the header.** Member access is provided only through the dedicated members panel. This simplifies the title and subtitle rows and lets the action buttons own the right edge cleanly.
- Q: Subspace "Subspace" / "Sub-subspace" level badge — inline before title, kicker above title, inline after title, or remove? → A: **Remove the level badge from the header.** Breadcrumbs already convey the subspace / sub-subspace context, so the badge is redundant. The `badgeKind` prop becomes unused.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor sees a full-width, edge-to-edge banner on a Space or Subspace (Priority: P1)

A visitor opens any Space or Subspace page. The banner image (or its fallback colour gradient) spans the full width of the viewport — there is no horizontal padding, gutter, or content margin clipping the banner on either side. Inner content below the banner (sidebar, tabs, body) keeps its existing inner width unchanged.

**Why this priority**: The full-width banner is the most visible part of the new look. Without it, the page still reads like the existing constrained layout. Shipping this slice alone delivers an immediate visual improvement on both routes.

**Independent Test**: Open a Space page and a Subspace page on a wide viewport (≥1440px), a mid viewport (≥768px), and a mobile viewport (<768px). The banner stretches edge-to-edge in all three on both pages. Inner content (sidebar, tabs, body) remains at the existing inner width and is byte-identical to today.

**Acceptance Scenarios**:

1. **Given** a Space with a banner image, **When** a visitor opens the Space page on a 1920px viewport, **Then** the banner image extends from the left edge to the right edge of the viewport with no horizontal padding or gutter.
2. **Given** a Subspace with a parent banner image, **When** a visitor opens the Subspace page, **Then** the banner image renders edge-to-edge in the same way as the Space banner.
3. **Given** a Space or Subspace without a banner image, **When** a visitor opens the page, **Then** the deterministic colour-gradient fallback (currently used when `bannerUrl` / `parentBannerUrl` is missing) renders edge-to-edge in the same banner region.
4. **Given** any Space or Subspace page, **When** the visitor scrolls past the banner, **Then** inner content sits inside the existing inner content width (the 12-column grid `lg:col-start-2 / lg:col-span-10` provided by `SpaceShell`) — unchanged from today.

---

### User Story 2 - Visitor sees title and subtitle BELOW the banner on a Space or Subspace (Priority: P1)

The title and subtitle/tagline appear in their own row directly below the banner — no longer overlaid on top of the banner image. They sit inside the inner content width and read in normal theme text (dark in light mode, light in dark mode), not the white-on-photo treatment used today.

**Why this priority**: This is the second half of the visual repositioning. Together with US1 it forms the new header pattern; without it, the banner has no readable identity below it. Required for both Space and Subspace to look identical.

**Independent Test**: Inspect a Space and a Subspace page. Title renders below the banner using the `text-hero` typography token; subtitle renders below the title using the `text-body` token. Both pages match in placement and typography.

**Acceptance Scenarios**:

1. **Given** a Space page, **When** the page renders, **Then** the title and subtitle appear in a section directly below the banner, with the title above the subtitle, both inside the inner content width.
2. **Given** a Subspace page, **When** the page renders, **Then** the title and subtitle appear in the same below-banner section, in the same inner content width, with the same vertical relationship to the banner as the Space page.
3. **Given** a Space or Subspace page viewed side-by-side, **When** comparing them, **Then** the title/subtitle placement is visually identical (same offset from banner, same alignment with inner content, same typography tokens).
4. **Given** any Space or Subspace page, **When** the page is rendered, **Then** the title uses the `text-hero` semantic typography token and the subtitle uses the `text-body` token (per `src/crd/CLAUDE.md` § 8) — confirming the title remains the visual hero of the page.

---

### User Story 3 - Visitor accesses action buttons on the right side of the title row (Priority: P2)

The action buttons that previously sat on top of the banner (Activity, Video Call, Share, Settings) move to the right end of the title row. They are aligned to the far right edge of the inner content width — the same right edge as the body content below.

**Why this priority**: Action buttons are functionally available today (overlaid on the banner). Repositioning them is a polish step that finalises the new layout but does not change feature availability. P1 stories can ship without it; in the interim buttons would temporarily render below or beside the title until this slice lands.

**Independent Test**: On a Space or Subspace page, the Activity / Video / Share / Settings icon buttons render at the far right of the title row, vertically aligned with the title text. The right edge of the rightmost button aligns with the right edge of the inner content (the same right edge as page body content below).

**Acceptance Scenarios**:

1. **Given** a Space with all four action buttons available, **When** the page renders, **Then** all four buttons appear in a horizontal group on the right of the title row, with their right edge aligned to the inner content's right edge.
2. **Given** a Space with only some action buttons available (e.g., the user lacks settings permission), **When** the page renders, **Then** only the available buttons render in the same row, and the visible group stays right-aligned at the same inner-content right edge.
3. **Given** a Space or Subspace page, **When** the viewport is narrow enough that the title is long, **Then** the title truncates with ellipsis so the action buttons stay visible and on the same row (buttons take precedence over title overflow).
4. **Given** a Space and a Subspace, **When** the two pages are compared, **Then** the action button row placement is visually identical.

---

### Edge Cases

- **No banner image**: The deterministic colour-gradient fallback (already used by `SpaceHeader` / `SubspaceHeader` when `bannerUrl` / `parentBannerUrl` is missing) renders in the full-width banner region. No visual regression versus the current fallback treatment.
- **Long title**: The title truncates with ellipsis inside the title cell; the action buttons remain visible and right-aligned. The subtitle truncates by the existing rule (`truncate` class today) or wraps — final wrap-vs-truncate decision is design-led during implementation.
- **Missing subtitle/tagline**: The subtitle row is hidden; the title row + buttons row remains, and the below-banner section collapses to the title-only height.
- **No action buttons visible** (user has no permission for any action AND no member-avatar stack to show): The right side of the title row is empty; the title fills the row width.
- **Subspace level badge removed**: The "Subspace" / "Sub-subspace" pill currently overlaid `top-4 right-4` on the banner is removed from the header entirely. Breadcrumbs already convey the subspace / sub-subspace context, so the badge is redundant.
- **Subspace single avatar**: The Subspace identity now uses a single ~56px avatar inline with the title row (no parent tile, no upward overlap into the banner). When the subspace avatar image is missing, the existing deterministic colour-fallback applies. Parent identity is conveyed by the parent banner image being used as the banner background.
- **Member avatar stack removed from the header**: The clickable avatar cluster currently overlaid bottom-right on the banner is removed from the header entirely. Visitors access the members of the community through the dedicated members panel, not from the header. This eliminates one visual element from the title/subtitle rows and lets the action buttons own the right edge cleanly.
- **Mobile viewport (<768px)**: The banner stays full-width. The title row keeps the action buttons on the same row as the title at every breakpoint, per FR-008 — the title truncates with ellipsis when it would otherwise push the buttons out of view. Space and Subspace remain visually consistent at every breakpoint.
- **Dark mode**: Below-banner text uses `text-foreground` and `text-muted-foreground` (not the white-on-banner colour used today), so contrast is governed by the theme — no dark-mode-specific styling required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The Space page banner MUST render edge-to-edge across the full viewport width on all viewport sizes (mobile, tablet, desktop, wide).
- **FR-002**: The Subspace page banner MUST render edge-to-edge across the full viewport width on all viewport sizes, identical in width treatment to the Space banner.
- **FR-003**: The inner content width below the banner (sidebar + body, or full body when no sidebar) MUST remain unchanged from today — the existing 12-column grid `lg:col-start-2 / lg:col-span-10` provided by `SpaceShell` is the authoritative inner width.
- **FR-004**: Title and subtitle for both Space and Subspace MUST appear in a section directly below the banner, inside the inner content width, and not overlaid on top of the banner image.
- **FR-005**: Title MUST use the `text-hero` semantic typography token; subtitle MUST use the `text-body` token (per `src/crd/CLAUDE.md` § 8).
- **FR-006**: Action buttons (Activity, Video Call, Share, Settings; subset shown per available permissions) MUST appear on the right side of the title row, aligned to the inner content's right edge.
- **FR-007**: The Space and Subspace headers MUST be visually identical in banner width, title/subtitle placement, and action button placement.
- **FR-008**: When the title overflows horizontally, the title MUST truncate with ellipsis while the action buttons remain visible on the same row.
- **FR-009**: When no banner image is provided, the existing deterministic colour-gradient fallback MUST render in the full-width banner region; no new fallback treatment is introduced.
- **FR-009a**: The banner MUST use `aspect-ratio: 6 / 1` so its height scales fluidly with viewport width. Today's fixed `h-[256px]` (Space) and `h-52 md:h-64` (Subspace) are replaced.
- **FR-009b**: Both headers MUST accept an `overlayHeader?: boolean` prop. When the consumer page wants the banner to slide under the transparent platform header (the nav-rework feature, PR #9666), it sets `overlayHeader={true}` and the header wrapper gains `-mt-16`. The two designs are orthogonal: this spec owns banner-and-content layout (title below banner, buttons in title row), the nav-rework spec owns the header-over-banner / sticky-on-scroll behaviour. The two coexist on the same page.
- **FR-010**: The change MUST live entirely in the CRD layer (`src/crd/components/space/SpaceHeader.tsx`, `src/crd/components/space/SubspaceHeader.tsx`, and their consumers in `src/main/crdPages/`). No MUI page or component is modified, since this layout does not exist in MUI.
- **FR-011**: The updated CRD components MUST continue to comply with the golden rules in `src/crd/CLAUDE.md` — no MUI imports, no business logic, no GraphQL types in props, props remain plain TypeScript, event handlers remain props, Tailwind-only styling, and no manual `useMemo` / `useCallback` / `React.memo` (React Compiler).
- **FR-012**: All accessibility behaviour from today MUST be preserved or improved — banner `role="img"` + `aria-label`, icon-only buttons with `aria-label`, decorative icons `aria-hidden`, visible `focus-visible:ring` indicators, and WCAG 2.1 AA contrast (which is strictly easier to achieve below-banner since text is no longer over a photo).
- **FR-013**: Several existing props become unused as a result of the layout change:
  - `SubspaceHeader`: `parentInitials` and `parentColor` are no longer used (parent identity comes only from `parentBannerUrl` as the banner background).
  - `SubspaceHeader`: `badgeKind` is no longer used (the level badge is removed from the header; breadcrumbs convey the same information).
  - Both headers: `memberAvatars` and `onMemberClick` are no longer used (the member-avatar stack is removed from the header entirely).
  Each of these may be removed from the prop type in this change or kept as accepted-but-ignored. Consumers in `src/main/crdPages/` stop passing them either way. All other existing props (`title`, `tagline`, `bannerUrl`, `color`, `isHomeSpace`, `actions`, `parentBannerUrl`, `subspaceInitials`, `subspaceColor`, `subspaceAvatarUrl`) carry over unchanged.

### Key Entities

This is a presentational layout change — no new data entities or props are introduced. Existing props on `SpaceHeader` (`title`, `tagline`, `bannerUrl`, `color`, `isHomeSpace`, `actions`) and `SubspaceHeader` (`title`, `tagline`, subspace identity, `parentBannerUrl`, `actions`) remain. Their meaning is unchanged; only their visual arrangement changes. Props made unused by this change (`memberAvatars`, `onMemberClick`, `SubspaceHeader.parentInitials`, `SubspaceHeader.parentColor`, `SubspaceHeader.badgeKind`) are governed by FR-013.

## Assumptions

These fill gaps in the brief by drawing on the prototype and `src/crd/CLAUDE.md`. Any of them can be overridden in `/speckit.clarify`.

- **A1 — Inner width is the SpaceShell grid.** The "inner content width" is the existing `lg:col-start-2 / lg:col-span-10` inside the 12-column grid that `SpaceShell` already enforces. No new width token is introduced.
- **A2 — Title and buttons share one row.** The prototype shows the title on its own row (no buttons in the prototype's header file), but the brief explicitly places the buttons on the right side of the title row. We follow the brief: title left, buttons right, single row; subtitle on a second row directly below.
- **A3 — Action button styling switches from white-on-banner to neutral.** With buttons no longer overlaid on the banner, the current white-icon-on-translucent-dark styling is no longer appropriate. Buttons adopt the standard `Button variant="ghost" size="icon"` neutral CRD treatment used elsewhere below the banner. Icons and `aria-label`s are unchanged.
- **A4 — Title text colour switches from `text-primary-foreground` (white) to `text-foreground` (theme-aware).** Title and subtitle are no longer over a photographic background, so they use the standard theme text tokens.
- **A5 — Member avatar stack is removed from the header** (clarified 2026-05-14). The currently bottom-right overlaid avatar cluster on the banner is dropped from `SpaceHeader` and `SubspaceHeader` entirely. Visitors access community members through the dedicated members panel rather than from the header. The `memberAvatars` and `onMemberClick` props become unused — they can be removed in this change or kept as accepted-but-ignored. Consumers in `src/main/crdPages/` stop passing them.
- **A6 — Subspace level badge is removed from the header** (clarified 2026-05-14). The "Subspace" / "Sub-subspace" pill currently overlaid `top-4 right-4` on the banner is dropped entirely. Breadcrumbs upstream of the header already disclose the subspace / sub-subspace hierarchy, so the badge is redundant. The `badgeKind` prop on `SubspaceHeader` becomes unused (can be removed or kept as accepted-but-ignored).
- **A7 — Subspace avatar simplifies to a single tile** (clarified 2026-05-14). The current two-tile layered avatar (parent behind, subspace in front, `-mt-12` upward overlap into the banner) is replaced by a single ~56px subspace avatar inline with the title row, matching the prototype's `SubspaceHeader.tsx`. The `-mt-12` upward-overlap pattern is removed; the avatar sits cleanly in the below-banner section alongside the title and subtitle.
- **A7a — Subspace page banner uses the L0 root's banner image** (final decision). Per the "Visual fields — canonical usage" rule above, the subspace page banner is sourced from `levelZeroProfile.banner?.uri` (the L0 ancestor's BANNER visual, stored at page-banner resolution ~1920×320). For an L1, the L0 ancestor is the immediate parent; for an L2 (sub-sub-space), the L0 ancestor is the grandparent — *not* the immediate L1 parent (L1 has no settable page banner). The subspace's own `cardBanner` is **not** used because cardBanner is 416×256 (sized for cards) and would be visibly blurry stretched to a full-width banner. When the L0 root has no banner uploaded, the deterministic gradient fallback uses the L0's colour (`pickColorFromId(levelZeroSpaceId)`). Subspace identity is conveyed via the breadcrumb trail, the inline ~56 px subspace avatar in the title row, and the subspace title and tagline. **Iteration history**: an interim attempt to source from the subspace's own image produced unacceptable blur; a follow-up that used the *immediate* parent (instead of L0) failed on L2 because L1 has no banner. The L0-rooted lookup matches the legacy MUI `SubspacePageBanner.tsx` (`lookup.level0Space.about.profile.banner`). A future platform change that exposes a high-res BANNER visual type on L1/L2 subspaces could let this assumption be revisited.
- **A8 — Banner height is fluid via `aspectRatio: 6 / 1`** (clarified 2026-05-14). The banner scales with viewport width — wider viewports get a proportionally taller banner. This replaces today's fixed `h-[256px]` (Space) and `h-52 md:h-64` (Subspace).
- **A8a — Transparent-header underlap is now wired** (post-merge with PR #9666 "nav-rework"). The adjacent spec PR #9666 added a transparent platform-header mode (`BannerOverlayContext` + `useEnableBannerOverlay`) and an `overlayHeader` prop on both headers. Where my spec originally deferred the underlap, it is now integrated: when the consumer page opts in (`enableBannerOverlay = visibilityData.status === 'active' && !isOnSettings`) the wrapper gains `-mt-16` and the banner slides under the transparent nav. On scroll the nav becomes solid/sticky. The two specs are orthogonal — this spec owns "what's in the banner + content layout"; the nav-rework spec owns "how the platform header treats the banner area". The `-mt-16` is simpler here than in the original (pre-this-spec) design because there are no in-banner buttons or level badge to push down by `pt-24` / `top-20` — the only thing inside the banner div is the image/gradient.
- **A9 — CRD routes only.** Both routes (`SpacePage` and `SubspacePage` under `src/crd/app/pages/` and their `src/main/crdPages/` integrations) are affected; no MUI route is touched. The `useCrdEnabled` toggle continues to route legacy users to MUI pages, which are unchanged.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of Space and Subspace pages render the banner edge-to-edge at viewport widths 320px, 768px, 1024px, 1440px, and 1920px, with no horizontal clipping, padding, or gutter on the banner.
- **SC-002**: 100% of Space pages and Subspace pages display title and subtitle below the banner (not overlaid). Visual diff between Space and Subspace title rows shows identical placement (same vertical offset from the banner and same horizontal alignment inside the inner content width).
- **SC-003**: Action buttons, when visible, render on the right side of the title row in 100% of Space and Subspace pages. The right edge of the rightmost action button aligns with the right edge of the inner content (the same right edge as the sidebar/body grid column).
- **SC-004**: Title and subtitle text contrast meets WCAG 2.1 AA (≥4.5:1) on every supported background and in both light and dark themes — measurable since the text now sits on the theme background rather than a variable photograph. This is a strict improvement over the current overlay treatment.
- **SC-005**: Zero pixel change to inner content width between today and the new layout (verified by inspecting a Space page before and after the change at the same viewport — sidebar width and body width are byte-identical).
- **SC-006**: Zero new dependencies on MUI or Emotion are introduced. `pnpm lint` passes; no `@mui/*` or `@emotion/*` imports appear in any file touched by the change.
- **SC-007**: Both pages (Space and Subspace) pass a side-by-side visual review confirming identical header layout (banner width, banner aspect ratio, title placement, subtitle placement, and action button placement).
