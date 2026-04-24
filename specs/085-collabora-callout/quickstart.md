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

### Parity-round manual checks (ticket #9575, Phase 10)

Test both paths — the CRD toggle is off by default in deployed envs, so the MUI framing dialog is the production-default path.

**Toggle CRD on**: in the browser console, run `localStorage.setItem('alkemio-crd-enabled', 'true'); location.reload();`

**Save state feedback (FR-013, SC-007)**:
1. Open a Collabora-framed callout's editor.
2. Type a character. Footer should briefly show `Unsaved changes` then `Saved` once Collabora autosaves (typically 1–3s).
3. Repeat several times — the indicator must never stick on `Unsaved changes`.

**Multi-user presence (AC 2 for US7)**:
1. Open the same document in a second browser profile or incognito window.
2. Footer on both clients should show the other user's avatar (sourced from Collabora's `Views_List` postMessage).

**Readonly reason (AC 3 for US7)**:
1. Log out (or open in an incognito window without signing in).
2. Open a public document; the footer should show `Sign in to edit this document`.

**Title sync (FR-015, SC-008)**:
1. Open a Collabora-framed callout and note its title.
2. Edit the callout via the settings/edit flow; change the title; save.
3. Reopen the editor — the Collabora header (inside the iframe) should display the new title.

**Type icon + fullscreen dialog (FR-016)**:
1. Open the Collabora editor in both CRD and MUI paths.
2. Header must show the document-type icon (`FileText` / `Sheet` / `Presentation`) before the title.
3. Dialog must cover the full viewport (no gap above/below). Specifically check the MUI path — the app-theme's `.MuiDialog-paper maxHeight` cap is overridden only for this dialog.

**Runtime error toasts (FR-013)**:
1. With the editor open, block the Collabora host in DevTools or kill its container.
2. On the next Collabora-emitted `Error` / `Session_Closed` postMessage, a toast should appear (`Collabora error: {message}` / `The collaboration session was closed`).

**CRD rules audit (quick sanity)**:
- `rg '@mui/' src/crd/components/collabora src/main/crdPages/space/callout` → must return nothing.
- `rg '@apollo/client\|/generated/' src/crd/components/collabora` → must return nothing.
- The only file that intentionally mixes MUI + CRD is `src/domain/collaboration/callout/CalloutFramings/CalloutFramingCollaboraDocument.tsx`, and only via a `.crd-root` scope around the footer.

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
| English translations (callout contribution) | `src/core/i18n/en/translation.en.json` |
| Server GraphQL contract | alkem-io/server#5970 `specs/086-collabora-integration/contracts/graphql-schema-changes.md` |
| **Phase 10 — Parity round** | |
| CRD footer (pure presentational) | `src/crd/components/collabora/CollaboraCollabFooter.tsx` |
| Collabora postMessage hook | `src/domain/collaboration/calloutContributions/collaboraDocument/useCollaboraPostMessage.ts` |
| Footer mapper (pure function) | `src/domain/collaboration/calloutContributions/collaboraDocument/collaboraFooterMapper.ts` |
| Mapper unit tests | `src/domain/collaboration/calloutContributions/collaboraDocument/collaboraFooterMapper.spec.ts` |
| Shared enum → preview-type helper | `src/main/crdPages/space/callout/collaboraDocumentTypeMap.ts` |
| CRD framing editor overlay | `src/main/crdPages/space/callout/CollaboraFramingEditorOverlay.tsx` |
| MUI framing dialog (hosts CRD footer via `.crd-root`) | `src/domain/collaboration/callout/CalloutFramings/CalloutFramingCollaboraDocument.tsx` |
| Title-sync side-mutation | `src/domain/collaboration/callout/CalloutDialogs/EditCalloutDialog.tsx` |
| Footer i18n (CRD, manual translations for 6 locales) | `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json` |
| Migration-guide reference | `docs/crd/migration-guide.md` |
| Collabora postMessage API | https://sdk.collaboraonline.com/docs/postmessage_api.html |
