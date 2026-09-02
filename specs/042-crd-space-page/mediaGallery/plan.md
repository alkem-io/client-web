# Implementation Plan: CRD Media Gallery Migration

**Branch**: `042-crd-space-page-<next>` | **Parent**: [../plan.md](../plan.md) | **Spec**: [./spec.md](./spec.md)

## Summary

Migrate the full media-gallery experience to CRD:

- **Feed-level preview** in `PostCard` rendered as a 4-tile grid that visually mirrors `ContributionsPreviewConnector`'s whiteboard-contribution grid (4-card max, per-tile hover "Open image" button, "+N more" overlay on the 4th tile when total > 4). Click target = callout detail dialog.
- **Detail-level presentation** as an **inline carousel inside `CalloutDetailDialog`'s framing slot** — no separate lightbox dialog, no z-[60] stack. Prev/next, pagination, download, browser-fullscreen toggle, keyboard, and swipe all live on that carousel.
- **Form field** for upload/reorder/delete using `@dnd-kit` with client-side validation; upload flow (`useAddVisualToMediaGalleryMutation` → `useUploadVisualMutation`) reused from the existing `useUploadMediaGalleryVisuals` path in the integration connector.

The plan shifts away from the memo/whiteboard "click tile → second Radix Dialog" pattern because media galleries are framing-only (not contributions) and benefit from inline browsing. The browser-fullscreen option covers the immersive use case without adding a second dialog to the focus-trap stack.

## Component Inventory

### New in `src/crd/`

| Path | Role | Notes |
|---|---|---|
| `primitives/carousel.tsx` | shadcn/Embla carousel primitive | Port from shadcn's `carousel` recipe on first use. Exports `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`, `CarouselApi`. No MUI |
| `components/callout/CalloutMediaGalleryCarousel.tsx` | Inline detail-dialog carousel | Wraps `primitives/carousel`; adds download button, fullscreen toggle, pagination, alt-text caption. Props: `items`, `initialIndex`, `onAddImages?`, `canEdit?` |
| `components/mediaGallery/MediaGalleryFeedGrid.tsx` | Feed-level 4-tile grid | Matches `ContributionWhiteboardCard` visual shape — bordered card, hover scale, centered "Open image" hover button, "+N more" overlay on the 4th tile when `totalCount > 4`. Props: `thumbnails: { id: string; url: string }[]` (id carried through for stable React keys across reorder/delete), `totalCount`, `onOpenAt(index?: number): void` |
| `forms/mediaGallery/MediaGalleryField.tsx` | Upload/reorder/delete tile grid | Props only: `visuals`, `onUpload`, `onDelete`, `onReorder`, `constraints`, `disabled`, `uploading`. `@dnd-kit` internal |
| `forms/mediaGallery/MediaGalleryTile.tsx` | Draggable tile (private helper) | Delete button on hover |
| `forms/mediaGallery/validateMediaFile.ts` | Pure validation helper | Type + dimensions check; HEIC passes through |

Refinements to existing CRD files:
- `components/callout/CalloutMediaGallery.tsx` — **delete** (stub superseded by `CalloutMediaGalleryCarousel` + `MediaGalleryFeedGrid` + `MediaGalleryField`).
- `components/space/PostCard.tsx` — add a `post.type === 'mediaGallery'` branch rendering `MediaGalleryFeedGrid` with the `framingMediaGallery` payload. Click target is the same `onClick` the whiteboard/memo branches use → opens the callout detail dialog.

### New in `src/main/crdPages/space/callout/`

| Path | Role |
|---|---|
| `MediaGalleryFramingConnector.tsx` | Maps `callout.framing.mediaGallery` → `CalloutMediaGalleryCarousel` props; owns `initialIndex` state (optionally driven from the feed-tile click); renders the carousel inline (no extra dialog) |
| `MediaGalleryFormFieldConnector.tsx` | Wraps `MediaGalleryField`; wires `useAddVisualToMediaGalleryMutation` + `useUploadVisualMutation` + `useDeleteVisualFromMediaGalleryMutation` + reorder + `useDefaultVisualTypeConstraintsQuery` |
| `../dataMappers/mediaGalleryDataMapper.ts` | Pure: `MediaGalleryModel` → `{ feedThumbnails: { id, url }[], totalCount, carouselItems }`, sorted by `sortOrder` |

Refinements to existing integration:
- `CalloutDetailDialogConnector.tsx` — add `mediaGalleryFramingSlot` (mirrors `memoFramingSlot`/`whiteboardFramingSlot`); wire `MediaGalleryFramingConnector` when `callout.framing.type === CalloutFramingType.MediaGallery`. Unlike memos/whiteboards there is **no** sibling "overlay" dialog — the carousel is fully self-contained inside the slot.
- `CalloutFormConnector.tsx` — render `MediaGalleryFormFieldConnector` when the form's selected framing type is `MediaGallery`.
- `dataMappers/calloutDataMapper.ts`:
  - `mapFramingTypeToPostType` returns `'mediaGallery'` for `CalloutFramingType.MediaGallery`.
  - `mapCalloutDetailsToPostCard` (and the light mapper if visuals are present in the light query) populates `framingMediaGallery`.
- `LazyCalloutItem.tsx` — the existing click signature `(id?, memoId?)` gains an optional `mediaGalleryInitialIndex?: number` third arg, routed via `CalloutDetailDialogConnector` into `MediaGalleryFramingConnector`'s `initialIndex`. (Optional enhancement — if it complicates the signature, skip and start the carousel at 0.)
- `src/crd/components/space/PostCard.tsx` — `PostType` gains `'mediaGallery'`; `PostCardData` gains `framingMediaGallery?: { thumbnails: string[]; totalCount: number }`; `typeIcons['mediaGallery'] = Images`; `typeLabels['mediaGallery'] = 'callout.mediaGallery'`.

## Design Decisions

### M1: Inline carousel in the detail dialog — no separate lightbox
Memos and whiteboards open a second Radix Dialog on top of the callout dialog because their content is complex (full editor / whiteboard surface) and benefits from dedicated real estate. Media galleries are just images — the callout detail dialog already has plenty of width for an inline carousel, and a second dialog adds stacking/focus-trap complexity with no user benefit. Browser fullscreen (`element.requestFullscreen`) gives the "large-screen view" use case without a second Radix layer.

### M2: Port shadcn's `carousel` primitive (Embla-based) on first use
Embla is lightweight (~10 KB), Tailwind-friendly, handles keyboard + touch + loop natively, and its shadcn wrapper is already a standard pattern in the project's design reference. Put the primitive at `src/crd/primitives/carousel.tsx` and use it from `CalloutMediaGalleryCarousel`. Future consumers (e.g. a testimonial section) can reuse it without porting again.

### M3: Feed grid = whiteboard-contribution visual, capped at 4
The feed preview visually mirrors `ContributionsPreviewConnector`'s whiteboard path: 4-card grid, per-tile hover "Open image" button, "+N more" overlay on the 4th tile when `totalCount > 4`. The label reads `+{totalCount - 3} more`. This reuses familiar affordances — users already learned "grid + overlay = more behind" from whiteboard contributions. Click anywhere routes to the callout detail dialog (not to a lightbox); the optional `initialIndex` lets the detail carousel open on the clicked image.

**Pagination control inside the carousel**: dots for `totalCount ≤ 7`, else a compact `current / total` counter. A thumbnail filmstrip is deferred unless UX asks for it post-P2 — it's incremental to add.

### M4: Keep `@dnd-kit` for reorder
Framework-agnostic, Tailwind-native, already a project dep. Allowed inside `src/crd/forms/` under the "visual UX plumbing" carve-out.

### M5: i18n namespace = `crd-space`
Follow the memo precedent. Media-gallery keys go under `mediaGallery.*` within `crd-space`: `mediaGallery.openImage`, `mediaGallery.more` (plural-aware), `mediaGallery.previous`, `mediaGallery.next`, `mediaGallery.download`, `mediaGallery.fullscreen`, `mediaGallery.exitFullscreen`, `mediaGallery.emptyState.title`, `mediaGallery.emptyState.action`, `mediaGallery.altTextLabel`, `mediaGallery.deleteImage`, plus validation-reason strings.

### M6: Two-step upload stays in the integration layer
`MediaGalleryField` takes a simple `onUpload(file, alt)` prop. The connector orchestrates `useAddVisualToMediaGalleryMutation` → `useUploadVisualMutation` + refetch, exactly as `useUploadMediaGalleryVisuals.ts` does today.

### M7: Reorder is a single bulk callback
`MediaGalleryField` emits `onReorder(orderedIds: string[])` once the user drops a tile. The connector writes the new `sortOrder` per visual.

### M8: Validation lives in the form field
`validateMediaFile` is a pure function inside `src/crd/forms/mediaGallery/`; no GraphQL, no i18n. Returns a discriminated result. The field translates the `reason` via `t('mediaGallery.validation.<reason>')`. HEIC always passes — the server converts.

### M9: Scope boundary — no contribution plumbing
Unlike memos/whiteboards, there's no contribution connector, no `ContributionGridConnector` wiring, no `ContributionsPreviewConnector` changes for media-gallery framings. The feed-grid visual *resembles* the contribution grid but is produced independently by the framing mapper.

## Phased Implementation

| Phase | What ships | Effort |
|---|---|---|
| P0 | `primitives/carousel.tsx` port + data mapper + `PostType` / `PostCardData` additions | S |
| P1 | `MediaGalleryFeedGrid` + `PostCard` feed branch | S |
| P2 | `CalloutMediaGalleryCarousel` (carousel, download, fullscreen, keyboard) + `MediaGalleryFramingConnector` + `mediaGalleryFramingSlot` wiring | M |
| P3 | `MediaGalleryField` (upload + tile grid + delete) — no reorder yet | M |
| P4 | `@dnd-kit` reorder + keyboard sensor | S |
| P5 | Validation + HEIC passthrough + inline error UI | S |
| P6 | i18n keys, a11y pass, parity QA with MUI, remove stub `CalloutMediaGallery.tsx`, forbidden-import sweep | S |

## Complexity Tracking

| Risk | Mitigation |
|---|---|
| Embla Carousel API shifts between minor versions | Pin the version; follow shadcn's exact wrapper shape. The wrapper surface area is small and stable. |
| Fullscreen API browser quirks (Safari prefix) | Thin helper that tries `requestFullscreen` then `webkitRequestFullscreen`; feature-detect `document.fullscreenEnabled` and hide the toggle when unavailable. |
| Drag-and-drop accessibility (screen readers) | Use `@dnd-kit`'s `ScreenReaderInstructions` defaults; add `aria-label` on each tile's grip and delete buttons. |
| HEIC upload breaks client validation | `validateMediaFile` short-circuits on `image/heic`/`image/heif` before the decode step. |
| Feed-grid + detail-carousel initial-index coupling | If `initialIndex` routing via `LazyCalloutItem` → `CalloutDetailDialogConnector` → `MediaGalleryFramingConnector` proves fragile, default to index 0 — the user can swipe to the intended image in one step. Not a hard requirement for MVP. |
| Reorder mutation is per-visual, not bulk | Connector iterates and awaits refetch once. Serialize concurrent drags behind a ref-guarded lock. |

## Open Items (resolved during implementation)

- **Exact reorder hook**: confirm the mutation name used by the MUI code path. Likely `useUpdateVisualSortOrderMutation` or similar — do not invent a new one.
- **Thumbnail filmstrip** inside the carousel: deferred unless UX asks for it. Pagination dots / counter is the default.
- **Initial-index click routing**: if `LazyCalloutItem` gets ugly with a third optional arg, ship with carousel default `initialIndex = 0`.
