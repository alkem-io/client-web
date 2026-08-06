# Phase 1 Data Model: Documents as Post Responses

No server-side data model changes (no DDL, no schema change — Assumption
A-001). This document describes the **client-only** shapes introduced or
extended, all derived from the already-shipped GraphQL schema.

## Entities

### ResponseType (extended, client-only union)

`src/crd/forms/callout/types.ts`

```ts
export type ResponseType = 'none' | 'link' | 'post' | 'memo' | 'whiteboard' | 'document';
```

One new member, `'document'`, added to the existing five-member union.
Mirrored 1:1 by `ResponseTypeChipId` in `ResponseTypeChipStrip.tsx` (the chip
id vocabulary is currently a *subset* of `ResponseType` — it excludes
`'none'` since `'none'` means "no chip active" rather than a real chip).

### RESPONSE_TO_CONTRIBUTION_TYPE (extended map)

`src/main/crdPages/space/callout/calloutFormMapper.ts`

```ts
const RESPONSE_TO_CONTRIBUTION_TYPE: Record<ResponseType, CalloutContributionType | undefined> = {
  none: undefined,
  link: CalloutContributionType.Link,
  post: CalloutContributionType.Post,
  memo: CalloutContributionType.Memo,
  whiteboard: CalloutContributionType.Whiteboard,
  document: CalloutContributionType.CollaboraDocument, // NEW
};
```

### ContributionCardData (extended, client-only)

`src/main/crdPages/space/dataMappers/contributionDataMapper.ts`

```ts
type ContributionCardData = {
  id: string;
  type: 'post' | 'memo' | 'whiteboard' | 'link' | 'document'; // 'document' NEW
  title: string;
  author?: { name: string; avatarUrl?: string };
  createdDate?: string;
  href?: string;
  // ...existing fields unchanged...
  /** For document contributions: the underlying CollaboraDocument id (opens the editor). NEW */
  documentId?: string;
  /** For document contributions: drives the icon (Word/Sheet/Slide). NEW */
  documentType?: 'text' | 'spreadsheet' | 'presentation';
};
```

`documentId` mirrors the existing `memoId` / `postId` convention (the
contribution wrapper id — used for grid keys, deletion, edit routing — is
distinct from the underlying entity id, which callers need to open the
right editor). `documentType` is the client-only `CollaboraDocumentPreviewType`
already produced by `toCollaboraPreviewType`, reused rather than re-derived.

`AnyContributionItem` (the mapper's input union) gains a matching optional
`collaboraDocument` field:

```ts
collaboraDocument?: {
  id: string;
  documentType?: string;
  createdDate?: Date | string;
  createdBy?: ContributionAuthorBase | null;
  profile: { id?: string; url?: string; displayName: string };
} | null;
```

### `mapAnyContributionToCardData` (new branch)

Pure function, no side effects, matching the existing four `if (item.X)`
branches:

```ts
if (item.collaboraDocument) {
  const doc = item.collaboraDocument;
  return {
    id: item.id,
    type: 'document',
    title: doc.profile.displayName,
    href: doc.profile.url,
    documentId: doc.id,
    documentType: toCollaboraPreviewType(doc.documentType),
    author: extractAuthor(doc.createdBy),
    createdDate: toDateString(doc.createdDate, locale),
  };
}
```

### GraphQL: `ImportCollaboraDocument` mutation (new operation file)

`src/domain/collaboration/calloutContributions/collaboraDocument/graphql/ImportCollaboraDocument.graphql`

```graphql
mutation ImportCollaboraDocument($file: Upload!, $uploadData: ImportCollaboraDocumentInput!) {
  importCollaboraDocument(file: $file, uploadData: $uploadData) {
    id
    sortOrder
    collaboraDocument {
      ...CalloutContributionsCollaboraDocumentCard
    }
  }
}
```

Reuses the existing `CalloutContributionsCollaboraDocumentCard` fragment
(defined in `CalloutContributions.graphql`) so the newly-created contribution
slots into the Apollo cache with the exact same shape the list query already
produces — no separate normalization path. No new scalar or input type;
`ImportCollaboraDocumentInput` and `Upload` both already exist in the schema.

### State transitions

A document response has the same lifecycle as every other contribution type
— **create → (rename)\* → delete** — with no intermediate states. There is
no draft/publish distinction at the contribution level (that exists only at
the post/callout level, unaffected by this story) and no version history
exposed (matches the existing framing-document behavior, per the sibling
095 spec's Assumptions, unchanged here).

```text
   [uploaded file]
         │  importCollaboraDocument
         ▼
   ContributionCardData(type: 'document')  ──rename──►  (same, new title)
         │
         │  deleteContribution
         ▼
      (removed from grid; underlying CollaboraDocument + file removed
       server-side, per the existing generic contribution-delete contract)
```

### Validation rules (unchanged, reused)

- Exactly one file per upload attempt (`validateCollaboraImportFile`).
- Extension ∈ `{.docx, .xlsx, .pptx}` (`COLLABORA_IMPORT_EXTENSIONS_P1`).
- Size ≤ 15 MB (`COLLABORA_IMPORT_MAX_BYTES`).

All three rules are enforced by the existing, untouched
`validateCollaboraImportFile.ts` — no new validation logic is introduced by
this story (constitution DRY, Std 6f).
