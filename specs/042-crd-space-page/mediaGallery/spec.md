# CRD Media Gallery Migration

## Problem

Media gallery is one of Alkemio's five callout framing types (whiteboard, memo, poll, media gallery, call to action). Unlike whiteboard/memo, **it has no contribution type** — the gallery is owned entirely by the callout framing. Members never "contribute" their own media: read-only users can view the images in the inline carousel, and users with `Update` privilege on the callout (editors) can add, reorder, and delete images through the callout edit form. Regular members without `Update` cannot add media.

Today media gallery is fully MUI: the framing preview (`CalloutFramingMediaGallery`), the lightbox carousel (`MediaGallery` built on `react-image-gallery`), and the form field used to upload/reorder/delete visuals (`CalloutFramingMediaGalleryField`, built on `@dnd-kit`). On the CRD side:

- `src/crd/components/callout/CalloutMediaGallery.tsx` is a **minimal stub** — a static thumbnail grid with a single "Add Image" button. No lightbox. No reorder. No delete. No empty state beyond the button.
- `PostCard` has no media-gallery branch in the feed preview.
- `CalloutDetailDialog` has no `mediaGalleryFramingSlot`.
- `CalloutFormConnector` already maps the `image` framing option to `CalloutFramingType.MediaGallery`, but the form has no CRD field to produce the actual visuals.

This sub-spec migrates the full media-gallery experience to CRD: a **4-tile preview grid in `PostCard`** (visually matching `ContributionsPreviewConnector`'s whiteboard-contribution grid, with a "+N more" overlay on the fourth tile when the total exceeds 4), an **embedded carousel directly inside `CalloutDetailDialog`** (no separate lightbox — prev/next/pagination render in-place), and a CRD upload/reorder/delete form field inside the callout form. Mirrors the structure used for the memo migration (CRD owns presentation + visual state; integration layer owns GraphQL + uploads).

## Current MUI Implementation (reference)

| Concern | File | Role |
|---|---|---|
| Framing renderer | `src/domain/collaboration/callout/CalloutFramings/CalloutFramingMediaGallery.tsx` | Converts `MediaGalleryModel.visuals` to `MediaGalleryItem[]` sorted by `sortOrder`; renders `MediaGallery`; shows an empty-state upload button when empty + `canEdit` |
| Thumbnail grid + lightbox | `src/core/ui/gallery/MediaGallery.tsx` | MUI + `react-image-gallery`. Shows up to 6 thumbnails with a "+N more" tile; opens a `DialogWithGrid` with the carousel, download button, fullscreen toggle, close. **CRD drops the separate lightbox entirely** — the carousel lives inline inside the detail dialog (see Solution below) |
| Form field | `src/domain/collaboration/callout/CalloutFramings/CalloutFramingMediaGalleryField.tsx` | File input + validation (type/dimensions via `useDefaultVisualTypeConstraintsQuery`); `@dnd-kit` reorder; per-item delete; HEIC handling (server-side conversion) |
| Upload flow | `src/domain/collaboration/mediaGallery/useUploadMediaGalleryVisuals.ts` | Two-step: `useAddVisualToMediaGalleryMutation` (allocates visual id + `sortOrder`) → `useUploadVisualMutation` (binds the file to the visual) → refetch `CalloutDetails` |
| Visual model | `src/domain/collaboration/mediaGallery/MediaGalleryModel.ts` | `{ id, visuals: [{ id, uri, name, alternativeText, sortOrder }] }` |
| Framing enum | `src/core/apollo/generated/graphql-schema.ts` | `CalloutFramingType.MediaGallery = 'MEDIA_GALLERY'`; `VisualType.MediaGalleryImage = 'MEDIA_GALLERY_IMAGE'` (video is defined but not used in the UI yet) |

Key facts verified in the MUI layer:
- The lightbox uses **arrow-key navigation**, **download-current-image**, and a **fullscreen toggle** — all three are in `react-image-gallery`'s API.
- The form field validates file type, `minWidth`/`minHeight`/`maxWidth`/`maxHeight` client-side for non-HEIC files; HEIC bypasses dimension validation (the browser can't decode HEIC; the server converts).
- Reorder is **per-file** during the form edit session; on save, the new `sortOrder` is written to each visual. The gallery display always sorts by `sortOrder` ascending.
- There is **no per-item edit UI** after upload — alt text is set once at upload time via a prompt/field and is not edited later. (Matches parity scope.)

## Solution

### Scope

- **Framing-only, no contributions.** Unlike whiteboard/memo, there is no "Add Media" contribution flow and no contribution cards. A callout's media gallery is a fixed set owned by the callout editor(s). The `+N more` tile in the feed preview (see Visual treatments) is a framing-level overflow indicator, not a contribution affordance.
- **Full read path** in CRD: `PostCard` feed preview, detail-dialog preview, keyboard-navigable lightbox with download + fullscreen.
- **Full edit path** in CRD: upload (multi-file), `@dnd-kit` reorder, per-item delete, validation against platform constraints, HEIC passthrough.

The Hocuspocus/collaboration boundary from memos does not apply here — media galleries are not real-time collaborative; they're edited in the callout form like any other framing field.

### Visual treatments

**Feed-level preview on `PostCard`** (new branch alongside whiteboard/memo — **matches `ContributionsPreviewConnector`'s whiteboard-contribution grid visually**):
- Renders up to **4 tiles** in the same 2-column-on-mobile / grid-on-desktop layout that `ContributionsPreviewConnector` uses for whiteboard contributions. Each tile is the full `ContributionWhiteboardCard`-style card shape (aspect ratio, border, hover scale), not a bare `<img>`.
- When the gallery has **>4 images**, the 4th tile becomes a "+N more" overlay on the 4th visible image — identical treatment to the whiteboard-contribution overlay (`OverlayMoreCard` in `ContributionsPreviewConnector`). The overlay reads `+{N} more` where `N = total - 3`.
- Each tile surfaces a **centered hover button labelled "Open image"** (visual language identical to the `ContributionWhiteboardCard` "Open Whiteboard" hover button). Clicking any tile — or the overlay — opens the **callout detail dialog**, *not* a lightbox. Inside the detail dialog the carousel can be scrolled to the clicked image (optional enhancement via `onOpenAt(index)`).
- `PostCard` stays pure: the gallery tiles come in as props (`framingMediaGallery: { thumbnails: { id: string; url: string }[]; totalCount: number }`). Carrying the `id` through to the CRD layer lets `MediaGalleryFeedGrid` use stable React keys across reorders / deletions — using the URL alone would cause React to rebuild DOM when an image is replaced but the slot remains. `PostCard` does not know about `Visual` or GraphQL.
- Explicitly unlike whiteboards/memos, media gallery framings visually **reuse the contribution-grid pattern** even though they're not contributions — the user-facing cue ("multiple images to browse") matches the contribution-grid affordance, so we mirror it.

**Detail-level presentation inside `CalloutDetailDialog`** (new CRD `CalloutMediaGalleryCarousel`):
- An **inline, embedded carousel** occupying the full available framing slot width. No separate lightbox dialog, no z-[60] stack — the images are viewed **directly in the callout detail dialog**.
- One image visible at a time, centred with `object-contain`, max-height bounded so controls + caption stay visible on common viewports.
- **Controls**:
  - Prev / Next buttons (left + right arrow icons) overlaid on the sides; `aria-disabled` at the ends when loop is off.
  - A pagination row below the image: dots for small galleries (≤7), a compact "current / total" counter for larger galleries, or a thumbnail strip (TBD during implementation — see plan §M3).
  - Alt text is applied to the `<img>` via the `alt` attribute so screen readers announce it. No separate visible caption strip below the image (parity with MUI — MUI's carousel also does not render a visible caption).
  - A small "download current image" icon button in the top-right corner of the carousel.
  - An optional fullscreen-toggle button in the top-right that expands the current image into a browser-fullscreen viewport (same image carousel, no separate component — just `requestFullscreen` on the carousel root). Hidden when `document.fullscreenEnabled` is false.
- **Keyboard** (while the carousel root or any of its controls has focus): `←`/`→` navigate, `Home`/`End` jump to first/last, `F` toggles fullscreen, `Esc` closes the surrounding callout dialog (default Radix behaviour).
- **Touch**: pointer-event swipe to advance (implementation note: rely on Embla's built-in drag/swipe if shadcn's `carousel` primitive is ported; otherwise ~20 lines of pointer-event delta logic).
- **Empty state** (when `canEdit` is true but the gallery is empty in the detail view): a dashed-border "Add images" block in the framing slot that opens the callout edit form — same pattern the MUI implementation uses for the empty framing. Non-editors on an empty gallery simply don't see the slot.

### Form field (callout create + edit path)

> **Key architectural fact discovered during implementation**: visuals can ONLY be uploaded **after** the callout is saved. The callout-creation mutation creates the underlying `MediaGallery` row server-side when `framing.type = MediaGallery`, and returns its id in the response. There is no way to attach files in the create mutation itself. Both the MUI create and edit flows follow the same two-phase pattern: (1) save callout → (2) receive `callout.framing.mediaGallery.id` → (3) call `useUploadMediaGalleryVisuals({ mediaGalleryId, visuals })` which internally chains `useAddVisualToMediaGalleryMutation` + `useUploadVisualMutation` per file (and `useDeleteVisualFromMediaGalleryMutation` for removals during edit).

The CRD form — based on `useCrdCalloutForm` (plain `useState`, not Formik) — mirrors this. `mediaGalleryVisuals: MediaGalleryFormVisual[]` lives in the form state; on submit, the form calls the existing `useCalloutCreationWithPreviewImages` (for create) or the update mutation (for edit), awaits the result, and if the framing type is MediaGallery, calls `uploadMediaGalleryVisuals` with the returned `mediaGalleryId`. The `MediaGalleryFormVisual` shape matches the MUI hook's contract: `{ id?: string; file?: File; uri?: string; altText?: string; sortOrder?: number }` — `id` absent + `file` present = new visual to create+upload; `id` present + `file` present = replace image on existing visual; neither form has CRD relevance for the template-reupload case (that's MUI-templates-only).

New CRD `MediaGalleryField` (lives under `src/crd/forms/mediaGallery/`) — mirrors the MUI form field structurally but Tailwind-only:

```
MediaGalleryField
├── header: file input button + "drop here" affordance
├── grid:   draggable thumbnail tiles (each has delete button on hover)
└── alt-text prompt (when a file is being added)
```

Props (uncontrolled-array pattern — the field owns no mutations itself, it emits the full next array whenever the user adds/deletes/reorders, and the consumer persists after the callout is saved):
- `visuals: MediaGalleryFieldVisual[]` where `MediaGalleryFieldVisual = { id?: string; file?: File; uri?: string; altText?: string; sortOrder?: number; clientKey?: string }` — current list of saved + unsaved entries. `id` absent + `file` present = pending upload; `id` present = persisted visual; `clientKey` is generated client-side so React keys stay stable before upload.
- `onVisualsChange(next: MediaGalleryFieldVisual[]): void` — fired on add (selected files), delete, or reorder. The consumer stores the array in the callout-form state and executes add/delete/reorder mutations after the callout save succeeds.
- `constraints?: { allowedMimeTypes?: string[]; minWidth?: number; minHeight?: number; maxWidth?: number; maxHeight?: number }` — optional client-side validation.
- `disabled?: boolean`, `uploading?: boolean`.

The earlier draft of this spec listed separate `onUpload` / `onDelete` / `onReorder` callbacks; that contract was rejected during implementation because all three need to wait for the callout-save mutation to return a `mediaGalleryId` before they can run. The array-based contract keeps the field inert (no mutations) until save, at which point the consumer replays the diff against the server.

`@dnd-kit` is allowed inside `src/crd/forms/` because it's framework-agnostic, Tailwind-friendly, and already a project dep (used by MUI). Independence of the demo app is preserved — the form field with dnd-kit is fully renderable in the CRD standalone preview with mock `onUpload`/`onDelete`/`onReorder`.

Validation runs client-side (matches MUI):
- MIME type against `allowedMimeTypes` (if provided).
- For non-HEIC: decode to `HTMLImageElement` off-DOM and check `naturalWidth`/`naturalHeight` against min/max.
- HEIC: skip dimension validation, server converts.
- Failures surface inline under the file input with the reason; the file is not uploaded.

### Integration layer

New files under `src/main/crdPages/space/callout/`:

- `MediaGalleryFramingConnector.tsx` — mirrors `WhiteboardFramingConnector` / `MemoFramingConnector`. Reads `callout.framing.mediaGallery` (Visual list + id), renders `CalloutMediaGalleryCarousel` with mapped `items` and an optional `initialIndex` routed from the feed-tile click.
- `MediaGalleryFormFieldConnector.tsx` — wraps the CRD `MediaGalleryField` and wires:
  - `useAddVisualToMediaGalleryMutation` + `useUploadVisualMutation` for `onUpload` (two-step matches MUI's `useUploadMediaGalleryVisuals`).
  - `useDeleteVisualFromMediaGalleryMutation` for `onDelete`.
  - A visual-reorder mutation (TBD — confirm exact hook name during implementation; the MUI code uses per-visual `sortOrder` updates in sequence) for `onReorder`.
  - `useDefaultVisualTypeConstraintsQuery(VisualType.MediaGalleryImage)` for `constraints`.
- `mediaGalleryDataMapper.ts` — pure mapper: `MediaGalleryModel` → CRD prop shape (`{ feedThumbnails, totalCount, carouselItems }`). Sorts by `sortOrder` at this layer so the CRD component never sees unordered data.

Updates to existing integration:

- `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`:
  - Add `mediaGalleryFramingSlot` (mirrors `memoFramingSlot` / `whiteboardFramingSlot`).
  - Route `callout.framing.type === CalloutFramingType.MediaGallery` to `MediaGalleryFramingConnector`.
- `src/main/crdPages/space/callout/CalloutFormConnector.tsx`:
  - When the selected framing type is `MediaGallery`, render `<MediaGalleryFormFieldConnector calloutId={...} mediaGallery={...} />` in the framing field slot.
- `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`:
  - `mapFramingTypeToPostType` returns `'mediaGallery'` for `CalloutFramingType.MediaGallery`.
  - `mapCalloutDetailsToPostCard` (and `mapCalloutLightToPostCard` when the visuals are present in the light query — confirm) populate `framingMediaGallery: { thumbnails: string[]; totalCount: number }` from `callout.framing.mediaGallery?.visuals`.
  - `PostType` union gains `'mediaGallery'`; `PostCardData` gains `framingMediaGallery`; `typeIcons['mediaGallery'] = Images` (lucide); `typeLabels['mediaGallery'] = 'callout.mediaGallery'`.

### Out of scope

- **Video support.** The `VisualType.MediaGalleryVideo` enum exists but no UI uses it today. Parity with current MUI only.
- **Per-item alt-text edit after upload.** Matches MUI.
- **Captions / titles per image** beyond `alternativeText` on the `<img>` element.
- **Reorder via keyboard** beyond `@dnd-kit`'s built-in keyboard sensor (which we'll enable for a11y parity).
- **Server-side image optimisation / transformation** — unchanged.
- **Any schema / backend changes.**

### Known a11y deferrals (follow-up)

- **Carousel region accessible name.** The WAI-ARIA Carousel pattern recommends `aria-label` / `aria-labelledby` on the `role="region"` carousel root. The current `src/crd/primitives/carousel.tsx` does not accept it as a prop. Tracked for a follow-up a11y sweep — requires making `aria-label` required on the primitive and updating every consumer.
- **Tablist semantics on the thumbnail strip.** If the thumbnail strip is enabled (plan §M3), it currently declares `role="tablist"` / `role="tab"` without matching `tabpanel` + keyboard pattern. The follow-up a11y sweep will convert it to a `<ul role="list">` of `<button>` items.

## Open questions

Resolved during planning — see `plan.md`:

- **Lightbox vs. inline carousel**: **inline carousel**. No separate lightbox dialog; the gallery is viewed directly inside `CalloutDetailDialog`'s framing slot. A browser-fullscreen toggle on the carousel root gives the "immersive" mode without adding a second Radix Dialog to the stack. Resolved in plan §M1.
- **Carousel primitive**: port shadcn's `carousel` (Embla-based) into `src/crd/primitives/carousel.tsx` the first time any CRD feature needs it. Media gallery is the first consumer. Resolved in plan §M2.
- **Feed-tile grid visual**: reuse the whiteboard-contribution card layout (4 cards max, "+N more" overlay on the 4th when total > 4, per-tile hover "Open image" button). Resolved in plan §M3.
- **Reorder library**: keep `@dnd-kit`; CRD rule allows it (framework-agnostic, Tailwind-native, already a dep). Resolved in plan §M4.
- **i18n namespace**: reuse `crd-space` (no new namespace — memo precedent). Resolved in plan §M5.

## Acceptance

- Toggle CRD on → open a Space with a media-gallery-framed callout (≤4 images) → feed-level `PostCard` shows one tile per image in the whiteboard-contribution grid layout, each with a hover "Open image" button. Clicking any tile opens the callout detail dialog with the carousel focused on that image.
- Same callout with >4 images → feed preview shows 3 tiles + a "+N more" overlay on the 4th tile; the overlay reads `+{total-3} more`.
- Detail dialog → the media gallery renders as an inline carousel in the framing slot: one image at a time with Prev/Next, pagination dots (or counter/strip per M3), alt-text caption, download-current-image button. `←`/`→` navigate; `Home`/`End` jump to ends; `F` toggles browser fullscreen on the carousel root; `Esc` closes the callout dialog (default Radix behaviour). Touch swipe advances.
- Edit path (with `Update` privilege on the callout): open the callout form → drop multiple images → tiles appear; validation rejects unsupported types/sizes with inline reasons; reorder via drag; delete via hover button; save persists the new `sortOrder` and the deletions.
- Without `Update` privilege: the form field is hidden; the carousel and the feed grid remain fully functional.
- Zero `@mui/*`, `@emotion/*`, or `react-image-gallery` imports anywhere under `src/crd/`.
