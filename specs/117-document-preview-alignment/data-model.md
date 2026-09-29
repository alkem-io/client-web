# Data Model: Document Preview Alignment

**Feature**: 117-document-preview-alignment
**Date**: 2026-08-20

## Overview

No new data entities, GraphQL fields, or persistent storage changes. This feature modifies only client-side component props and integration-layer type shapes.

## Modified Entities

### ContributionDocumentCard Props

| Field | Type | Change | Description |
|---|---|---|---|
| `title` | `string` | Unchanged | Document display name |
| `documentType` | `CollaboraDocumentPreviewType` | Unchanged | Drives icon + accent color |
| `author` | `string?` | Unchanged | Author display name |
| `previewUrl` | `string?` | **Added** | Optional preview image URL; `undefined` in production today |
| `onClick` | `() => void?` | Unchanged | Click handler |
| `className` | `string?` | Unchanged | Tailwind class composition |

### ContributionCardData (contributionDataMapper.ts)

| Field | Type | Change | Description |
|---|---|---|---|
| `previewUrl` | `string?` | **Existing** — now populated for document type | Preview image URL; `undefined` in production (no backend source) |

The `previewUrl` field already exists on `ContributionCardData` (used by whiteboard contributions). For document contributions, the mapper currently does not populate it. Once a backend preview field exists, the mapper's `collaboraDocument` branch will set `previewUrl: doc.profile.visual?.uri` — a one-line change.

## Unchanged Entities

- `PostCardData.framingDocumentPreviewUrl` — already wired by spec 116, no changes
- `CalloutCollaboraPreview` props — already has `previewImageUrl`, no changes
- `CollaboraDocumentPreviewType` — `'text' | 'spreadsheet' | 'presentation' | 'pdf'`, no changes
- GraphQL schema — no new types, fields, or queries

## State Transitions

### ContributionDocumentCard image rendering state

```
previewUrl undefined → Render type icon (current production state)
previewUrl provided → Attempt image load
  → Load success → Render image full-bleed
  → Load error → Set erroredUrl → Render type icon (fallback)
```

Uses the same `useState<string | undefined>` error-tracking pattern as `CalloutCollaboraPreview`.
