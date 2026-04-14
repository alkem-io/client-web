# Data Model: Collabora Document Callout Integration

**Branch**: `085-collabora-callout` | **Date**: 2026-04-14

## Client-Side Data Model

The client does not own any persistent data. All entities below are projections of server-side GraphQL types consumed via generated hooks. This document describes the shape of data as the client sees it.

## Entities

### CollaboraDocument (from server)

Represents a single collaborative document within a callout contribution.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `UUID!` | Unique identifier |
| `profile` | `Profile!` | Contains `displayName`, `url`, `visual` |
| `documentType` | `CollaboraDocumentType!` | SPREADSHEET, PRESENTATION, or TEXT_DOCUMENT |
| `createdDate` | `DateTime!` | When the document was created |
| `updatedDate` | `DateTime!` | Last modification timestamp |
| `authorization` | `Authorization` | Contains `myPrivileges` array |

**Relationships**:
- Belongs to a `CalloutContribution` (1:1, via `contribution.collaboraDocument`)
- Has a `Profile` (1:1, standard profile with displayName and visual)

### CollaboraDocumentType (enum, from server)

| Value | Description | Client Icon |
|-------|-------------|-------------|
| `SPREADSHEET` | Excel-like document (.xlsx) | `TableChartOutlined` |
| `PRESENTATION` | PowerPoint-like document (.pptx) | `SlideshowOutlined` |
| `TEXT_DOCUMENT` | Word-like document (.docx) | `ArticleOutlined` |

### CollaboraEditorUrl (from server)

Returned by the `collaboraEditorUrl` query. Short-lived, not cached.

| Field | Type | Description |
|-------|------|-------------|
| `editorUrl` | `String!` | Full Collabora editor URL with embedded WOPI token, ready for iframe `src` |
| `accessTokenTTL` | `Float!` | Token time-to-live in milliseconds |

### CalloutContribution (extended)

The existing `CalloutContribution` type gains a new nullable field:

| Field | Type | Description |
|-------|------|-------------|
| `collaboraDocument` | `CollaboraDocument` | Populated when `contribution.type === COLLABORA_DOCUMENT`, null otherwise |

### CalloutContributionType (enum, extended)

| Value | Existing? | Description |
|-------|-----------|-------------|
| `LINK` | Yes | URL reference |
| `POST` | Yes | Rich text post |
| `WHITEBOARD` | Yes | Excalidraw whiteboard |
| `MEMO` | Yes | Markdown memo |
| `COLLABORA_DOCUMENT` | **New** | Collaborative document (spreadsheet/presentation/text) |

## Client-Side Derived Types

### CollaboraDocumentContribution (TypeScript interface)

Used as the prop type for `CollaboraDocumentCard`:

```typescript
interface CollaboraDocumentContribution extends Identifiable {
  collaboraDocument?: {
    id: string;
    documentType: CollaboraDocumentType;
    profile: {
      displayName: string;
      url: string;
      visual?: Visual;
    };
    createdDate?: Date | string;
    createdBy?: ContributionAuthor;
  };
}
```

### EditorState (component-local)

Managed inside `CollaboraDocumentEditor` component:

```typescript
// Not a formal type — just local state shape
{
  editorUrl: string | undefined;  // From collaboraEditorUrl query
  accessTokenTTL: number;         // From query, used for refresh timer
  loading: boolean;               // Query loading state
  error: ApolloError | undefined; // Query error state
}
```

## State Transitions

### Document Lifecycle (client perspective)

```
[Not Created] → (createContributionOnCallout) → [Created/Listed]
[Created/Listed] → (collaboraEditorUrl query) → [Editing in iframe]
[Editing in iframe] → (TTL approaching) → [Auto-refresh] → [Editing in iframe]
[Editing in iframe] → (close dialog) → [Created/Listed]
[Created/Listed] → (updateCollaboraDocument) → [Renamed/Listed]
[Created/Listed] → (deleteContribution) → [Deleted/Not Listed]
```

### Editor URL Lifecycle

```
[No URL] → (query fires) → [Loading]
[Loading] → (success) → [Active URL] → iframe renders editor
[Loading] → (error) → [Error State] → show error message
[Active URL] → (TTL - 60s) → [Refreshing] → (refetch) → [Active URL]
[Active URL] → (dialog closes) → [Discarded]
```

## Data Fetching Strategy

| Operation | GraphQL Operation | Cache Behavior |
|-----------|-------------------|----------------|
| List documents in callout | `CalloutContributions` query with `includeCollaboraDocument: true` | `cache-and-network` (existing) |
| View single contribution | `CalloutContribution` query with `includeCollaboraDocument: true` | `cache-and-network` (existing) |
| Get editor URL | `collaboraEditorUrl` query | `network-only` (token is ephemeral) |
| Create document | `createContributionOnCallout` mutation | Refetch `CalloutContributions` |
| Delete document | `deleteContribution` mutation | Refetch `CalloutDetails`, `CalloutContributions` |
| Rename document | `updateCollaboraDocument` mutation | Refetch `CalloutContributions` |
