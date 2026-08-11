# Phase 0 Research: Render File Thumbnail / Preview in Post Cards

**Feature**: 116-postcard-file-thumbnail | **Story**: alkem-io/client-web#9872

All unknowns were resolved from the existing codebase and the two linked upstream issues
(alkem-io/alkemio#1673, alkem-io/client-web#9575) — no external research needed, no new
dependency evaluated or introduced.

## R1 — Why not build a real rendered thumbnail now (the literal "preview" reading)?

- **Decision**: Not attempted in this story. Deliver the type-differentiated icon+color
  treatment (P1/P2) plus a forward-compatible `previewImageUrl` seam (P3) instead.
- **Evidence**: `VisualType` (`src/core/apollo/generated/graphql-schema.ts`) enumerates
  `AVATAR, BANNER, BANNER_WIDE, CARD, MEDIA_GALLERY_IMAGE, MEDIA_GALLERY_VIDEO,
  WHITEBOARD_PREVIEW` — no document-preview equivalent. `CollaboraDocument.profile` in
  `CalloutContent.graphql` queries only `id, displayName` (no `visual(...)` alias, unlike
  the whiteboard's `preview: visual(type: WHITEBOARD_PREVIEW)`). alkemio#1673 ("Files
  displayed in folder structure") — the epic the story names as the mechanism to
  reuse — is itself an open Roadmap-status Epic whose own "Previews" line sits under
  **Optional scope** with **"TBD" design**; no generic file-preview client mechanism
  exists anywhere in this repo to consume (`grep -rli "filemanager\|file-manager\|
  FileNode\|FilePreview"` → zero hits outside `src/crd/CLAUDE.md` prose).
- **Rationale**: `client-web` is the sole target repo for this story (per task framing).
  Real rendering requires a Collabora/WOPI-side thumbnail-generation capability plus a new
  schema field — cross-repo, backend-owned work that cannot be authorized from a
  single-repo client story, and would itself have to wait on alkemio#1673's own preview
  design leaving "TBD."
- **Alternatives rejected**: (a) Rendering a live/hidden Collabora iframe to rasterize a
  thumbnail client-side — rejected as expensive (a full editor session per card in a
  feed), fragile (depends on WOPI/Collabora availability at scroll time), and exactly the
  "parallel mechanism" the story explicitly says not to build. (b) Extracting text from
  the uploaded Office file client-side for a memo-style text crop — rejected: Office
  files (`.docx`/`.xlsx`/`.pptx`) are zipped XML, not markdown; parsing them client-side
  to fake a text preview is significant new complexity for a preview that would look
  nothing like the real document, is not requested by the story, and does not scale to
  spreadsheets/presentations the way it does for a wordprocessing file.

## R2 — Type → visual mapping shape

- **Decision**: Extend the existing `iconByType: Record<CollaboraDocumentPreviewType,
  LucideIcon>` map in `CalloutCollaboraPreview.tsx` with a sibling `colorByType:
  Record<CollaboraDocumentPreviewType, string>` map: `text → 'text-blue-600'`,
  `spreadsheet → 'text-green-600'`, `presentation → 'text-orange-600'`. Both maps are
  keyed by the same three-value union already derived by
  `mapCollaboraDocumentTypeToPreviewType` (which also intentionally collapses
  `CollaboraDocumentType.DRAWING` into `'text'` — unchanged, see spec Clarifications).
- **Rationale**: Follows the exact pattern already in the file (`iconByType`,
  `typeLabelKey`) — a third parallel `Record` is the lowest-surprise, most consistent
  extension, not a new abstraction.
- **Alternatives rejected**: A combined `Record<Type, {icon, color, labelKey}>` object —
  rejected as a larger diff for no behavioral gain; the three-separate-maps shape is the
  established convention in this exact file and touching it would be an unrelated
  refactor. Extracting the mapping to a new `src/crd/lib/` module — rejected at the time
  per spec Assumption A-004 (single consumer; premature extraction). **Follow-up (bundled
  into this PR):** once #10122 ("Documents as a response type") merged to `develop` and
  added `ContributionDocumentCard` as a second consumer of the same three-value type union,
  the maps were extracted to `src/crd/lib/collaboraDocumentPreview.ts` — exactly the
  trigger condition A-004 named for revisiting this decision. Both `CalloutCollaboraPreview`
  and `ContributionDocumentCard` now import `iconByType`/`colorByType`/`typeLabelKey` from
  that shared module instead of each keeping its own copy.

## R3 — Forward-compatible real-image seam

- **Decision**: Add an optional `previewImageUrl?: string` prop to
  `CalloutCollaboraPreview`. When present (and has not errored), render `<img
  src={previewImageUrl} alt={typeLabel} className="w-full h-full object-cover"
  onError={() => setImageErrored(true)} />` in place of the centered icon; a local
  `imageErrored` boolean (visual-only `useState`, reset is unnecessary since the prop is
  static per render) gates the fallback. Mirror this exactly from `PostCard`'s existing
  whiteboard branch: `post.framingImageUrl ? <img ... /> : <fallback icon>`.
- **Data carrier**: `PostCardData` gains `framingDocumentPreviewUrl?: string` (document
  framing only), populated in `calloutDataMapper.ts`'s `mapCalloutDetailsToPostCard`.
  Structurally it mirrors the existing `framingImageUrl` field's *role* (whiteboard's
  own preview-URL carrier), but since there is no backend field to branch on yet, it is
  assigned a flat `framingDocumentPreviewUrl: undefined` rather than a
  `callout.framing.type === ... ? real : undefined` ternary — a ternary whose "real"
  branch cannot exist yet would be dead code (see data-model.md). This still satisfies
  FR-004 (the field exists, threaded, typed, and covered by a unit test with a mocked
  value) without inventing a query field that does not exist.
- **Rationale**: This is the literal, concrete form of "consume the generic mechanism,
  don't build a parallel one" (story AC3): when a real backend preview lands, it is
  wired by editing exactly the one ternary in `calloutDataMapper.ts` — no change to
  `PostCard.tsx`, `CalloutCollaboraPreview.tsx`, or any test's *structure* (only its mock
  data).
- **Alternatives rejected**: Reusing the existing `framingImageUrl` field for both
  whiteboard and document (they are mutually exclusive by `post.type`, so it would work
  at runtime) — rejected because every other framing type has its own dedicated,
  explicitly-documented field (`framingMemoMarkdown`, `framingMediaGallery`,
  `framingDocumentType`, `framingCallToAction`); reusing a field documented as
  "whiteboard framing only" for a second type would be a silent, surprising exception to
  an otherwise consistent, self-documenting convention.

## R4 — Alt text / i18n

- **Decision**: No new i18n keys. The (future) preview `<img>`'s `alt` reuses the
  already-computed `typeLabel` (`t(typeLabelKey[documentType])` → the existing
  `callout.documentText` / `callout.documentSpreadsheet` / `callout.documentPresentation`
  keys in `src/crd/i18n/space/space.<lang>.json`, all six locales, already present and
  already used for the visible badge text).
- **Rationale**: Mirrors `PostCard`'s own whiteboard `<img alt={t('callout.whiteboard')}
  />` precedent — reusing an existing, already-localized, already-accurate label as alt
  text rather than minting a near-duplicate `*PreviewAlt` key. Zero new translation work,
  zero new parity-test surface, satisfies FR-007/FR-011 (parity is inherited from keys
  that already have it).
- **Alternatives rejected**: A new `documentPreviewAlt` key per type — rejected as
  redundant with `documentText`/`documentSpreadsheet`/`documentPresentation`, which
  already say exactly "Word Document" / "Spreadsheet" / "Presentation."

## R5 — Contrast / color-token choice

- **Decision**: `text-blue-600` / `text-green-600` / `text-orange-600` (Tailwind's
  default palette, already available — no `tailwind.config`/theme change). See spec
  Clarifications (session 2026-08-06) for the full contrast/dark-mode reasoning: the
  centered icon is `aria-hidden` (decorative, WCAG 1.4.3 text-contrast does not strictly
  apply), all three `-600` shades clear the 3:1 non-text-contrast bar against the light
  `bg-muted`/`bg-muted/30` backgrounds, and no dark-mode variant is needed because CRD has
  no theme provider or `dark:` usage anywhere in `src/crd/components/space/` or
  `src/crd/components/callout/` today.
- **Alternatives rejected**: CSS custom properties / new theme tokens in
  `src/crd/styles/theme.css` — rejected as unnecessary indirection for three fixed,
  never-configurable colors; every other ad-hoc badge color in this codebase (e.g. the
  draft badge's `bg-amber-100 text-amber-700 border-amber-300`) uses raw Tailwind palette
  classes directly, so this follows the established local convention.

## R6 — Testing strategy

- **Decision**:
  1. `CalloutCollaboraPreview.test.tsx` (new) — for each of the three
     `CollaboraDocumentPreviewType` values: renders the type-specific icon (query by
     testid/icon presence is brittle with `lucide-react`; assert via the rendered
     `typeLabel` text plus a snapshot-safe class-list check on the icon's `className`) and
     confirms the badge and centered icon share the same color class; renders with
     `previewImageUrl` and confirms an `<img>` with the expected `src`/`alt` appears in
     place of the icon; fires the `<img>`'s `onError` and confirms it falls back to the
     icon treatment; confirms `onReplace` presence/absence still gates the "Replace file"
     button (regression); confirms both `size="compact"` and `size="default"` render
     without throwing.
  2. `calloutDataMapper.test.ts` (new) — a minimal `CalloutDetailsModelExtended` fixture
     covering the `CollaboraDocument` framing branch, asserting
     `mapCalloutDetailsToPostCard(...).framingDocumentPreviewUrl` is `undefined` today
     (documents current production behavior) and that `framingDocumentType` is still
     correctly derived (regression coverage for logic this test file did not previously
     exist to protect).
- **Rationale**: Matches the existing mock-light, `@testing-library/react` + Vitest style
  already used across `src/crd/components/**/*.test.tsx` (e.g. `PostCard.test.tsx`) —
  render, query by text/role, assert. No new test utilities or mocking libraries needed.
