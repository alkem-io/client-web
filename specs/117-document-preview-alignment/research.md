# Research: Document Preview Alignment

**Feature**: 117-document-preview-alignment
**Date**: 2026-08-20

## R1: Overlay Pattern Inclusion for Document Contributions

**Question**: How does `ContributionsPreviewConnector` determine which contribution types use the overlay "+N more" card vs the dashed placeholder?

**Finding**: The `usesOverlayPattern` boolean on line ~247 of `ContributionsPreviewConnector.tsx`:
```
const usesOverlayPattern =
    contributionType === CalloutContributionType.Whiteboard || contributionType === CalloutContributionType.Memo;
```
Adding `|| contributionType === CalloutContributionType.CollaboraDocument` is the one-line change. The overlay branch (lines 249-273) renders `visibleItems` as `ContributionCard` tiles plus an `OverlayMoreCard` for the 4th slot.

**Decision**: Add `CollaboraDocument` to the `usesOverlayPattern` check.
**Rationale**: Document contributions are image-like/preview-carrying (same category as Whiteboard/Memo), not text-list (Post/Link).
**Alternatives**: None considered — this is a boolean flag addition.

## R2: OverlayMoreCard Document Branch

**Question**: What does `OverlayMoreCard` need to render for document contributions?

**Finding**: `OverlayMoreCard` currently has two content branches:
- `showImage` (Whiteboard): renders the last contribution's `previewUrl` as a full-bleed `<img>`.
- `showMemoPreview` (Memo): renders `CroppedMarkdown` from the last contribution's `markdownContent`.

For documents, neither branch applies (no preview image in production, no markdown content). A new branch renders the type icon (from `iconByType`) with the accent color (from `colorByType`), matching `ContributionDocumentCard`'s empty-state treatment.

**Decision**: Add a `showDocumentIcon` branch that renders `Icon` from `iconByType[documentType]` centered in the card.
**Rationale**: Matches the existing empty-state pattern of `ContributionDocumentCard` and requires only imports from the shared `collaboraDocumentPreview.ts` module (FR-007).
**Alternatives**: Could render nothing (just the overlay) — rejected because it looks like a broken card.

## R3: ContributionDocumentCard Image Branch

**Question**: What structural changes does `ContributionDocumentCard` need for the `previewUrl` prop?

**Finding**: `ContributionWhiteboardCard` is the reference implementation:
- Accepts optional `previewUrl?: string`
- Image branch: `<img src={previewUrl} alt={title} className="w-full h-full object-cover transition-transform duration-500 group-hover/wb:scale-105" />`
- Icon branch: `<div className="w-full h-full flex items-center justify-center"><Presentation .../></div>`
- Both branches share the hover overlay and gradient footer.

`ContributionDocumentCard` needs the same structure. The image error fallback uses `useState` to track a failed URL (same pattern as `CalloutCollaboraPreview`'s `erroredUrl`).

**Decision**: Add optional `previewUrl` prop to `ContributionDocumentCard`. Render image when present and loadable; fall back to type icon on absence or load error. Include `group-hover/doc:scale-105` on the image.
**Rationale**: Exact structural parity with `ContributionWhiteboardCard`, using the existing error-fallback pattern from `CalloutCollaboraPreview`.
**Alternatives**: Could omit error handling — rejected because broken-image glyphs are a poor UX.

## R4: i18n Impact

**Question**: Are any new translation keys needed?

**Finding**: No new user-visible strings are introduced. The "Open Document" label already exists in the `crd-space` namespace (`callout.openDocument`). The `OverlayMoreCard`'s label comes from `t('callout.moreContributions', { count })`, which already exists. The document type labels already exist in `collaboraDocumentPreview.ts`'s `typeLabelKey` mapping.

**Decision**: No new i18n keys.
**Rationale**: All strings are reused from existing keys.
**Alternatives**: N/A.

## R5: Test Infrastructure

**Question**: What test patterns exist for the contribution card components?

**Finding**: `CalloutCollaboraPreview` has both `.test.tsx` (vitest/jsdom) and `.spec.tsx` (vitest/jsdom with more thorough scenario coverage) files. `ContributionDocumentCard` has no tests currently. `PostCard.test.tsx` and `CalloutPostPreview.test.tsx` demonstrate the testing patterns: render with `@testing-library/react`, assert on DOM content via `screen.getByText`/`screen.getByRole`, and use `fireEvent` or `userEvent` for interactions.

**Decision**: Add a `ContributionDocumentCard.test.tsx` file covering the image/fallback branches.
**Rationale**: SC-002 and SC-003 require unit test verification of these branches.
**Alternatives**: Could test only via integration tests in `ContributionsPreviewConnector` — rejected because the card is a pure CRD component and should have its own unit coverage.
