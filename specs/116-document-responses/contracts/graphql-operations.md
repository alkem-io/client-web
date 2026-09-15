# Contract: GraphQL Operations

This feature consumes one already-stable server contract and adds exactly
one new client-side operation document against it. No server change, no
schema change.

## Consumed (pre-existing, unmodified) server contract

```graphql
extend type Mutation {
  """
  Import an existing file as a CollaboraDocument contribution on the callout.
  file-service-go sniffs the MIME from content and rejects formats Collabora
  cannot edit.
  """
  importCollaboraDocument(file: Upload!, uploadData: ImportCollaboraDocumentInput!): CalloutContribution!
}

input ImportCollaboraDocumentInput {
  "The ID of the Callout to attach the imported document to as a new contribution."
  calloutID: UUID!
  "Optional title override. If absent, derived from the uploaded filename (extension stripped)."
  displayName: String
  "Optional sortOrder for the new contribution. Defaults to one less than the current minimum (new contribution appears first)."
  sortOrder: Float
}

type CalloutContribution {
  id: UUID!
  sortOrder: Float!
  collaboraDocument: CollaboraDocument
  # ...link / memo / post / whiteboard / authorization / createdBy / createdDate — pre-existing, unchanged
}

type CollaboraDocument {
  id: UUID!
  documentType: CollaboraDocumentType!
  profile: Profile!
  authorization: Authorization
  createdBy: User
  createdDate: DateTime!
}
```

Verified byte-for-byte against `src/core/apollo/generated/graphql-schema.ts`
(the client's already-generated copy of the live schema) as of this story's
research phase. No field, argument, or type listed above is added or
modified by this story.

## New client operation document

`src/domain/collaboration/calloutContributions/collaboraDocument/graphql/ImportCollaboraDocument.graphql`:

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

`$uploadData` is always `{ calloutID }` only from the client — `displayName`
and `sortOrder` are intentionally omitted per FR-007 (server-derived name)
and R1 (server-default ordering). The `CalloutContributionsCollaboraDocumentCard`
fragment is the pre-existing one defined in `CalloutContributions.graphql`
(id, documentType, profile, authorization, createdDate, createdBy) — reused
verbatim so the mutation response normalizes into the same cache shape the
list query already produces, requiring no bespoke `update()` cache-write
logic (Apollo's default normalized-cache merge handles it via the shared
`id`/`__typename`).

## Codegen

Running `pnpm run codegen` against this operation document (plus the schema,
unmodified) generates:

- `useImportCollaboraDocumentMutation` in `src/core/apollo/generated/apollo-hooks.ts`
- `ImportCollaboraDocumentMutation` / `ImportCollaboraDocumentMutationVariables` types in `src/core/apollo/generated/graphql-schema.ts`

Both are committed alongside the new `.graphql` file per constitution
Engineering Workflow #2 ("Every PR MUST run `pnpm run codegen`, commit
generated artifacts...").

## Read-side contracts (pre-existing, unmodified, reused as-is)

- `CalloutContributions` query (`useCalloutContributions/CalloutContributions.graphql`) — `includeCollaboraDocument` variable, `collaboraDocument` selection on each contribution. Already live.
- `CalloutContribution` single-item query (`calloutContributionPreview/CalloutContributionPreview.graphql`) — `includeCollaboraDocument` variable, `collaboraDocument` selection. Already live; used to fetch a single document response by contribution id when a card is clicked (mirrors the existing `useCalloutContributionQuery` usage for Post/Whiteboard in `CalloutDetailDialogConnector.tsx`).

## Delete contract (pre-existing, unmodified, reused as-is)

```graphql
mutation DeleteContribution($contributionId: UUID!) {
  deleteContribution(deleteData: { ID: $contributionId }) {
    id
  }
}
```

Entity-agnostic — already used for Whiteboard/Post/Link contribution
deletion; this story adds no new variant.
