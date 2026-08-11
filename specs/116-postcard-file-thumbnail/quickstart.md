# Quickstart: Render File Thumbnail / Preview in Post Cards

**Feature**: 116-postcard-file-thumbnail | **Story**: alkem-io/client-web#9872

## Prerequisites

- Node ≥ 24, pnpm ≥ 10.17.1 (`pnpm install` if deps are missing).
- Working in the worktree: `client-web-story-9872-render-file-thumbnail-preview-in-post-cards` on branch `story/9872-render-file-thumbnail-preview-in-post-cards`.

## What ships in this PR

- `src/crd/components/callout/CalloutCollaboraPreview.tsx` — type-differentiated icon
  color (blue/green/orange for Doc/Sheet/Presentation) on both the badge and the
  centered fallback icon; new optional `previewImageUrl` prop with image-else-icon
  rendering and graceful `onError` fallback.
- `src/crd/components/callout/CalloutCollaboraPreview.test.tsx` — new unit tests.
- `src/crd/components/space/PostCard.tsx` — `PostCardData.framingDocumentPreviewUrl`
  field + pass-through to `CalloutCollaboraPreview`.
- `src/main/crdPages/space/dataMappers/calloutDataMapper.ts` —
  `framingDocumentPreviewUrl` threading in `mapCalloutDetailsToPostCard` (mirrors the
  existing `framingImageUrl` whiteboard mechanism; `undefined` today, no backend field
  exists yet).
- `src/main/crdPages/space/dataMappers/calloutDataMapper.test.ts` — new unit test.

**Follow-up bundled into this PR** (after #10122 "Documents as a response type" merged to
`develop` and added a second consumer of the type→visual mapping):
- `src/crd/lib/collaboraDocumentPreview.ts` — the type→`{icon, color, labelKey}` mapping
  extracted out of `CalloutCollaboraPreview.tsx` into a shared module (spec A-004's
  anticipated follow-up), so both `CalloutCollaboraPreview` and the new
  `ContributionDocumentCard` consume the same source of truth instead of drifting apart.
- `src/crd/components/contribution/ContributionDocumentCard.tsx` — now applies
  `colorByType` to its icon (previously always flat `text-muted-foreground/40`).
- `src/crd/components/contribution/ContributionDocumentCard.test.tsx` — new unit tests.

No GraphQL, schema, route, or dependency changes. No i18n file changes (existing
`callout.document`/`documentSpreadsheet`/`documentPresentation` keys are reused as
alt text — see research.md R4).

## Not in this PR (documented, deliberately deferred)

- Real backend-rendered document thumbnails (needs a new `VisualType` + Collabora/WOPI
  generation — cross-repo, blocked on alkemio#1673's own "Previews" scope leaving "TBD").
- `CollaboraFramingConnector.tsx` (the dialog connector) is **not** edited — it already
  renders through the same `CalloutCollaboraPreview`, so the icon/color treatment applies
  there automatically. Wiring its own `previewImageUrl` is a one-line follow-up once a
  real backend field exists (see data-model.md).
- Rendering the `CalloutContributionType.COLLABORA_DOCUMENT` case in the contributions
  grid was a pre-existing, unrelated gap (spec Assumption A-003) when this story was
  originally scoped; #10122 (a separate PR) has since built that rendering
  (`ContributionDocumentCard`). This PR only adds the shared color mapping to it — see
  "Follow-up bundled into this PR" above.

## Local verification (exit gates)

```bash
# from the worktree root
pnpm lint           # TypeScript + Biome + ESLint
pnpm vitest run     # full unit suite (must pass)

# run just the new/changed tests during development
pnpm vitest run src/crd/components/callout/CalloutCollaboraPreview.test.tsx --reporter=basic
pnpm vitest run src/main/crdPages/space/dataMappers/calloutDataMapper.test.ts --reporter=basic
pnpm vitest run src/crd/components/space/PostCard.test.tsx --reporter=basic
pnpm vitest run src/crd/components/contribution/ContributionDocumentCard.test.tsx --reporter=basic
```

## Manual smoke test

1. Open a Space with an OfficeDocs (Collabora) Post — one each of Doc/Sheet/Slide if
   available.
2. In the feed: each Post card's document preview box shows a colored icon (blue/green/
   orange) matching its kind, not the previous flat grey icon.
3. Click the card to open the post/callout detail dialog: the same colored icon appears
   at the larger `aspect-video` size — same color as the card.
4. Hover the preview: "Open Document" overlay still appears; click still opens the
   editor. For a user with edit rights, "Replace file" still renders and works.

## Success criteria recap

- 100% of OfficeDocs Post cards show a type-differentiated preview, not the flat icon (SC-001).
- Card and dialog previews are visually identical for the same document (SC-002).
- Zero new GraphQL fields/schema/dependencies (SC-003).
- A mocked `previewImageUrl` renders as an image with no component-structure change (SC-004).
- Gates green: `pnpm lint` + `pnpm vitest run` (SC-005).
