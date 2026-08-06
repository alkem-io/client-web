# Phase 1 Data Model: Render File Thumbnail / Preview in Post Cards

**Feature**: 116-postcard-file-thumbnail | **Story**: alkem-io/client-web#9872

This feature is a presentational UI enhancement with **no new GraphQL query, no schema
change, no persisted data, no domain entities**. The "model" here is the component prop
contract, the type→visual mapping, and the one new optional field threaded through the
existing `PostCardData` shape. All types are plain TypeScript (no generated GraphQL
types), per Constitution III and the CRD-only rule.

## Component / interface contracts

### `CalloutCollaboraPreviewProps` (presentational, `src/crd/components/callout/CalloutCollaboraPreview.tsx`)

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `documentType` | `CollaboraDocumentPreviewType` (`'text' \| 'spreadsheet' \| 'presentation'`) | yes | Unchanged — existing prop, now also drives `colorByType`. |
| `onOpen` | `() => void` | yes | Unchanged. |
| `onReplace` | `() => void` | no | Unchanged (workspace#014-officedocs-replace-file). |
| `previewImageUrl` | `string` | no | **NEW.** When present (and has not errored), renders in place of the type-icon treatment. `undefined` in all production data today (spec FR-004/FR-005). |
| `size` | `'default' \| 'compact'` | no | Unchanged, default `'default'`. |
| `className` | `string` | no | Unchanged. |

Invariant: the centered content is `previewImageUrl && !imageErrored ? <img ... /> :
<Icon className={colorByType[documentType]} ... />` (FR-005/FR-006). The badge always
renders `<Icon className={colorByType[documentType]} />` + `typeLabel`, regardless of
`previewImageUrl` (badge is unaffected by the image-vs-icon branch — spec FR-001a).

### Type → visual mapping (module-level, inside the component file)

| `CollaboraDocumentPreviewType` | Icon (`lucide-react`, unchanged) | Color (`colorByType`, NEW) |
|---|---|---|
| `text` | `FileText` | `text-blue-600` |
| `spreadsheet` | `Sheet` | `text-green-600` |
| `presentation` | `Presentation` | `text-orange-600` |

Sourced from `CollaboraDocumentType` (GraphQL enum: `WORDPROCESSING`, `SPREADSHEET`,
`PRESENTATION`, `DRAWING`) via the existing, unchanged
`mapCollaboraDocumentTypeToPreviewType` (`calloutDataMapper.ts`), which collapses
`DRAWING → 'text'` (so Drawing intentionally shares the blue Wordprocessing treatment —
spec Clarifications).

### `PostCardData` (presentational, `src/crd/components/space/PostCard.tsx`) — new field only

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `framingDocumentPreviewUrl` | `string` | no | **NEW.** Document framing only, mirrors `framingImageUrl`'s role for whiteboard framing. Threaded to `contributionsPreview`/document-branch rendering as `CalloutCollaboraPreview`'s `previewImageUrl`. `undefined` today (spec FR-004). |

All other `PostCardData` fields are unchanged by this story.

## Data flow (mapper → card → component)

```
calloutDataMapper.ts: mapCalloutDetailsToPostCard(callout, t)
  └─ framingDocumentPreviewUrl: undefined
       // No backend field exists yet to populate this from (spec A-001; see Research R3).
       // Deliberately a flat `undefined` today, not a `callout.framing.type === ...`
       // ternary like the sibling `framingImageUrl`/`framingDocumentType` fields — there
       // is no real branch to take yet, so a conditional would be dead code. Once a
       // backend field lands, this becomes a real ternary mirroring `framingImageUrl`'s
       // shape exactly.

PostCard.tsx (post.type === 'document' branch)
  └─ <CalloutCollaboraPreview
       documentType={post.framingDocumentType}
       previewImageUrl={post.framingDocumentPreviewUrl}   // NEW pass-through
       onOpen={...} onReplace={...} size="compact" />

CollaboraFramingConnector.tsx (dialog, unchanged this story)
  └─ <CalloutCollaboraPreview
       documentType={toCollaboraPreviewType(collaboraDocument.documentType)}
       onOpen={...} onReplace={...} />   // previewImageUrl omitted → undefined,
                                          // same icon/color treatment as the card (P1/P2)
```

**Follow-up hook (not implemented in this story):** when a real backend preview field
exists (post-alkemio#1673), wiring the dialog is a single added prop line in
`CollaboraFramingConnector.tsx`: `previewImageUrl={collaboraDocument.profile?.preview?.uri}`
— mirroring the whiteboard's `preview: visual(type: WHITEBOARD_PREVIEW)` GraphQL pattern
exactly. Not added now because there is no field to read yet (would be dead code) — see
spec Assumptions A-001/A-002 and plan.md's Project Structure note.

## Side-effect model

| Effect | Location | When | Notes |
|--------|----------|------|-------|
| `imageErrored` state flip | `CalloutCollaboraPreview` (`<img onError>`) | only if a future `previewImageUrl` fails to load | Visual-only local `useState`; no network/logging/persistence. Never triggered today since `previewImageUrl` is always `undefined` in production. |

No GraphQL query changes, no new Apollo cache shape, no persisted state. The mapper
change is a pure, synchronous field addition to an existing return object.
