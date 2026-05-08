# GraphQL Schema Changes: Collabora Document Callout (Client Perspective)

**Branch**: `085-collabora-callout` | **Date**: 2026-04-14

These are the server-side GraphQL schema additions (from alkem-io/server#5970) that the client will consume. The client must run `pnpm codegen` after the server deploys these changes to generate types and hooks.

## New Enum Value (on existing enum)

```graphql
enum CalloutContributionType {
  LINK
  MEMO
  POST
  WHITEBOARD
  COLLABORA_DOCUMENT  # NEW
}
```

## New Enum

```graphql
enum CollaboraDocumentType {
  SPREADSHEET
  PRESENTATION
  TEXT_DOCUMENT
}
```

## New Types

```graphql
type CollaboraDocument {
  id: UUID!
  profile: Profile!
  documentType: CollaboraDocumentType!
  createdDate: DateTime!
  updatedDate: DateTime!
  authorization: Authorization
}

type CollaboraEditorUrl {
  editorUrl: String!
  accessTokenTTL: Float!
}
```

## Extended Type (existing)

```graphql
type CalloutContribution {
  # ... existing fields (id, sortOrder, link, whiteboard, post, memo, authorization) ...
  collaboraDocument: CollaboraDocument  # NEW (nullable)
}
```

## New Query

```graphql
extend type Query {
  collaboraEditorUrl(collaboraDocumentID: UUID!): CollaboraEditorUrl!
}
```

## New Mutations

```graphql
input UpdateCollaboraDocumentInput {
  ID: UUID!
  displayName: String
}

extend type Mutation {
  updateCollaboraDocument(updateData: UpdateCollaboraDocumentInput!): CollaboraDocument!
  deleteCollaboraDocument(deleteData: DeleteCollaboraDocumentInput!): CollaboraDocument!
}
```

## Extended Input (existing)

```graphql
input CreateCollaboraDocumentInput {
  displayName: String!
  documentType: CollaboraDocumentType!
}

input CreateContributionOnCalloutInput {
  calloutID: UUID!
  type: CalloutContributionType!
  post: CreatePostInput
  whiteboard: CreateWhiteboardInput
  link: CreateLinkInput
  memo: CreateMemoInput
  collaboraDocument: CreateCollaboraDocumentInput  # NEW
}
```

---

## Client GraphQL Operations to Create

### 1. CreateCollaboraDocumentOnCallout.graphql

```graphql
mutation CreateCollaboraDocumentOnCallout(
  $calloutId: UUID!
  $collaboraDocument: CreateCollaboraDocumentInput!
) {
  createContributionOnCallout(contributionData: {
    calloutID: $calloutId,
    type: COLLABORA_DOCUMENT,
    collaboraDocument: $collaboraDocument
  }) {
    collaboraDocument {
      id
      documentType
      profile {
        id
        url
        displayName
      }
    }
  }
}
```

### 2. CollaboraEditorUrl.graphql

```graphql
query CollaboraEditorUrl($collaboraDocumentId: UUID!) {
  collaboraEditorUrl(collaboraDocumentID: $collaboraDocumentId) {
    editorUrl
    accessTokenTTL
  }
}
```

### 3. UpdateCollaboraDocument.graphql

```graphql
mutation UpdateCollaboraDocument($updateData: UpdateCollaboraDocumentInput!) {
  updateCollaboraDocument(updateData: $updateData) {
    id
    profile {
      id
      displayName
    }
  }
}
```

### 4. DeleteCollaboraDocument.graphql

```graphql
mutation DeleteCollaboraDocument($deleteData: DeleteCollaboraDocumentInput!) {
  deleteCollaboraDocument(deleteData: $deleteData) {
    id
  }
}
```

### 5. Extend CalloutContributions.graphql

Add to query variables:
```graphql
$includeCollaboraDocument: Boolean! = false
```

Add to `contributions` field:
```graphql
collaboraDocument @include(if: $includeCollaboraDocument) {
  ...CalloutContributionsCollaboraDocumentCard
}
```

Add to `contributionsCount`:
```graphql
collaboraDocument @include(if: $includeCollaboraDocument)
```

New fragment:
```graphql
fragment CalloutContributionsCollaboraDocumentCard on CollaboraDocument {
  id
  documentType
  profile {
    id
    url
    displayName
  }
  authorization {
    id
    myPrivileges
  }
  createdDate
  createdBy {
    ...ContributionAuthor
  }
}
```

### 6. Extend CalloutContributionPreview.graphql

Add to query variables:
```graphql
$includeCollaboraDocument: Boolean! = false
```

Add to contribution fields:
```graphql
collaboraDocument @include(if: $includeCollaboraDocument) {
  id
  documentType
  profile {
    id
    url
    displayName
  }
  createdDate
  createdBy {
    ...ContributionAuthor
  }
}
```

### 7. Extend filter default in CalloutContributions.graphql

```graphql
$filter: [CalloutContributionType!] = [LINK, WHITEBOARD, MEMO, POST, COLLABORA_DOCUMENT]
```
