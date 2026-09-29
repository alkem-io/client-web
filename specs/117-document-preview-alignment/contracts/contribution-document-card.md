# Contract: ContributionDocumentCard

**Feature**: 117-document-preview-alignment
**Date**: 2026-08-20

## Component Contract

```typescript
type ContributionDocumentCardProps = {
  title: string;
  documentType: CollaboraDocumentPreviewType;
  author?: string;
  previewUrl?: string;   // NEW — optional preview image URL
  onClick?: () => void;
  className?: string;
};
```

## Rendering Contract

- When `previewUrl` is provided and loads: render `<img>` full-bleed with `object-cover` and hover scale-up animation
- When `previewUrl` is absent: render centered type icon with accent color
- When `previewUrl` fails to load: fall back to the type-icon treatment (no broken-image glyph)
- In all states: hover "Open Document" overlay and title/author gradient footer remain visible and functional

## Consumer Contract

`ContributionsPreviewConnector` passes `previewUrl` from `ContributionCardData.previewUrl` to the card. Today this is always `undefined` for document contributions. When a backend preview field ships, `contributionDataMapper.ts`'s `collaboraDocument` branch populates `previewUrl` — the card and connector require no changes.
