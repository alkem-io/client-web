# Quickstart: Document Preview Alignment

**Feature**: 117-document-preview-alignment
**Date**: 2026-08-20

## Prerequisites

- Node >= 24.0.0, pnpm >= 10.17.1 (both pinned via Volta)
- Working `client-web` checkout on the `story/9872-file-thumbnail-preview` branch

## Setup

```bash
pnpm install
```

## Development

No dev server needed — this is a pure presentational + integration-layer change, fully testable via unit tests.

## Verify

```bash
# Run tests
pnpm vitest run

# Lint + typecheck
pnpm lint

# Production build
pnpm build
```

## Key Files

| File | Role |
|---|---|
| `src/crd/components/contribution/ContributionDocumentCard.tsx` | CRD card — add `previewUrl` prop + image branch |
| `src/crd/components/contribution/ContributionDocumentCard.test.tsx` | New test — image/fallback coverage |
| `src/main/crdPages/space/callout/ContributionsPreviewConnector.tsx` | Integration — add Document to overlay pattern + OverlayMoreCard branch |

## No Backend Required

This story makes zero GraphQL or API changes. All work is client-side presentational code and its unit tests.
