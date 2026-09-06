# Feature Specification: Render File Thumbnail / Preview in Post Cards

**Feature Branch**: `story/9872-render-file-thumbnail-preview-in-post-cards`
**Created**: 2026-08-06
**Status**: Draft
**Input**: User description: "Render file thumbnail / preview in Post cards (story alkem-io/client-web#9872) — Post cards for file-bearing contributions (OfficeDocs, and uploaded files generally) currently show an empty-memo–style placeholder instead of a real preview. Render an actual thumbnail/preview of the file so users can recognise the document at a glance. Preview/truncation behaviour should align with the existing whiteboard & memo previews (per #9575), and should consume the generic file-preview approach from alkemio#1673 rather than building a parallel one."

## Context

OfficeDocs (Docs/Sheets/Slides, backed by `CollaboraDocumentType` — `WORDPROCESSING`,
`SPREADSHEET`, `PRESENTATION`, `DRAWING`) are a callout **framing** type
(`CalloutFramingType.CollaboraDocument`) rendered by `PostCard` (the feed card,
`src/crd/components/space/PostCard.tsx`) and by `CalloutDetailDialog` (the post
dialog). Both surfaces delegate the actual framing preview to one shared
component, `CalloutCollaboraPreview` (`src/crd/components/callout/CalloutCollaboraPreview.tsx`):
`PostCard` renders it at `size="compact"`; `CollaboraFramingConnector`
(`src/main/crdPages/space/callout/CollaboraFramingConnector.tsx`) renders it at
`size="default"` inside the dialog. Fixing the shared component therefore fixes
both surfaces named in the story ("Post cards ... and post dialog") at once.

Today `CalloutCollaboraPreview` always renders the same flat, single-color box
with a centered generic icon — literally the same "empty" treatment `PostCard`
shows for a whiteboard/memo that has no content yet. This is the exact gap
called out (and left unchecked) in #9575's original acceptance criteria:
*"(Preview imitates 'empty memo' preview) The preview truncation logic should
emulate the existing logic for whiteboards and memos."*

**How whiteboard/memo previews actually work today** (the behaviour to align
with):

- **Whiteboard**: the framing query (`CalloutContent.graphql`) fetches
  `preview: visual(type: WHITEBOARD_PREVIEW)` on the whiteboard's `Profile` — a
  real rendered PNG generated server-side. `calloutDataMapper.ts` surfaces it as
  `PostCardData.framingImageUrl`; `PostCard` renders that image full-bleed
  inside an `aspect-video` box when present, and falls back to a centered
  `Presentation` icon when absent (e.g. a brand-new, still-empty whiteboard).
- **Memo**: the framing query fetches the memo's raw `markdown`; the mapper
  surfaces it as `framingMemoMarkdown`; `PostCard` renders it truncated via
  `CroppedMarkdown` inside a fixed-height box, falling back to a centered
  `StickyNote` icon when there is no content yet.

Both patterns share the same shape: **a fixed-geometry box, real content when
available, a centered type icon when not.** `CalloutCollaboraPreview` already
has the box geometry and the hover-to-open interaction right — what it is
missing is (a) any type-differentiated visual richness (it shows one flat icon
regardless of Doc/Sheet/Slide) and (b) the "real content when available" half
of the pattern.

**Why the "real content" half cannot be wired to actual rendered pixels yet**:
unlike whiteboards, the GraphQL schema has no preview mechanism for
`CollaboraDocument` at all. `VisualType` (`src/core/apollo/generated/graphql-schema.ts`)
defines only `AVATAR`, `BANNER`, `BANNER_WIDE`, `CARD`, `MEDIA_GALLERY_IMAGE`,
`MEDIA_GALLERY_VIDEO`, `WHITEBOARD_PREVIEW` — there is no
`COLLABORA_DOCUMENT_PREVIEW`-equivalent, and `CollaboraDocument.profile` never
queries one. The "generic file-preview approach from alkemio#1673" the story
references is itself unbuilt: #1673 ("Files displayed in folder structure") is
an open Epic still in Roadmap/Under-Construction status, and its **own scope
list puts "Previews" under Optional scope with a "TBD" design** — there is no
existing generic client mechanism anywhere in this repo to consume (confirmed:
no `FileManager`/`FilePreview`/file-type-icon utility exists outside this
callout framing code). Generating and serving real document thumbnails is a
backend/Collabora/WOPI concern spanning multiple repos and is out of reach for
a single-repo `client-web` story (see Assumptions).

## Scope of this delivery

Given the above, this story delivers the improvement that is actually
achievable **entirely client-side, today**, while explicitly building the seam
the eventual real mechanism will plug into — so that when alkemio#1673 (or a
Collabora/WOPI thumbnail capability) ships a real preview visual, this repo
needs zero further client rework, only a mapper change:

- **P1** — Replace the flat, undifferentiated icon box with a type-differentiated
  preview treatment (distinct icon + accent color per Doc/Sheet/Slide) in the
  Post card feed, so a member recognises the document kind at a glance without
  opening it.
- **P2** — The same treatment in the post/callout detail dialog (the same
  shared component, verified for parity — the dialog must never diverge from
  the card).
- **P3** — Forward-compatible wiring: an optional `framingDocumentPreviewUrl`
  field threaded through `PostCardData` exactly like the existing whiteboard
  `framingImageUrl` mechanism, so the moment the backend exposes a real
  rendered thumbnail, `CalloutCollaboraPreview` renders it in place of the
  type-icon treatment with no new mechanism — this is the concrete, testable
  form of "consume the generic mechanism, don't build a parallel one."

**Out of scope** (recorded so it isn't silently dropped, see Assumptions):
adding a new `VisualType`/server-side thumbnail generation (cross-repo,
belongs to a future vertical feature once alkemio#1673's Preview design is no
longer TBD); the `CalloutContributionType.COLLABORA_DOCUMENT` case in the
*contributions* grid (`ContributionsPreviewConnector`'s `ContributionCard`
switch has no case for it and renders nothing today) — a distinct, unrelated
gap not referenced by #9575 or #1842's checklist line, which is specifically
about the callout **framing** preview.

## Clarifications

### Session 2026-08-06 (iteration 1)

- **Q (Non-Functional / Accessibility): What exact color treatment differentiates the three document kinds, and does it meet the contrast rules `src/crd/CLAUDE.md` requires?**
  **A:** Recolor the existing `lucide-react` icon (already reused in both the badge and the centered fallback within `CalloutCollaboraPreview`) per type, on the unchanged `bg-muted/30` box background: Wordprocessing/text → `text-blue-600`, Spreadsheet → `text-green-600`, Presentation → `text-orange-600`. The centered icon stays `aria-hidden` (decorative — the adjacent type-label badge already carries the accessible text), so WCAG 1.4.3 text-contrast does not strictly apply to it, but all three `-600` shades comfortably clear the 3:1 non-text-contrast bar against the light `bg-muted/30`/background — consistent with the existing draft badge's `amber-*` precedent for legible-on-light color usage. No dark-mode variant is needed: the codebase currently has no theme provider or `dark:` Tailwind usage anywhere in `src/crd/components/space/` or `src/crd/components/callout/` — CRD is light-theme only today.
  **Rationale:** Keeps the change minimal (recolor an existing element, no new DOM), stays within the "only the box's internal content changes" boundary (FR-003), and reuses an existing accessible-badge pattern already proven in this codebase rather than inventing a new one.

- **Q (Interaction / UX consistency): Does the small top-right type-label badge (icon + "Doc"/"Sheet"/"Slide" text) also adopt the accent color, or stay neutral?**
  **A:** The badge's icon does — it reuses the identical `iconByType`/color mapping, so the badge and the large centered fallback icon are visually one consistent language, not two independent color decisions. The badge's text label stays `text-foreground` (unchanged), and its background/border stay the existing neutral `bg-background`/`border-border` — only the icon glyph's color changes, avoiding a jarring solid-color block.
  **Rationale:** Prevents the two icon instances in the same component from drifting out of sync in a future edit, and keeps the visual change additive/minimal rather than restyling the badge chrome.

- **Q (Domain / Edge Case): `mapCollaboraDocumentTypeToPreviewType` already maps `CollaboraDocumentType.DRAWING` to the same `'text'` preview type as `WORDPROCESSING` — should Drawing get its own (fourth) color, or intentionally share Wordprocessing's?**
  **A:** Intentionally share `'text'` (and therefore the blue accent) — this story does not change `mapCollaboraDocumentTypeToPreviewType`'s existing type-collapsing behavior. Collabora document Replace/creation is scoped to Phase-1 types only (`isReplaceableCollaboraDocumentType`, which already excludes Drawing), so introducing a fourth, Drawing-specific color for a type with no first-class creation/replace path is unwarranted speculative scope.
  **Rationale:** Avoids scope creep into `CollaboraDocumentType`/`CollaboraDocumentPreviewType` mapping logic that is out of this story's stated ask (a card-preview visual, not a type-taxonomy change) and keeps the three-color palette aligned with the three types the story explicitly names (Docs/Sheets/Slides).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Member recognises an OfficeDocs post at a glance in the feed (Priority: P1)

A member scrolling a Space's post feed sees a Post card backed by an OfficeDocs
document (a Doc, Sheet, or Slide). Instead of the same flat grey icon shown for
an empty memo, the card shows a preview that visually identifies which kind of
document it is — the way a whiteboard's rendered image and a memo's cropped
text already let a member recognise those posts without opening them.

**Why this priority**: This is the story's core, literal ask ("Post card
renders a thumbnail/preview ... instead of the empty placeholder") and the
highest-visibility surface (the main feed). It is fully self-contained: no
other story depends on it, and it alone closes #9575's outstanding AC.

**Independent Test**: Render `PostCard` with `type="document"` and each of the
three `CollaboraDocumentPreviewType` values (`text`, `spreadsheet`,
`presentation`) and confirm each renders a distinct icon + accent color, not
the shared flat treatment used before content exists on a memo/whiteboard.

**Acceptance Scenarios**:

1. **Given** a callout with `CalloutFramingType.CollaboraDocument` and `documentType: WORDPROCESSING`, **When** its Post card renders in the feed, **Then** the framing preview shows a document-type icon and accent color distinct from the spreadsheet and presentation treatments.
2. **Given** the same callout with `documentType: SPREADSHEET`, **When** its Post card renders, **Then** the framing preview shows the spreadsheet-specific icon and accent color.
3. **Given** the same callout with `documentType: PRESENTATION`, **When** its Post card renders, **Then** the framing preview shows the presentation-specific icon and accent color.
4. **Given** a feed containing multiple OfficeDocs post cards of different kinds, **When** the feed renders, **Then** each card's preview reflects only its own document's kind (no shared/global state leakage between cards).
5. **Given** an OfficeDocs Post card, **When** a user hovers or clicks it, **Then** the existing "Open Document" hover overlay and click-to-open behaviour are unchanged.

---

### User Story 2 - Member sees the identical preview when opening the post dialog (Priority: P2)

A member clicks into a Post card's detail dialog. The document preview shown
there must be the same recognisable treatment as the feed card — not a
different, still-flat fallback — since the story explicitly calls out "Post
cards ... and post dialog."

**Why this priority**: Directly named in the story description; low
implementation risk since the dialog already delegates to the same shared
component as the card, but must be explicitly verified so the two surfaces
cannot silently diverge in a future change.

**Independent Test**: Render `CalloutCollaboraPreview` at `size="compact"`
(card) and `size="default"` (dialog) with the same `documentType` and confirm
both use the same icon + accent color (only the box's size/aspect differs, per
existing `size` prop behaviour).

**Acceptance Scenarios**:

1. **Given** an OfficeDocs callout, **When** its Post card (compact) and its detail dialog (default) are both rendered, **Then** both show the same document-type icon and accent color for that document.
2. **Given** a user with edit rights viewing the dialog's document preview, **When** the preview renders, **Then** the existing "Replace file" action (workspace#014-officedocs-replace-file) still renders and functions unchanged alongside the enhanced preview.

---

### User Story 3 - Preview is ready to show a real thumbnail the moment one exists (Priority: P3)

A future backend change (post-alkemio#1673, once its Preview scope moves off
"TBD") starts returning a real rendered preview image for a Collabora
document, the same way whiteboards already do. No further `client-web` change
should be required beyond a data-mapper edit — the presentational component
already knows how to prefer a real image over the type-icon fallback.

**Why this priority**: Lower immediate user-visible value (there is no
production data source for this yet) but is the concrete mechanism that
satisfies "consume the generic file-preview approach ... rather than building
a parallel one" — it deliberately mirrors the exact image-else-icon pattern
`PostCard` already uses for whiteboards, so a later real-thumbnail delivery is
additive, not a rewrite.

**Independent Test**: Render `CalloutCollaboraPreview` with a mock
`previewImageUrl` prop and confirm the image renders in place of the
type-icon treatment; render with the prop omitted and confirm the type-icon
treatment renders (today's actual production state, since no backend field
exists yet); simulate an image load failure and confirm graceful fallback to
the type-icon treatment rather than a broken-image glyph.

**Acceptance Scenarios**:

1. **Given** `CalloutCollaboraPreview` receives a `previewImageUrl`, **When** it renders, **Then** the image is shown in place of the type-icon treatment, with localized alt text.
2. **Given** `CalloutCollaboraPreview` receives no `previewImageUrl` (today's state for every real document, since the backend does not yet emit one), **When** it renders, **Then** the type-icon treatment renders — this is the P1 behaviour, unaffected by the presence of this prop.
3. **Given** a `previewImageUrl` is supplied but fails to load, **When** the image errors, **Then** the component falls back to the type-icon treatment instead of showing a broken-image glyph.
4. **Given** `PostCardData`, **When** a future data mapper populates `framingDocumentPreviewUrl` from a real backend field, **Then** no change to `PostCard`, `CalloutCollaboraPreview`, or `CollaboraFramingConnector` is required — only the mapper assignment.

---

### Edge Cases

- **Unmapped/unknown `CollaboraDocumentType`**: the type→visual mapping must cover all four schema values (`WORDPROCESSING`, `SPREADSHEET`, `PRESENTATION`, `DRAWING`) with no silent fallthrough to an unstyled/undefined state; `DRAWING` already maps to the same `'text'` `CollaboraDocumentPreviewType` as `WORDPROCESSING` (existing `mapCollaboraDocumentTypeToPreviewType` behaviour, unchanged by this story) and therefore intentionally renders the same blue treatment as Wordprocessing, not a fourth color (see Clarifications).
- **`framingDocumentType` is undefined**: `PostCard` already guards `post.type === 'document' && post.framingDocumentType` — if a document framing somehow has no resolvable type, nothing renders (existing behaviour, unchanged; not a regression introduced here).
- **Preview image URL present but the image fails to load** (network error, expired signed URL): falls back to the type-icon treatment rather than a broken-image glyph (P3, FR-006).
- **Compact (card) vs default (dialog) sizing**: the type-icon + color treatment must render correctly at both `size="compact"` (fixed height, smaller icon) and `size="default"` (aspect-video, larger icon) without layout overflow.
- **User without edit rights**: the "Replace file" action must stay absent (existing `onReplace` optional-prop gating, unchanged) while the new preview treatment still renders for read-only viewers.
- **Reduced/no-JS image loading state**: while a future real image is loading, no layout shift should occur — the box's fixed geometry (already `aspect-video` / fixed height) already prevents this; no additional work required.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The document framing preview (`CalloutCollaboraPreview`) MUST show a type-differentiated visual treatment — a distinct icon color — for each `CollaboraDocumentPreviewType`: `text` → blue (`text-blue-600`), `spreadsheet` → green (`text-green-600`), `presentation` → orange (`text-orange-600`), replacing the current single flat, undifferentiated icon color. The unchanged `bg-muted/30` box background and the icon's `aria-hidden` decorative status are preserved (see Clarifications).
- **FR-001a**: The small top-right type-label badge's icon MUST adopt the same per-type color as the centered fallback icon (FR-001), so both icon instances in the component render from one shared mapping; the badge's localized text label stays `text-foreground` (unchanged), and the badge's neutral background/border chrome is unchanged — only the badge's icon glyph gets the accent color.
- **FR-002**: The type → visual (icon, color) mapping MUST be defined in exactly one place and MUST be the only place this mapping is defined, with no duplicated or divergent per-call-site mapping. As originally scoped this meant "inside `CalloutCollaboraPreview`" (its only consumers then were `PostCard` via `size="compact"` and `CollaboraFramingConnector` via `size="default"`, both icon instances — badge + centered fallback — rendering through it). Once `ContributionDocumentCard` (#10122) became a second consumer, "one place" means the shared `src/crd/lib/collaboraDocumentPreview.ts` module (see A-004) — `CalloutCollaboraPreview` and `ContributionDocumentCard` both import from it rather than each keeping a local copy.
- **FR-003**: The existing container geometry and interaction pattern (fixed-height compact box in the feed / `aspect-video` box in the dialog, `bg-muted/30` background, centered content, hover overlay with "Open Document," optional "Replace file") MUST remain unchanged — only the box's internal visual content changes.
- **FR-004**: `PostCardData` MUST gain a new optional field, `framingDocumentPreviewUrl` (document framing only), threaded from `calloutDataMapper.ts` exactly like the existing whiteboard `framingImageUrl` mechanism — `undefined` today (no backend field exists yet), ready to carry a real URL the moment one exists.
- **FR-005**: `CalloutCollaboraPreview` MUST accept an optional `previewImageUrl` prop; when present, it MUST render that image in place of the type-icon treatment (mirroring `PostCard`'s existing whiteboard image-else-icon fallback); when absent, the type-icon treatment (FR-001) MUST render.
- **FR-006**: If a supplied `previewImageUrl` fails to load, the component MUST fall back to the type-icon treatment rather than displaying a broken-image glyph.
- **FR-007**: The preview image (when rendered) MUST have localized alt text via the `crd-space` namespace (mirroring the whiteboard preview's `alt={t('callout.whiteboard')}` pattern), not empty or generic alt text.
- **FR-008**: The post/callout detail dialog's document preview (`CollaboraFramingConnector`) MUST render an identical type-differentiated visual treatment to the Post card feed preview for the same document — verified as an explicit parity requirement, not an incidental side effect of sharing a component.
- **FR-009**: The existing "Replace file" affordance (workspace#014-officedocs-replace-file, `onReplace`) MUST continue to render and function unchanged for users with edit rights, on top of the enhanced preview.
- **FR-010**: This delivery MUST require no new GraphQL query fields, no schema change, and no new runtime dependency — achievable entirely from data already available client-side (`CollaboraDocumentPreviewType`, derived from the existing `documentType` field).
- **FR-011**: Any new user-visible strings (e.g. updated alt text) MUST be added to the `crd-space` i18n namespace with full key parity across all six supported languages (en, nl, es, bg, de, fr).
- **FR-012**: The `CollaboraDocumentType` → preview-visual mapping MUST cover all four values the schema currently defines (`WORDPROCESSING`, `SPREADSHEET`, `PRESENTATION`, `DRAWING`), consistent with the existing `mapCollaboraDocumentTypeToPreviewType` mapping (`DRAWING` → `'text'`), with no unmapped/unstyled state.

### Key Entities *(include if feature involves data)*

- **`CalloutCollaboraPreview` visual treatment**: the type → `{ icon, color }` mapping (the `colorByType` and `iconByType` maps, now defined once in `src/crd/lib/collaboraDocumentPreview.ts` and imported by every consumer — see A-004) plus the optional image-else-icon rendering branch; the single reusable seam both `CalloutCollaboraPreview`'s consumers (card, dialog) and `ContributionDocumentCard` render through.
- **`PostCardData.framingDocumentPreviewUrl`**: new optional field (document framing only) on the existing `PostCardData` shape; mirrors `framingImageUrl`'s role for whiteboards. `undefined` in production today.
- **`CollaboraDocumentPreviewType`**: existing client-only union (`'text' | 'spreadsheet' | 'presentation'`) derived from the GraphQL `CollaboraDocumentType` enum by `mapCollaboraDocumentTypeToPreviewType`; unchanged by this story, now driving both icon and color.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of OfficeDocs Post cards in the feed show a type-differentiated preview (distinct icon + color per Doc/Sheet/Slide) instead of the flat, undifferentiated "empty memo"-style icon box — closing the outstanding #9575 acceptance criterion.
- **SC-002**: The Post card feed preview and the post/callout detail dialog preview are visually identical in treatment (same icon + color for the same document) for 100% of OfficeDocs callouts — zero divergence between the two surfaces.
- **SC-003**: Zero new GraphQL fields, zero schema changes, and zero new runtime dependencies are introduced to deliver the visible improvement (verified by diff review).
- **SC-004**: A real preview image URL, once present in the data, renders in place of the icon treatment with a single-line mapper change and no changes to `PostCard`, `CalloutCollaboraPreview`, or `CollaboraFramingConnector` — verified today via unit test with a mocked prop.
- **SC-005**: `pnpm lint` and `pnpm vitest run` pass clean, with new/updated unit coverage on `CalloutCollaboraPreview` (per-type icon/color for all four `CollaboraDocumentType` values, image-present vs image-absent, image-load-failure fallback) and on `calloutDataMapper.ts` (new field threading).

## Assumptions

- **A-001**: No backend/schema work is authorized or attempted as part of this story. `client-web` is the sole target repo; a new `VisualType` (e.g. a `COLLABORA_DOCUMENT_PREVIEW` equivalent to `WHITEBOARD_PREVIEW`) and its server-side generation is cross-repo work (server + Collabora/WOPI integration) that belongs to a future vertical feature once alkemio#1673's own "Previews" scope item — currently "Optional scope, TBD design" on that Epic — is actually specified. This story's job is to ship the best achievable client-only improvement now and leave a clean, zero-rework seam (`framingDocumentPreviewUrl` / `previewImageUrl`) for that later work, per the story's explicit instruction to reuse rather than parallel-build.
- **A-002**: "Thumbnail / preview" is interpreted, given A-001, as a **type-differentiated, recognisable-at-a-glance visual treatment** (distinct icon + accent color per Doc/Sheet/Slide) rather than a rendered image of the document's actual content — the same interpretation Google Drive/OneDrive use for file types with no generated thumbnail yet. This satisfies the story's AC1 ("instead of the empty placeholder") and AC2 (matches the whiteboard/memo box-with-fallback-icon pattern) today; AC3 is satisfied by the forward-compatible `previewImageUrl` seam (P3) rather than by building real rendering now.
- **A-003**: The `CalloutContributionType.COLLABORA_DOCUMENT` case in the contributions grid (`ContributionsPreviewConnector`'s `ContributionCard` switch, which at the time this story was scoped had no case for it and silently rendered nothing) was a distinct, pre-existing gap not referenced by #9575's checklist or by #1842's checklist line (both are specifically about the callout **framing** preview, i.e. `PostCard`/`CalloutDetailDialog`). Building that rendering was out of scope for this story's original scope. **Update:** #10122 ("Documents as a response type," a separate PR) has since built it — `ContributionDocumentCard` now renders that case. This PR's own scope is unchanged except for one bundled follow-up: extending the shared color mapping (A-004) to that new component too, once it existed as a second consumer.
- **A-004**: No new shared `src/crd/lib/` utility is extracted for the type→visual mapping *at the time this story was scoped*. `CalloutCollaboraPreview` was then the *only* consumer of `CollaboraDocumentPreviewType` in the UI layer, so centralizing the mapping inside that one component (FR-002) satisfied "one mechanism, not a parallel one" for this story's original scope without speculative extraction (CLAUDE.md: "avoid over-engineering — only make changes directly requested or clearly necessary"). This assumption named its own trigger for revisiting: "if/when a second consumer needs the same type→visual mapping... extracting it to `src/crd/lib/` is the natural, low-risk follow-up." **That happened within this PR:** #10122 added `ContributionDocumentCard` as a second consumer, so the mapping was extracted to `src/crd/lib/collaboraDocumentPreview.ts` and both components now import from it (see research.md R2, data-model.md).
- **A-005**: Accent colors follow the existing Tailwind design-token conventions already used elsewhere in `src/crd/` (no new hex literals) — chosen for straightforward at-a-glance differentiation between the three document kinds, consistent with the direction (though not the literal source, since it is external) of common productivity-suite iconography.
- **A-006**: All building blocks needed already exist in the repo (`lucide-react` icons, Tailwind, `react-i18next`, the existing `CalloutCollaboraPreview` props contract) — no new dependency is added, consistent with FR-010/SC-003.
