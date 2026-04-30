# Research: Collabora Document Callout Integration

**Branch**: `085-collabora-callout` | **Date**: 2026-04-14

## Research Findings

### 1. Contribution Type Integration Pattern

**Decision**: Follow the exact pattern established by Whiteboard, Post, Memo, and Link contribution types. Each type has: a Card component, a CreateButton component, a Preview component, a Dialog component, GraphQL fragments with `@include` conditional fetching, and an icon mapping.

**Rationale**: The callout contribution system has a well-established, consistent pattern across 4 existing types. Deviation would introduce inconsistency and increase maintenance burden. The pattern is proven at scale and handles pagination, intersection-based lazy loading, horizontal paging, and preview/dialog flows.

**Alternatives considered**:
- Custom top-level component outside the callout system — Rejected. Would bypass existing authorization, contribution counting, sort ordering, and UI consistency.
- Shared generic contribution component with configuration — Rejected. Too much variation exists between types (whiteboard has Excalidraw, posts have comments, memos have markdown). Each type benefits from dedicated components.

### 2. Editor Embedding Strategy

**Decision**: Use an iframe to embed the Collabora Online editor. The iframe `src` is the `editorUrl` returned by the `collaboraEditorUrl` GraphQL query. This is fundamentally different from the whiteboard approach (which embeds Excalidraw directly as a React component).

**Rationale**: Collabora Online is an external application that runs as a separate service. It provides its own complete editing UI. The iframe approach is the standard WOPI integration pattern — it's how Collabora is designed to be embedded. No React component wrapper exists for Collabora's editing functionality.

**Alternatives considered**:
- Direct Collabora React integration — Not possible. Collabora Online is a native application served as a web UI, not a React component library.
- WebComponent wrapper — Unnecessary complexity. The iframe is the standard integration point and Collabora's API works through PostMessage for any needed cross-frame communication.

### 3. Token Auto-Refresh Mechanism

**Decision**: Use `setTimeout` in a `useEffect` to schedule iframe reload before TTL expiry. The timer fires at `TTL - buffer` (e.g., 1 minute before expiry), re-fetches the editor URL via `refetch()` on the Apollo query, and updates the iframe `src`. Collabora autosaves continuously, so brief interruption during reload is acceptable.

**Rationale**: Silent refresh is the simplest UX. Collabora's own autosave ensures no data loss. The alternative (warning banner) adds UI complexity for a scenario users shouldn't need to think about.

**Implementation detail**: The `CollaboraDocumentEditor` component owns this logic:
1. On mount: fetch `collaboraEditorUrl` query → get `editorUrl` + `accessTokenTTL`
2. Set timer: `setTimeout(refreshFn, accessTokenTTL - 60000)` (refresh 1 min before expiry)
3. On timer fire: `refetch()` the query → update iframe `src` with new URL
4. On unmount: `clearTimeout` to prevent memory leaks

### 4. GraphQL Integration Points

**Decision**: Extend existing `CalloutContributions.graphql` and `CalloutContributionPreview.graphql` with `$includeCollaboraDocument` conditional variable and a `collaboraDocument` fragment. Create new `.graphql` files for create, update, delete, and editor URL operations.

**Rationale**: The existing query uses `@include(if: $includeX)` directives for each type. Adding `$includeCollaboraDocument` follows the exact same pattern and ensures no extra data is fetched for non-Collabora callouts.

**Files to modify**:
- `CalloutContributions.graphql`: Add `$includeCollaboraDocument: Boolean! = false`, add `collaboraDocument @include(if: $includeCollaboraDocument)` field with fragment
- `CalloutContributionPreview.graphql`: Same pattern
- `useCalloutContributions.tsx`: Add `includeCollaboraDocument` variable, add case to `totalContributionsCount` switch

**New GraphQL files**:
- `CreateCollaboraDocumentOnCallout.graphql`: Mutation using `createContributionOnCallout` with `type: COLLABORA_DOCUMENT`
- `CollaboraEditorUrl.graphql`: Query for `collaboraEditorUrl(collaboraDocumentID: $id)`
- `UpdateCollaboraDocument.graphql`: Mutation for rename
- `DeleteCollaboraDocument.graphql`: Mutation for delete

### 5. Icon Strategy for Document Types

**Decision**: Use MUI icons for the contribution type icon in the callout system (`DescriptionOutlined` for the generic COLLABORA_DOCUMENT type). Use type-specific MUI icons within cards: `TableChartOutlined` (spreadsheet), `SlideshowOutlined` (presentation), `ArticleOutlined` (text document).

**Rationale**: MUI icons are already used for all other contribution types. No need to introduce lucide-react icons in the MUI callout layer. The three document-type icons are available in `@mui/icons-material`.

**Alternatives considered**:
- lucide-react icons — Rejected for the callout integration layer (MUI-based). Would only be appropriate in CRD components.
- Single generic icon for all types — Rejected. Users need visual differentiation between spreadsheets, presentations, and text documents.

### 6. Delete Pattern

**Decision**: Use the existing generic `deleteContribution` mutation (already in `DeleteContribution.graphql`) for deleting Collabora document contributions. This is the same mutation used by whiteboard contributions. Additionally, expose the `deleteCollaboraDocument` mutation from the server for cases where only the document (not the contribution wrapper) needs to be deleted — but in the UI flow, we always delete the contribution.

**Rationale**: The contribution-level delete handles cascade deletion (contribution + underlying document). This matches the whiteboard pattern exactly where `deleteContribution` is called, not `deleteWhiteboard`.

### 7. Callout Creation Settings

**Decision**: Add a new radio button option for `COLLABORA_DOCUMENT` in `CalloutFormContributionSettings.tsx`. The settings component for Collabora documents will be minimal (no special defaults needed beyond the contribution name pattern). Comments will be disabled for Collabora document callouts (same as Whiteboard and Memo).

**Rationale**: Collabora documents are self-contained collaborative artifacts. Comments on individual documents add unnecessary complexity for v1. This matches the whiteboard precedent.

### 8. i18n Key Structure

**Decision**: Add keys to `src/core/i18n/en/translation.en.json` under the existing namespaces:
- `common.enums.calloutContributionType.COLLABORA_DOCUMENT` — type label
- `callout.create.contributionSettings.contributionTypes.collaboraDocument.*` — creation form labels
- `collaboraDocument.*` — feature-specific strings (create dialog, editor errors, type names)

**Rationale**: Follows the existing i18n pattern for callout contribution types. All strings in the default `translation` namespace since this is MUI-layer code, not CRD.
