# Quickstart: Collabora Document Callout Integration

**Branch**: `085-collabora-callout` | **Date**: 2026-04-14

## Prerequisites

1. **Server**: alkem-io/server#5970 must be merged and deployed locally (provides the new GraphQL schema)
2. **WOPI service**: Running and accessible (for editor URL generation)
3. **Collabora Online**: Running and accessible from the browser (for the iframe editor)
4. **Node >= 22.0.0**, **pnpm >= 10.17.1**

## Setup

```bash
# 1. Switch to feature branch
git checkout 085-collabora-callout

# 2. Install dependencies
pnpm install

# 3. Regenerate GraphQL types (requires backend running at localhost:4000/graphql)
pnpm codegen

# 4. Start dev server
pnpm start
```

## Development Workflow

### Step 1: GraphQL Operations (do first)

Create the `.graphql` files in `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/`:
- `CreateCollaboraDocumentOnCallout.graphql`
- `CollaboraEditorUrl.graphql`
- `UpdateCollaboraDocument.graphql`
- `DeleteCollaboraDocument.graphql`

Extend existing files:
- `src/domain/collaboration/calloutContributions/useCalloutContributions/CalloutContributions.graphql`
- `src/domain/collaboration/calloutContributions/calloutContributionPreview/CalloutContributionPreview.graphql`

Run `pnpm codegen` after each change to regenerate hooks.

### Step 2: Components (follow whiteboard pattern)

Create in `src/domain/collaboration/calloutContributions/collaboraDocument/`:

1. `CollaboraDocumentCard.tsx` — mirrors `WhiteboardCard.tsx`
2. `CreateContributionButtonCollaboraDocument.tsx` — mirrors `CreateContributionButtonWhiteboard.tsx`
3. `CollaboraDocumentEditor.tsx` — iframe wrapper with token refresh
4. `CalloutContributionDialogCollaboraDocument.tsx` — mirrors `CalloutContributionDialogWhiteboard.tsx`
5. `CalloutContributionPreviewCollaboraDocument.tsx` — mirrors `CalloutContributionPreviewWhiteboard.tsx`

### Step 3: Wire into CalloutView

Update these existing files:
- `CalloutView.tsx` — add COLLABORA_DOCUMENT block
- `calloutIcons.ts` — add icon mapping
- `CalloutFormContributionSettings.tsx` — add radio button + settings
- `useCalloutContributions.tsx` — add include variable + count case
- `CalloutContributionPreview.tsx` — add type detection

### Step 4: i18n

Add English strings to `src/core/i18n/en/translation.en.json`.

## Testing

```bash
# Type check + lint
pnpm lint

# Run tests
pnpm vitest run

# Manual testing (requires full backend stack):
# 1. Enable dev server: pnpm start
# 2. Navigate to a space
# 3. Create a callout with type "Collabora Document"
# 4. Create a document (spreadsheet/presentation/text)
# 5. Open the document — verify Collabora editor loads in iframe
# 6. Rename and delete the document
```

## Key Files Reference

| Purpose | File |
|---------|------|
| Whiteboard pattern (follow this) | `src/domain/collaboration/calloutContributions/whiteboard/` |
| CalloutView orchestrator | `src/domain/collaboration/callout/CalloutView/CalloutView.tsx` |
| Contribution query | `src/domain/collaboration/calloutContributions/useCalloutContributions/CalloutContributions.graphql` |
| Contribution hook | `src/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions.tsx` |
| Icon mapping | `src/domain/collaboration/callout/icons/calloutIcons.ts` |
| Callout creation form | `src/domain/collaboration/callout/CalloutForm/CalloutFormContributionSettings.tsx` |
| Contribution preview | `src/domain/collaboration/calloutContributions/calloutContributionPreview/CalloutContributionPreview.tsx` |
| English translations | `src/core/i18n/en/translation.en.json` |
| Server GraphQL contract | alkem-io/server#5970 `specs/086-collabora-integration/contracts/graphql-schema-changes.md` |
