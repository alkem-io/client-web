# Tasks: CRD Media Gallery Migration

**Feature**: CRD Media Gallery Migration (sub-spec of `042-crd-space-page`)
**Branch**: `042-crd-space-page-<next>`
**Spec**: [./spec.md](./spec.md) | **Plan**: [./plan.md](./plan.md)

## User Stories (derived from spec acceptance criteria)

- **US1 (P1)** — Feed-level 4-tile grid: media-gallery-framed callouts render a 4-tile grid in `PostCard` visually matching `ContributionsPreviewConnector`'s whiteboard-contribution layout; each tile has a centered hover "Open image" button; with >4 images the 4th tile shows "+N more"; clicks open the callout detail dialog.
- **US2 (P1)** — Inline carousel in detail dialog: the callout detail dialog embeds `CalloutMediaGalleryCarousel` directly in its framing slot — no separate lightbox dialog. Prev/next controls, pagination (dots or counter), download current, fullscreen toggle, `←`/`→`/`Home`/`End`/`F` keyboard, and touch swipe all work inline.
- **US3 (P1)** — Callout form field (upload + delete): with `Update` privilege, the callout form exposes a `MediaGalleryField` supporting multi-file upload, client-side validation, per-item delete, HEIC passthrough. Reorder deferred to US3b.
- **US3b (P1)** — Reorder: the `MediaGalleryField` adds `@dnd-kit` reorder with keyboard sensor; drops persist per-visual `sortOrder` via the integration connector.
- **US4 (P2)** — Parity, a11y, cleanup: i18n keys, keyboard/focus-trap QA, deletion of the `CalloutMediaGallery.tsx` stub, forbidden-import sweep.

Each story is independently testable: US1 renders in the CRD standalone preview with a stub `onOpenAt` that logs; US2 renders with mock items without needing the form field; US3/US3b render against mocked async callbacks; US4 is a pass/fail checklist.

---

## Phase 1: Setup

> **Folder creation**: `src/crd/components/mediaGallery/`, `src/crd/forms/mediaGallery/`, and the `src/crd/primitives/carousel.tsx` port all land implicitly when T005–T030 files are created. No barrel `index.ts` files per constitution.

- [X] T001 [P] Audit the existing CRD stub at `src/crd/components/callout/CalloutMediaGallery.tsx` and record its call sites (grep `CalloutMediaGallery`). The stub is slated for deletion in T030; confirm no external imports that need migration first. **Audit result**: only self-referenced; safe to delete in T033.
- [X] T002 [P] Audit MUI references to lock down behaviour for verbatim port. **Audit result**: `CalloutFramingMediaGallery.tsx` + `MediaGallery.tsx` (react-image-gallery) + `CalloutFramingMediaGalleryField.tsx` + `useUploadMediaGalleryVisuals.ts` + `MediaGalleryModel.ts` — all paths confirmed during pre-work. Hook names: `useAddVisualToMediaGalleryMutation`, `useUploadVisualMutation`, `useDeleteVisualFromMediaGalleryMutation`, `useDefaultVisualTypeConstraintsQuery`.
- [X] T003 [P] Confirm the exact reorder mutation. **Audit result**: MUI does NOT have a dedicated reorder mutation — reorder is staged in Formik state via `setFieldValue('framing.mediaGallery.visuals.${i}.sortOrder', i)` and persisted via the callout update at form submit. The CRD integration will use `useUpdateVisualMutation` per-visual or stage the new order in form state, mirroring MUI.
- [X] T004 [P] Audit `ContributionsPreviewConnector.tsx` for the whiteboard-contribution grid shape. **Audit result**: `grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4`; each card `min-h-[180px] rounded-lg overflow-hidden border border-border bg-muted/30`; hover `hover:ring-2 hover:ring-primary/50`; focus `focus-visible:ring-2 focus-visible:ring-ring`; hover button overlay `bg-primary/40` with `secondary` inner button; "+N more" overlay `bg-primary/60 backdrop-blur-[2px]`. Used verbatim in `MediaGalleryFeedGrid`.

---

## Phase 2: Foundational (blocking prerequisites)

- [X] T005 Add `src/crd/primitives/carousel.tsx` porting shadcn's `carousel` recipe (Embla-based). Exports `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, and the `CarouselApi` type. Replace the recipe's `cn()` path with `@/crd/lib/utils`. Zero MUI. Verify no stray imports from outside `src/crd/` end up in the file. Add `embla-carousel-react` to `package.json` dependencies.
- [X] T006 [P] Add `mapFramingTypeToPostType` case for `CalloutFramingType.MediaGallery → 'mediaGallery'` in `src/main/crdPages/space/dataMappers/calloutDataMapper.ts`. Extend `PostType` union in `src/crd/components/space/PostCard.tsx` with `'mediaGallery'`; extend `typeIcons` (`Images` from lucide-react) and `typeLabels` (`'callout.mediaGallery'`).
- [X] T007 [P] Add `framingMediaGallery?: { thumbnails: { id: string; url: string }[]; totalCount: number }` field to `PostCardData` in `PostCard.tsx`. In `mapCalloutDetailsToPostCard` (and the light mapper if visuals are available there — otherwise leave undefined), populate from `callout.framing.mediaGallery?.visuals` sorted by `sortOrder`. **Refined per T011**: `thumbnails = sorted.slice(0, 4).map(v => ({ id: v.id, url: v.uri }))`; `MediaGalleryFeedGrid` owns the 4th-cell overflow logic. Carrying `id` keeps React keys stable across reorders / deletions.
- [X] T008 [P] Create `src/main/crdPages/space/dataMappers/mediaGalleryDataMapper.ts`. Pure function `mapMediaGalleryToViewProps(model)` returning `{ feedThumbnails: { id: string; url: string }[]; totalCount: number; carouselItems: { id: string; uri: string; alternativeText?: string; name?: string }[] }`, all sorted by `sortOrder`. `feedThumbnails` is the first 4 `{ id, url }` pairs.
- [X] T008a [P] **(constitution §V — addresses analyze finding C3, part 1)** Unit test `src/main/crdPages/space/dataMappers/mediaGalleryDataMapper.test.ts`. Cover: (a) empty `visuals` array → `feedThumbnails: []`, `totalCount: 0`, `carouselItems: []`; (b) unsorted input (e.g. `sortOrder: [3, 1, 2]`) → outputs are sorted ascending by `sortOrder` in every field; (c) >4 visuals → `feedThumbnails.length === 4`, `totalCount` = full count, `carouselItems.length` = full count; (d) missing `alternativeText` on some items → passes through as `undefined`. No Apollo, no React — pure function test using Vitest.
- [X] T009 [P] Add CRD i18n keys to `src/crd/i18n/space/space.en.json` under `crd-space`: `mediaGallery.openImage`, `mediaGallery.more_one`, `mediaGallery.more_other`, `mediaGallery.previous`, `mediaGallery.next`, `mediaGallery.goToImage` (aria-label for pagination dots), `mediaGallery.download`, `mediaGallery.fullscreen`, `mediaGallery.exitFullscreen`, `mediaGallery.emptyState.title`, `mediaGallery.emptyState.action`, `mediaGallery.altTextLabel`, `mediaGallery.deleteImage`, `mediaGallery.validation.type`, `mediaGallery.validation.tooSmall`, `mediaGallery.validation.tooLarge`.
- [X] T009a [P] **(constitution §III — addresses analyze finding A2)** Verified: `callout.mediaGallery` already exists in `src/crd/i18n/space/space.en.json:153` as `"mediaGallery": "Media Gallery"`. `PostCard` resolves via `useTranslation('crd-space')` (not the default `translation` namespace), so the label renders correctly. No write to `src/core/i18n/en/translation.en.json` was needed; the analyze finding was based on a wrong-namespace assumption. Documented here to close the finding.

**Checkpoint**: After T005–T009a, US1 can start (mapper + prop path + primitive ready, labels resolvable). US2 can start in parallel.

---

## Phase 3: User Story 1 — Feed-level 4-tile grid (P1)

**Goal**: Media-gallery-framed callouts render a grid matching the whiteboard-contribution visual in `PostCard`, with per-tile hover "Open image" button and "+N more" overlay on the 4th when total > 4. Clicking any tile opens the callout detail dialog.

**Independent test**: In the CRD standalone app, render `PostCard` with `type='mediaGallery'` and `framingMediaGallery: { thumbnails: [url1, url2, url3], totalCount: 7 }`. Verify 3 full tiles + a 4th "+4 more" overlay render; every tile shows the hover "Open image" button; clicking any fires the `onClick` handler.

- [X] T010 [US1] Create `src/crd/components/mediaGallery/MediaGalleryFeedGrid.tsx`. **Shape finalised**: `thumbnails: { id: string; url: string }[]` — `id` used as React key on each tile and the overflow card so rows stay stable across reorder / delete. Props: `{ thumbnails: string[]; totalCount: number; onOpenAt(index?: number): void; className?: string }`. Reuses the Tailwind classes captured in T004 (bordered card, `min-h-[180px]`, hover ring, aspect ratio). Grid: `grid-cols-1 sm:grid-cols-2 gap-3 mt-4` (matches `ContributionsPreviewConnector`). Renders up to 4 cells:
  - Cells 1..3 show `thumbnails[0..2]` with a centered hover "Open image" button overlay (identical styling to `ContributionWhiteboardCard`'s hover button — same `bg-primary/40` backdrop, same `text-caption font-semibold` label). Each cell is a `<button>` with `aria-label={t('mediaGallery.openImage')}` and calls `onOpenAt(index)`.
  - Cell 4:
    - If `totalCount <= 3`: omit the cell (grid is 3-column on small, 2-column on mobile — layout degrades naturally).
    - If `totalCount === 4`: render the 4th thumbnail (need to pass it through; adjust `framingMediaGallery` or the mapper to include up to 4 thumbnails when `totalCount === 4`, otherwise 3 thumbnails + overlay). Confirm this during T007 refinement.
    - If `totalCount > 4`: render as an `OverlayMoreCard` clone — background image = `thumbnails[2]` (or a dedicated 4th-overlay thumbnail from the mapper), `absolute inset-0` overlay `bg-primary/60 backdrop-blur-[2px]` with `+{totalCount - 3} more` label. Click calls `onOpenAt()` (no index — let the dialog default to index 0).
- [X] T011 [US1] Revisit T007's mapper logic: to cleanly support the `totalCount === 4` "all 4 visible" case AND the `totalCount > 4` "3 + overlay" case, change `thumbnails` to always carry the first **4** URIs: `thumbnails = sorted.slice(0, 4).map(v => v.uri)`. `MediaGalleryFeedGrid` decides whether the 4th cell is a full tile (when `totalCount === thumbnails.length`) or an overlay-style "+N more" card (when `totalCount > thumbnails.length`).
- [X] T012 [US1] Extend `src/crd/components/space/PostCard.tsx`: alongside the whiteboard/memo framing branches, add `post.type === 'mediaGallery' && post.framingMediaGallery && post.framingMediaGallery.thumbnails.length > 0` → render `<MediaGalleryFeedGrid thumbnails={...} totalCount={...} onOpenAt={(idx) => onClick?.(idx)} />`. (Extending `onClick` to accept an optional index is acceptable since existing callers pass no args.)
- [ ] T013 [US1] **(deferred to follow-up session)** Standalone-demo wiring in `src/crd/app/pages/SpacePage.tsx`: add a mock media-gallery post with 7 image URLs (reuse `WB1..WB4` + 3 more Unsplash). Wire `onClick` to observe the index click. This is the stakeholder parity demo.

---

## Phase 4: User Story 2 — Inline carousel in detail dialog (P1)

**Goal**: The callout detail dialog renders `CalloutMediaGalleryCarousel` inline in its framing slot. Prev/next/pagination/download/fullscreen/keyboard/swipe all work without opening a second dialog.

**Independent test**: In the CRD standalone app, mount `CalloutMediaGalleryCarousel` directly with 6 mock items at `initialIndex=2`. Verify: shows the 3rd image; ←/→ cycle; `Home`/`End` jump; pagination dots track the current index; download button triggers an anchor download; fullscreen toggle enters/leaves browser fullscreen; touch swipe advances.

- [X] T014 [US2] Create `src/crd/components/callout/CalloutMediaGalleryCarousel.tsx`. Props: `{ items: { id: string; uri: string; alternativeText?: string; name?: string }[]; initialIndex?: number; onAddImages?(): void; canEdit?: boolean; className?: string }`. Structure:
  - Wraps `primitives/carousel`'s `<Carousel>` + `<CarouselContent>` + `<CarouselItem>` per image, with `<CarouselPrevious>` + `<CarouselNext>` overlaid on the sides.
  - Top-right corner: download button (calls helper in T016) and fullscreen button (calls helper in T017); both icon-only with `aria-label`s.
  - Below the carousel content: alt-text caption strip (`<figcaption>`-style, omitted when no `alternativeText`).
  - Below that: pagination row — dots for `items.length <= 7`, else `"{current + 1} / {items.length}"` counter. Dots are `<button>` each with `aria-label={t('mediaGallery.goToImage', { index: i + 1 })}` and call `api.scrollTo(i)`.
  - Empty state (when `canEdit && items.length === 0`): a dashed-border block with `t('mediaGallery.emptyState.title')` and a `<Button>` labelled `t('mediaGallery.emptyState.action')` calling `onAddImages`.
- [X] T015 [US2] Carousel index bookkeeping: use `CarouselApi` from the primitive's ref. On mount, if `initialIndex` is set, call `api.scrollTo(initialIndex, true)` (instant, no animation). Subscribe to `api.on('select', ...)` and setState for the current index so pagination + caption stay in sync. Unsubscribe in cleanup.
- [X] T016 [P] [US2] Download helper: given the current item, create an anchor `<a>` with `href = item.uri`, `download = item.name ?? ''`, click, remove. Export as `downloadMediaGalleryImage(item)` within the same file or as a sibling utility. Expose an `onDownload?(item)` prop override for consumers that want to log/intercept (default falls through to the helper).
- [X] T017 [P] [US2] Fullscreen helper: thin `toggleFullscreen(rootEl)` wrapper that prefers `rootEl.requestFullscreen()` then falls back to `webkitRequestFullscreen`. Guard the button render by `document.fullscreenEnabled`. `document.exitFullscreen()` on second click. No library.
- [X] T018 [P] [US2] Keyboard handling: `onKeyDown` on the carousel root. `ArrowLeft` → `api.scrollPrev()`; `ArrowRight` → `api.scrollNext()`; `Home` → `api.scrollTo(0)`; `End` → `api.scrollTo(last)`; `KeyF` → toggle fullscreen. (Escape is handled by Radix Dialog's default on the outer callout dialog — don't stop propagation.) Embla already handles touch swipe; verify no extra wiring needed.
- [X] T019 [US2] Create `src/main/crdPages/space/callout/MediaGalleryFramingConnector.tsx`. Reads `callout.framing.mediaGallery` from the details query (no new query), maps via `mapMediaGalleryToViewProps` (T008), renders `<CalloutMediaGalleryCarousel items={carouselItems} initialIndex={initialIndex} canEdit={canEdit} onAddImages={...} />`. `initialIndex` is a prop from the connector's caller (see T021). `onAddImages` is deferred to US3 — pass `undefined` for now (the empty-state button simply won't appear until T026 wires it).
- [X] T020 [US2] Extend `src/crd/components/callout/CalloutDetailDialog.tsx` with `mediaGalleryFramingSlot?: ReactNode` prop (mirrors `memoFramingSlot` / `whiteboardFramingSlot`); render in the same region as the others.
- [X] T021 [US2] In `src/main/crdPages/space/callout/CalloutDetailDialogConnector.tsx`: branch on `callout.framing.type === CalloutFramingType.MediaGallery` → pass `<MediaGalleryFramingConnector callout={callout} initialIndex={mediaGalleryInitialIndex} />` as `mediaGalleryFramingSlot`. Add a new `mediaGalleryInitialIndex?: number` prop on the connector, forwarded from `LazyCalloutItem` (T022).
- [ ] T022 [US2] **(deferred to follow-up session — carousel defaults to index 0 on open, per plan's deferral allowance)** Extend `src/main/crdPages/space/callout/LazyCalloutItem.tsx` so the post-card click signature carries an optional third arg: `onClick(contributionId?, memoId?, mediaGalleryInitialIndex?)`. Threads the index from `PostCard`'s media-gallery branch into `CalloutDetailDialogConnector`. If this noticeably complicates the signature, defer: start the carousel at index 0 and skip this task. Record the decision in the PR description.
- [ ] T023 [US2] **(deferred to follow-up session)** Standalone-demo wiring in `src/crd/app/pages/SpacePage.tsx`: clicking the feed grid opens a stub dialog that mounts `CalloutMediaGalleryCarousel` directly (stakeholder-facing proof that the carousel is inline, not a second dialog).

---

## Phase 5: User Story 3 — Upload + delete form field (P1)

**Goal**: Users with `Update` privilege can choose Media Gallery in the callout form and upload/delete images with client-side validation. Reorder deferred.

**Independent test**: In the CRD standalone app, mount `MediaGalleryField` with a mock `onUpload` (resolves after 500ms) and an `onDelete` that removes from local state. Verify: upload button opens file picker; selecting 2 images shows them in the grid after upload; invalid files show inline error messages and don't call `onUpload`; delete button on hover removes a visual and calls `onDelete`.

- [X] T023b [US3] **(added after MUI audit)** Extend `src/main/crdPages/space/hooks/useCrdCalloutForm.ts` with a `mediaGalleryVisuals: MediaGalleryFormVisual[]` field where `MediaGalleryFormVisual = { id?: string; file?: File; uri?: string; altText?: string; sortOrder?: number }` — matches the contract of `useUploadMediaGalleryVisuals` verbatim so the integration layer can forward the array without translation. Initial value: `[]`. Reset on `reset()`.
- [X] T023c [US3] **(added after MUI audit)** Extend `src/main/crdPages/space/callout/FramingEditorConnector.tsx` with an `image` case rendering `<MediaGalleryFormFieldConnector visuals={...} onVisualsChange={...} />`. Accept `mediaGalleryVisuals` + `onMediaGalleryVisualsChange` props threaded from `CalloutFormConnector`.
- [X] T023d [US3] **(added after MUI audit)** Extend `src/main/crdPages/space/callout/CalloutFormConnector.tsx`'s submit sequence: after `handleCreateCallout(callout)` returns a result, if `framingType === MediaGallery && mediaGalleryVisuals.length > 0`, call `uploadMediaGalleryVisuals({ mediaGalleryId: result.framing.mediaGallery?.id, visuals: mediaGalleryVisuals })`. Mirror the existing whiteboard/memo preview upload pattern in `useCalloutCreationWithPreviewImages.ts:69-93`.
- [X] T024 [US3] Create `src/crd/forms/mediaGallery/validateMediaFile.ts`. Pure `validateMediaFile(file, constraints): Promise<{ ok: true } | { ok: false; reason: 'type' | 'tooSmall' | 'tooLarge' }>`. If `file.type` is `image/heic`/`image/heif`, return `ok: true`. Otherwise: check `allowedMimeTypes`; if ok, decode to `HTMLImageElement` via `URL.createObjectURL` + `img.decode()`; check dimensions vs `min/max`. Free the object URL in a finally block. No React, no i18n.
- [X] T024a [US3] **(constitution §V — addresses analyze finding C3, part 2)** Unit test `src/crd/forms/mediaGallery/validateMediaFile.test.ts`. Cover: (a) unsupported MIME type → `{ ok: false, reason: 'type' }`; (b) HEIC file (`image/heic` and `image/heif`) → always `{ ok: true }`, regardless of other constraints (decode is skipped); (c) image below `minWidth`/`minHeight` → `{ ok: false, reason: 'tooSmall' }`; (d) image above `maxWidth`/`maxHeight` → `{ ok: false, reason: 'tooLarge' }`; (e) image within bounds → `{ ok: true }`; (f) no `constraints` passed → permissive pass. Mock `HTMLImageElement.decode` via a wrapper or stub `URL.createObjectURL`; keep the test environment-agnostic (Vitest + jsdom). No DOM assertions, no React.
- [X] T025 [US3] Create `src/crd/forms/mediaGallery/MediaGalleryField.tsx`. Props per plan §Component Inventory. Visually-hidden `<input type="file" multiple accept={...} />` + styled `<Button>` trigger. On file select, calls `validateMediaFile` per file; pushes errors to `validationErrors` state; calls `onUpload(file, defaultAlt)` for valid ones in sequence. Renders the tile grid from `visuals` sorted by `sortOrder`. No `@dnd-kit` yet (added in T028).
- [X] T026 [P] [US3] **Merged into T025**: the tile UI is inline inside `MediaGalleryField.tsx` (hover delete button pattern). Split-out deferred; current implementation is compact enough. Private tile: thumbnail `<img>` + delete button overlay on hover (`aria-label={t('mediaGallery.deleteImage', { name: alt })}`).
- [X] T027 [US3] Create `src/main/crdPages/space/callout/MediaGalleryFormFieldConnector.tsx`. **Scope adjusted per MUI audit**: the connector is an integration wrapper that supplies `constraints` from `useDefaultVisualTypeConstraintsQuery` and forwards state up to the form. Upload/delete mutations are NOT wired here — they're orchestrated post-save in `CalloutFormConnector` via `useUploadMediaGalleryVisuals` (the same hook MUI uses), because visuals can only be uploaded after the callout's `mediaGalleryId` exists.
- [X] T028 [US3] Wire `MediaGalleryFormFieldConnector` into `src/main/crdPages/space/callout/CalloutFormConnector.tsx`. Now done through `FramingEditorConnector`'s new `image` case — T023c + T023d cover the full wiring.
- [ ] T029 [US3] **(deferred)** Pass an `onAddImages` from `MediaGalleryFramingConnector` (T019) that opens the callout edit form at the media-gallery section so the detail-dialog empty state (T014) can route users to the editor.

---

## Phase 5b: User Story 3b — Reorder (P1)

**Goal**: `MediaGalleryField` supports drag-and-drop reorder with `@dnd-kit` including keyboard sensor for a11y. Connector persists per-visual `sortOrder`.

**Independent test**: In the CRD standalone app, drop a tile from position 3 to position 1. Verify: UI updates optimistically; `onReorder` called with new id order; keyboard drag via tile handle + Space/arrows also works.

- [ ] T030 [US3b] Add `@dnd-kit/core` + `@dnd-kit/sortable` + `@dnd-kit/utilities` wiring inside `MediaGalleryField.tsx` (T025). `DndContext` + `PointerSensor` + `KeyboardSensor`; `SortableContext` with `rectSortingStrategy`. Wrap `MediaGalleryTile` in a small internal `SortableMediaGalleryTile` via `useSortable` (don't modify T026's tile — compose).
- [ ] T031 [US3b] On `onDragEnd`: compute new order, set optimistic local state, call `props.onReorder(newOrderIds)`. On reject, revert.
- [ ] T032 [US3b] Extend `MediaGalleryFormFieldConnector` (T027) with `onReorder`: iterate ids, call the reorder mutation (hook name confirmed by T003) per visual with the new `sortOrder`. Await refetch of `CalloutDetails` once at the end. Serialize concurrent drags with a ref-guarded lock.
- [ ] T032a [US3b] Accessibility announcements: pass `@dnd-kit`'s `announcements` prop with localized strings (`t('mediaGallery.reorder.picked', …)`, `t('mediaGallery.reorder.moved', …)`). Add the keys to `space.en.json` in this task (extension of T009). Verify with a screen reader.

---

## Phase 6: User Story 4 — Parity, a11y, cleanup (P2)

- [ ] T033 [US4] Delete `src/crd/components/callout/CalloutMediaGallery.tsx` (superseded by `CalloutMediaGalleryCarousel` + `MediaGalleryFeedGrid` + `MediaGalleryField`). Remove any stale imports.
- [ ] T034 [US4] Manual a11y + parity pass (MUI vs CRD side by side with the CRD toggle). Keyboard path: feed tile → callout detail dialog → carousel → arrow-key navigate → `F` fullscreen → `Esc` (should close the callout dialog, not trap inside the carousel). Verify, recording pass/fail in the PR description:
  - Embla's internal focus management does not steal focus when the carousel mounts.
  - `F` key does not conflict with Radix Dialog focus-trap bindings.
  - Download button produces a file save in all supported browsers.
  - Pagination dots are all reachable via `Tab` and each has a distinct `aria-label`.
  - Drag-and-drop keyboard sensor reorder announces correctly via screen reader.
  - Empty state (`canEdit && items.length===0`) shows the "Add images" button; non-editor + empty = no framing slot.
  - Non-latin + long alt text doesn't overflow the caption strip.
- [ ] T035 [P] [US4] Grep `src/crd/components/mediaGallery/`, `src/crd/components/callout/CalloutMediaGalleryCarousel.tsx`, `src/crd/forms/mediaGallery/` for JSX string literals — each must resolve via `useTranslation('crd-space')`.
- [ ] T036 [P] [US4] Final forbidden-import sweep across `src/crd/`: `@mui/`, `@emotion/`, `react-image-gallery`. Zero hits expected.
- [ ] T037 [P] [US4] Validation parity: round-trip a known-bad JPEG (below minWidth) and a known-good JPEG through both MUI and CRD fields; confirm they reject/accept identically. Record in the PR description.
- [ ] T038 [US4] Verify `pnpm exec tsc --noEmit` passes and the bundle size delta is acceptable (no accidental inclusion of `react-image-gallery` or `yet-another-react-lightbox`; `embla-carousel-react` is the only new dep). Run `pnpm analyze` if in doubt.

---

## Dependencies

```
Setup (T001–T004)
   │
Foundational (T005–T009a)
   │
   ├──► US1 (T010–T013)              ← feed grid
   │
   ├──► US2 (T014–T023)              ← inline carousel; can overlap US1
   │
   ├──► US3 (T024–T029)              ← form field upload/delete; needs T002/T003 confirmed
   │         │
   │         └──► US3b (T030–T032a)  ← reorder; depends on T025
   │
   └──► US4 (T033–T038)              ← gating; do not start until US1–US3b merged green

Unit tests:
   T008a  ← accompanies T008 (mapper)
   T024a  ← accompanies T024 (validateMediaFile)
```

- US1 and US2 are visually independent — US1 can ship with a stub `onOpenAt` that logs.
- US2 is independent of US3 — the carousel works read-only without the form field.
- US3b strictly depends on US3's tile grid.
- US4 is gating.

## Parallel Execution Examples

**After Foundational completes:**
- Contributor A: T010 → T011 → T012 → T013 (US1 end-to-end).
- Contributor B: T014 → T016/T017/T018 in parallel tabs → T019 → T020 → T021 (US2).

**Inside US3:**
- T024, T026 are `[P]`-safe (different files).
- T027 can develop in parallel with T025 behind a mock `MediaGalleryField`.

## Implementation Strategy

- **MVP = US1 + US2 demo-ready.** Stakeholders can validate the feed grid + inline carousel end-to-end without the form-field risk. The empty-state button wires to a toast ("coming in US3") until T029 lands.
- **Ship US3 behind the existing CRD toggle** — no new flag needed.
- **Defer US4 until parity QA** — a11y, screen-reader announcements, and cleanup are faster with the full flow in place.

## Format Validation

All tasks follow `- [ ] TNNN [P?] [USn?] Description with file path` — checkboxes present, IDs T001–T038 plus inserted T008a, T009a, T024a, T032a (total **42 tasks**), story labels on Phase 3–6 tasks only, file paths on every implementation task.
