# Implementation Plan: Collabora Document Callout Integration

**Branch**: `085-collabora-callout` | **Date**: 2026-04-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/085-collabora-callout/spec.md`

## Summary

Add `COLLABORA_DOCUMENT` as a new callout contribution type in the React client, enabling users to create, browse, open (in a Collabora Online iframe), rename, and delete collaborative spreadsheets, presentations, and text documents within space callouts. The implementation follows the established whiteboard contribution pattern: type-specific Card, Preview, Dialog, and CreateButton components wired into `CalloutView`, backed by new GraphQL fragments and mutations matching the server contract from alkem-io/server#5970.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: MUI (existing callout components), Apollo Client, react-i18next, lucide-react (for icons if MUI lacks appropriate ones)
**Storage**: N/A (all persistence is server-side via GraphQL)
**Testing**: Vitest with jsdom
**Target Platform**: Web (SPA served by Vite)
**Project Type**: Web application (single repo, client-only changes)
**Performance Goals**: Editor dialog loads within 5s (SC-002), create-to-edit flow under 10s (SC-001)
**Constraints**: Must follow existing MUI callout patterns; no CRD components; iframe CSP must be configured at deployment level
**Scale/Scope**: ~15 new/modified files, follows existing contribution type pattern exactly

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | New components go in `src/domain/collaboration/calloutContributions/collaboraDocument/`. Domain hook will wrap GraphQL query for editor URL. |
| II. React 19 Concurrent UX Discipline | PASS | Rendering remains pure. Editor URL fetch uses standard Apollo query (suspense-compatible). Token auto-refresh uses `setTimeout` in effect, not blocking render. |
| III. GraphQL Contract Fidelity | PASS | All operations use generated hooks from codegen. New `.graphql` files will be committed with generated outputs. No raw `useQuery`. |
| IV. State & Side-Effect Isolation | PASS | Token refresh timer is an isolated effect in the editor dialog. No global state changes. Apollo cache handles data. |
| V. Experience Quality & Safeguards | PASS | Iframe gets `title` attribute for accessibility. Error states render user-friendly messages. Type-specific icons provide visual differentiation. |
| Architecture Std 2 (Styling) | PASS | Uses MUI (existing callout design system). CRD migration is out of scope per clarification. |
| Architecture Std 3 (i18n) | PASS | All new strings added to English translation file via `react-i18next`. |
| Architecture Std 5 (No barrel exports) | PASS | All imports use explicit file paths. |
| Architecture Std 6 (SOLID) | PASS | SRP: separate Card, Dialog, Preview, CreateButton. DIP: components consume hooks, not direct queries. |

No violations. Gate passes.

## Project Structure

### Documentation (this feature)

```text
specs/085-collabora-callout/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── graphql-schema-changes.md
└── tasks.md             # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
src/domain/collaboration/calloutContributions/collaboraDocument/
├── graphql/
│   ├── CreateCollaboraDocumentOnCallout.graphql
│   ├── CollaboraEditorUrl.graphql
│   ├── UpdateCollaboraDocument.graphql
│   └── DeleteCollaboraDocument.graphql
├── CollaboraDocumentCard.tsx
├── CreateContributionButtonCollaboraDocument.tsx
├── CalloutContributionDialogCollaboraDocument.tsx
├── CalloutContributionPreviewCollaboraDocument.tsx
├── CollaboraDocumentEditor.tsx          # Iframe wrapper + token refresh logic
└── collaboraDocumentIcons.ts            # Type-to-icon mapping for SPREADSHEET/PRESENTATION/TEXT_DOCUMENT

# Modified existing files:
src/domain/collaboration/callout/CalloutView/CalloutView.tsx
src/domain/collaboration/callout/icons/calloutIcons.ts
src/domain/collaboration/callout/CalloutForm/CalloutFormContributionSettings.tsx
src/domain/collaboration/calloutContributions/useCalloutContributions/useCalloutContributions.tsx
src/domain/collaboration/calloutContributions/useCalloutContributions/CalloutContributions.graphql
src/domain/collaboration/calloutContributions/calloutContributionPreview/CalloutContributionPreview.tsx
src/domain/collaboration/calloutContributions/calloutContributionPreview/CalloutContributionPreview.graphql
src/core/i18n/en/translation.en.json
```

**Structure Decision**: New files go under `src/domain/collaboration/calloutContributions/collaboraDocument/`, following the exact directory pattern of `whiteboard/`, `post/`, `memo/`, and `link/` siblings.
