# Implementation Plan: Collabora Document Callout Integration

**Branch**: `085-collabora-callout` | **Date**: 2026-04-14 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/085-collabora-callout/spec.md`

## Summary

Add `COLLABORA_DOCUMENT` as a new callout contribution type in the React client, enabling users to create, browse, open (in a Collabora Online iframe), rename, and delete collaborative spreadsheets, presentations, and text documents within space callouts. The implementation follows the established whiteboard contribution pattern: type-specific Card, Preview, Dialog, and CreateButton components wired into `CalloutView`, backed by new GraphQL fragments and mutations matching the server contract from alkem-io/server#5970.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node >= 22.0.0
**Primary Dependencies**: MUI (callout internals: card / create button / contribution dialog), CRD / shadcn + Tailwind (editor-footer presentation only), Apollo Client, react-i18next, lucide-react
**Storage**: N/A (all persistence is server-side via GraphQL; save status is observed via Collabora's postMessage API)
**Testing**: Vitest with jsdom
**Target Platform**: Web (SPA served by Vite)
**Project Type**: Web application (single repo, client-only changes)
**Performance Goals**: Editor dialog loads within 5s (SC-002), create-to-edit flow under 10s (SC-001), save indicator settles within autosave latency (SC-007)
**Constraints**: Callout-contribution internals follow MUI patterns for consistency with existing whiteboard/memo/post code; the editor footer is a single CRD component reused across both MUI and CRD paths via `.crd-root` scoping (see migration-guide.md "Don't Over-Migrate"); iframe CSP must be configured at deployment level
**Scale/Scope**: ~20 new/modified files across `src/domain/collaboration/calloutContributions/collaboraDocument/`, `src/main/crdPages/space/callout/`, `src/crd/components/collabora/`, and `src/crd/i18n/space/`

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | New components go in `src/domain/collaboration/calloutContributions/collaboraDocument/`. Domain hook will wrap GraphQL query for editor URL. |
| II. React 19 Concurrent UX Discipline | PASS | Rendering remains pure. Editor URL fetch uses standard Apollo query (suspense-compatible). Token auto-refresh uses `setTimeout` in effect, not blocking render. |
| III. GraphQL Contract Fidelity | PASS | All operations use generated hooks from codegen. New `.graphql` files will be committed with generated outputs. No raw `useQuery`. |
| IV. State & Side-Effect Isolation | PASS | Token refresh timer is an isolated effect in the editor dialog. No global state changes. Apollo cache handles data. |
| V. Experience Quality & Safeguards | PASS | Iframe gets `title` attribute for accessibility. Error states render user-friendly messages. Type-specific icons provide visual differentiation. |
| Architecture Std 2 (Styling) | PASS | Callout-contribution internals use MUI per original decision. The editor footer (added in the 2026-04-24 parity round) is a single CRD component reused across MUI and CRD paths; the MUI path wraps it in a `.crd-root` scope so Tailwind preflight applies. CRD hard rules (`src/crd/CLAUDE.md`) are respected in `CollaboraCollabFooter.tsx`: zero `@mui/*` imports, plain-TS props, callback-only event handlers, `useTranslation('crd-space')`. |
| Architecture Std 3 (i18n) | PASS | Callout-contribution strings in `src/core/i18n/en/translation.en.json` (Crowdin). Footer strings in `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json` (manual per CRD CLAUDE.md §i18n). |
| Architecture Std 5 (No barrel exports) | PASS | All imports use explicit file paths. |
| Architecture Std 6 (SOLID) | PASS | SRP: separate Card, Dialog, Preview, CreateButton, Footer, postMessage hook, footer mapper. DIP: components consume hooks, not direct queries. The `useCollaboraPostMessage` hook and `collaboraFooterMapper` are pure functions tested in isolation; the CRD footer component is pure presentational with zero data-layer knowledge. |

**Business-logic vs UI separation.** The gap-closure round preserves the three-layer split from the migration guide:
- **CRD layer** (`src/crd/components/collabora/CollaboraCollabFooter.tsx`): presentational only. No Apollo, no domain types, no routing, no auth. All data flows in via props; all events flow out via callbacks.
- **Integration layer** (`src/main/crdPages/space/callout/CollaboraFramingEditorOverlay.tsx`): calls auth + notification hooks, wires the domain hook/mapper to CRD props, renders the CRD footer.
- **Domain layer** (`src/domain/collaboration/calloutContributions/collaboraDocument/` — editor, postMessage hook, footer mapper, GraphQL operations): knows about Apollo enums (`CommunityMembershipStatus`, `ContentUpdatePolicy`) and the Collabora iframe contract. Never imports MUI from the hook or mapper; the MUI framing dialog is the sole file that mixes MUI + CRD, and only via a `.crd-root` boundary.

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
# Original MUI implementation (Phases 1–9)
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
├── CollaboraDocumentEditor.tsx          # Iframe wrapper (accepts optional iframeRef for footer)
└── collaboraDocumentIcons.ts            # Type-to-icon mapping for SPREADSHEET/PRESENTATION/TEXT_DOCUMENT

# P1 parity round (Phase 10, ticket #9575)
src/domain/collaboration/calloutContributions/collaboraDocument/
├── useCollaboraPostMessage.ts           # DOM-only hook parsing Collabora's postMessage API
├── collaboraFooterMapper.ts             # Pure mapper: privilege + state → CollaboraCollabFooter props
└── collaboraFooterMapper.spec.ts        # 7 unit tests covering the readonly-reason decision tree

src/crd/components/collabora/
└── CollaboraCollabFooter.tsx            # Pure presentational footer (save / presence / readonly reason / delete)

src/crd/i18n/space/
├── space.en.json                        # +`collabora.footer.*` + `collabora.editor.error.*`
└── space.{nl,es,bg,de,fr}.json          # Same keys, manually translated per CRD CLAUDE.md

src/main/crdPages/space/callout/
├── CollaboraFramingEditorOverlay.tsx    # CRD framing editor overlay (primary when CRD toggle ON)
├── CollaboraFramingConnector.tsx        # Level-1 preview wrapper
├── collaboraDocumentTypeMap.ts          # Shared enum → preview-type util (used by 3 sites)
├── CalloutDetailDialogConnector.tsx     # Passes documentType to overlay
└── LazyCalloutItem.tsx                  # Passes documentType to overlay

# Modified existing files (parity round):
src/domain/collaboration/callout/CalloutDialogs/EditCalloutDialog.tsx  # Side-update of doc name on title change
src/domain/collaboration/callout/CalloutFramings/CalloutFramingCollaboraDocument.tsx  # MUI dialog + CRD footer
```

**Structure Decision**: MUI contribution files stay under `src/domain/collaboration/calloutContributions/collaboraDocument/` following the whiteboard/memo/post pattern. The CRD footer lives under `src/crd/components/collabora/` per the design-system folder structure (`src/crd/CLAUDE.md` §Folder Structure). The postMessage hook and footer mapper live in the domain folder alongside the editor they serve — they're pure utilities that happen to be UI-only, but they import GraphQL enums (`CommunityMembershipStatus`, `ContentUpdatePolicy`) so they cannot live inside `src/crd/`.
