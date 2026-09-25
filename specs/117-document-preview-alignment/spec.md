# Feature Specification: Align Document Preview Behaviour with Whiteboard & Memo Previews

**Feature Branch**: `story/9872-file-thumbnail-preview`
**Created**: 2026-08-20
**Status**: Draft
**Input**: User description: "Story #9872 — Align document preview/truncation behaviour with whiteboard & memo previews. The type-differentiated icon/color treatment (spec 116) is shipped. The remaining unchecked AC is: 'Preview/truncation behaviour aligns with the existing whiteboard & memo previews (per #9575).' This means the document contribution cards and their grid behaviour must follow the same patterns already used by whiteboard and memo contributions."

## Context

Spec 116-postcard-file-thumbnail shipped the type-differentiated icon + color
treatment for OfficeDocs framing previews (P1), verified dialog parity (P2),
and added the forward-compatible `framingDocumentPreviewUrl` /
`previewImageUrl` seam (P3). That work closed the first acceptance criterion
of story #9872.

The second, still-open acceptance criterion reads:

> Preview/truncation behaviour aligns with the existing whiteboard & memo
> previews (per #9575).

Two concrete gaps remain between how document contributions behave and how
whiteboard/memo contributions behave on the same surfaces:

1. **Contribution grid "+N more" pattern**: Whiteboard and Memo contributions
   use an overlay-style "+N more" card (a blurred overlay on top of the
   4th-slot contribution, showing a "3 more" count). Document contributions
   instead fall through to a dashed "+N more" placeholder card (the default
   branch for Post-like types). The overlay pattern is the canonical visual
   for image-like/preview-carrying contribution types; Document contributions
   should use it too.

2. **`ContributionDocumentCard` preview image support**: Whiteboard
   contribution cards accept a `previewUrl` prop and render the image full-bleed
   with hover zoom. Document contribution cards render only the type icon — no
   image branch exists. When a real document preview image becomes available
   (the forward-compatible seam from spec 116), the contribution card has no
   mechanism to display it. Adding the image branch now keeps document cards
   aligned with whiteboard cards and makes the eventual preview-image wiring
   a one-line mapper change.

The framing preview (the callout-level preview inside `PostCard` and
`CalloutDetailDialog`) is already aligned — `CalloutCollaboraPreview` already
has the same box-with-content-or-icon pattern as whiteboard and memo framing
previews. No framing-level changes are needed.

## Clarifications

### Session 2026-08-20 (iteration 1)

- **Q (UX / Visual consistency): Should the document contribution "+N more" overlay show the type icon (like the empty-state card) or a preview image (like whiteboards)?**
  **A:** Show the type icon. No preview images exist in production today; the overlay exists only for the "+N more" count and visual consistency. When preview images eventually exist, the overlay should prefer the image (same as whiteboard's `OverlayMoreCard` branch), but that wiring is a future mapper change, not this story.
  **Rationale:** Matches the current production reality (no images) while establishing the correct structural pattern (overlay, not dashed placeholder).

- **Q (Scope): Should the `ContributionDocumentCard` image branch include the hover-zoom animation that `ContributionWhiteboardCard` has?**
  **A:** Yes. The animation is a single Tailwind class (`group-hover/doc:scale-105`) on the `<img>` element, costs nothing, and is what "aligns with whiteboard previews" means visually. Omitting it would be a deliberate divergence from the pattern this AC asks to match.
  **Rationale:** Minimal cost, maximum alignment with the reference behaviour.

- **Q (Data flow): Should the contribution data mapper start populating `previewUrl` for document contributions from a real backend field?**
  **A:** No. No backend field exists yet (same constraint as spec 116's A-001). The `previewUrl` prop is added to the card component and the contribution data type, but the mapper passes `undefined` today. When a backend field ships, only the mapper changes.
  **Rationale:** Mirrors the framing-level strategy (spec 116 P3) — build the seam, not the source.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Document contributions use the overlay "+N more" pattern (Priority: P1)

A member viewing a callout with 5+ document contributions sees the familiar
overlay "+N more" card (blurred overlay on the 4th slot showing a count) — the
same pattern whiteboard and memo contributions already use. Previously,
document contributions showed a dashed placeholder card that looked like the
Post contribution pattern rather than the image-like contribution pattern.

**Why this priority**: This is the most visible remaining alignment gap. Every
callout with more than 3 document contributions displays the wrong "+N more"
pattern today. Fixing it requires only a boolean addition to the grid
connector's type check and one new branch in the overlay-more card, with no
new components or data flow changes.

**Independent Test**: Render `ContributionsPreviewConnector` with a callout
containing 5 document contributions and confirm the 4th slot renders the
overlay pattern (icon + blurred "+2 more" count) rather than a dashed
placeholder card.

**Acceptance Scenarios**:

1. **Given** a callout with `CalloutContributionType.CollaboraDocument` and 5 contributions, **When** the contributions preview renders, **Then** the first 3 contributions show as `ContributionDocumentCard` tiles, and the 4th slot shows an overlay card with a blurred "+2 more" label.
2. **Given** a callout with exactly 4 document contributions, **When** the contributions preview renders, **Then** all 4 render as `ContributionDocumentCard` tiles (the overlay pattern only triggers at >4, matching the `MAX_PREVIEW_ITEMS` threshold).
3. **Given** a callout with 3 or fewer document contributions, **When** the contributions preview renders, **Then** all contributions render as standard `ContributionDocumentCard` tiles with no overlay or dashed card.
4. **Given** the overlay "+N more" card for document contributions, **When** a user clicks it, **Then** the "show all" action fires (same as whiteboard/memo), navigating to the full contribution grid.

---

### User Story 2 - Document contribution card supports a preview image (Priority: P2)

A `ContributionDocumentCard` accepts an optional preview image and, when one
is provided, renders it full-bleed with a hover zoom animation — matching the
`ContributionWhiteboardCard` pattern exactly. When no image is available
(production today), the existing type-icon treatment renders unchanged.

**Why this priority**: No preview images exist in production yet, so no user
sees a visible change today. But adding the image branch now completes the
structural alignment: the contribution card gains the same image-or-icon
pattern the framing preview already has, and a future backend preview field
becomes wirable with only a mapper change.

**Independent Test**: Render `ContributionDocumentCard` with a mock
`previewUrl` and confirm the image renders full-bleed with hover zoom; render
without `previewUrl` and confirm the type-icon treatment renders; simulate an
image load error and confirm graceful fallback to the type-icon.

**Acceptance Scenarios**:

1. **Given** a `ContributionDocumentCard` with a `previewUrl`, **When** it renders, **Then** the image displays full-bleed with `object-cover` sizing and a scale-up animation on hover.
2. **Given** a `ContributionDocumentCard` without `previewUrl` (today's state), **When** it renders, **Then** the type-icon treatment renders unchanged (no visual regression).
3. **Given** a `previewUrl` that fails to load, **When** the image errors, **Then** the card falls back to the type-icon treatment without showing a broken-image glyph.
4. **Given** both `previewUrl` and `documentType`, **When** the card renders with an image, **Then** the title/author gradient footer and the type-icon treatment for the centered fallback both retain the correct document-type accent color.

---

### Edge Cases

- **Zero document contributions**: The contribution section header renders ("Contributions (0)") with no grid tiles; the overlay/dashed distinction is moot.
- **Exactly `MAX_PREVIEW_ITEMS` (4) contributions**: All 4 render as tiles; no overlay triggers. This matches the existing whiteboard/memo threshold.
- **Mixed contribution types on different callouts in the same feed**: Each callout's contribution preview is self-contained; the overlay-vs-dashed decision is per-callout, per-type.
- **Preview image URL present but the image fails to load**: The card falls back to the type-icon treatment. The `OverlayMoreCard` for documents always renders the type icon (no image branch until real images exist), so image-load failure does not affect the overlay.
- **`documentType` is undefined**: The existing `documentType ?? 'text'` fallback in `ContributionsPreviewConnector` handles this; the overlay card uses the same fallback.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The contributions preview grid MUST treat `CalloutContributionType.CollaboraDocument` as an overlay-pattern type (alongside Whiteboard and Memo), rendering the overlay "+N more" card when contributions exceed the preview threshold, instead of the dashed placeholder card.
- **FR-002**: The `OverlayMoreCard` MUST render a document-type branch that shows the centered type icon (from the shared `iconByType` mapping) with the correct accent color as the overlay's background content, matching the empty-state treatment of `ContributionDocumentCard`.
- **FR-003**: `ContributionDocumentCard` MUST accept an optional `previewUrl` prop; when present and loadable, the image MUST render full-bleed with `object-cover` sizing and a hover scale-up animation matching `ContributionWhiteboardCard`.
- **FR-004**: When `previewUrl` is absent or fails to load, `ContributionDocumentCard` MUST render the existing type-icon treatment with no visual regression.
- **FR-005**: The hover "Open Document" overlay and the title/author gradient footer on `ContributionDocumentCard` MUST remain functional regardless of whether the image or the icon branch is active.
- **FR-006**: The contribution data type MUST include an optional `previewUrl` field for document contributions, populated as `undefined` today (no backend source yet), so that wiring a future backend preview field requires only a mapper change.
- **FR-007**: The type-to-visual mapping (icon, color) MUST continue to come from the shared `src/crd/lib/collaboraDocumentPreview.ts` module — no duplicated mapping in new code paths.
- **FR-008**: No new GraphQL query fields, no schema changes, and no new runtime dependencies are required.
- **FR-009**: Existing unit tests for `CalloutCollaboraPreview` and `calloutDataMapper` MUST continue to pass without modification.

### Key Entities *(include if feature involves data)*

- **`ContributionDocumentCard`**: CRD presentational component for a document contribution tile in the contributions grid; gains an optional `previewUrl` prop (image-or-icon pattern, matching `ContributionWhiteboardCard`).
- **`ContributionCardData`**: Data-mapper shape for contribution preview tiles; its existing `previewUrl` field becomes populated for document contributions once a backend source exists.
- **`ContributionsPreviewConnector`**: Integration-layer component that decides the grid layout pattern (overlay vs dashed "+N more"); gains Document in its overlay-pattern type set.
- **`OverlayMoreCard`**: Internal component rendering the "+N more" blurred overlay on the 4th-slot contribution; gains a Document branch showing the type icon.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Document contributions with >4 items display the overlay "+N more" card (not the dashed placeholder), visually matching the whiteboard and memo contribution patterns.
- **SC-002**: `ContributionDocumentCard` renders a preview image when one is provided, with the same full-bleed + hover-zoom treatment as `ContributionWhiteboardCard`, verified via unit test with a mock image URL.
- **SC-003**: When no preview image is provided (today's production state), `ContributionDocumentCard` renders the existing type-icon treatment with zero visual regression — verified by comparison of before/after test snapshots.
- **SC-004**: All existing tests (`pnpm vitest run`) pass clean, with new coverage for the overlay pattern and the image/fallback branch.
- **SC-005**: `pnpm lint` and `pnpm build` pass clean with no new warnings introduced.

## Assumptions

- **A-001**: No backend preview-image generation exists or is attempted. The `previewUrl` prop and data-type field are structural seams for forward compatibility — populated as `undefined` in production today, identical to the spec 116 strategy (A-001/A-002).
- **A-002**: The overlay "+N more" pattern is the correct alignment target for document contributions (matching whiteboard and memo) because document contributions are image-like/preview-carrying types, not text-list types (like Post or Link).
- **A-003**: The framing-level preview (`CalloutCollaboraPreview` in `PostCard` and `CalloutDetailDialog`) is already aligned and requires no changes — this spec addresses only the contribution-grid surfaces.
- **A-004**: The `OverlayMoreCard` document branch intentionally shows the type icon (not a preview image) because no preview images exist in production. When images become available, the overlay should prefer the image (future mapper change, not this spec).
