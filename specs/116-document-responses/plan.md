# Implementation Plan: Documents as Post Responses

**Branch**: `story/10083-documents-as-contributions` | **Date**: 2026-08-06 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/116-document-responses/spec.md`

## Summary

Complete the write and render sides of `CalloutContributionType.COLLABORA_DOCUMENT`
as a fifth, first-class response type (alongside Links & Files, Posts, Memos,
Whiteboards), closing the story's sole acceptance criterion ("Add documents
as a response type"). The server contract (`importCollaboraDocument`
mutation, `CalloutContribution.collaboraDocument`, `allowedTypes` gating) is
already shipped and stable; a prior "Documents MVP" (#9615) already wired the
*read* side of contribution fetching. This story: (1) unlocks the
`'document'` response-type chip in the create/edit-post form, (2) adds an
upload-only "Add document" flow (the server exposes no blank-create
mutation for contributions — see spec Clarifications), reusing the existing
`DocumentImportZone` / `validateCollaboraImportFile` / `collaboraImportFormats`
building blocks the framing document-upload flow already proved out, (3)
renders document responses as a type-icon card in every contributions grid,
and (4) opens/renames/deletes them through the same Collabora editor and
generic delete mechanisms already used for framing documents and other
contribution types. Zero server-side changes.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`), Node ≥24 (Volta-pinned)
**Primary Dependencies**: `@apollo/client` (generated hooks only), `apollo-upload-client` (already wired at the transport level — `importCollaboraDocument` uploads through it, same as the framing upload path), `react-i18next`, shadcn/ui + Tailwind v4 + Radix UI (`@/crd/*`), `lucide-react` (existing `FileText`/`Sheet`/`Presentation` icons — no new icon import)
**Storage**: N/A client-side — uploaded bytes go server-side via `importCollaboraDocument` (file-service-go), unchanged transport already used by the framing upload path
**Testing**: Vitest with jsdom — unit tests for the new pure mapping branch (`contributionDataMapper`) and the extended response-type mapping (`calloutFormMapper`, `ResponseTypeChipStrip`)
**Target Platform**: Web SPA served by Vite; same browser support matrix as the rest of the client (≥90% global per caniuse.com)
**Project Type**: Web client only (`client-web`). Zero server (`server` repo) changes — verified against the already-shipped, already-generated GraphQL schema; SC-005.
**Performance Goals**: SC-002 (add-document flow under 10 s end-to-end for a small file on a typical connection) — matches the equivalent framing-upload benchmark (095 spec SC-002), since both share the same upload transport.
**Constraints**: Upload-only creation path (no blank-create for responses — hard server constraint, not a preference). Client-side pre-checks (single file, extension, size) MUST run before any network request, reusing the existing `validateCollaboraImportFile`. No new GraphQL schema, no new runtime dependency, **zero new i18n keys** (R8 — full reuse of pre-scaffolded strings across all six locales).
**Scale/Scope**: Approximately 12–14 files: 1 new GraphQL operation file, 1 new domain helper (shared error-message mapper), 4 new components/connectors, 1 new CRD card, ~7 modified files (response-type plumbing, grid/dispatch switches, `CalloutDetailDialogConnector`), and 2–3 new/extended unit test files. No locale files touched.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | New pure logic (the `collaboraDocument` mapping branch) lives in the existing domain-adjacent mapper (`src/main/crdPages/space/dataMappers/contributionDataMapper.ts`), consistent with its four sibling branches. The new GraphQL operation lives in the existing domain module `src/domain/collaboration/calloutContributions/collaboraDocument/graphql/`. UI connectors (`DocumentContributionAddConnector`, `DocumentContributionConnector`) live in `src/main/crdPages/space/callout/`, matching every sibling per-type connector (Whiteboard/Memo/Post/Link) already there — no new taxonomy introduced. |
| II. React 19 Concurrent UX Discipline | PASS | Follows the existing `useLoadingState` + local `useState` busy-flag pattern already used by every sibling add-connector (Whiteboard/Memo). No blocking synchronous work; the upload is a single Apollo mutation. No deprecated lifecycle patterns introduced. |
| III. GraphQL Contract Fidelity | PASS | Exactly one new `.graphql` operation file (`ImportCollaboraDocument.graphql`), added against an already-stable, unmodified mutation. `pnpm run codegen` regenerates the hook; generated output committed in the same PR. All reads reuse pre-existing, unmodified queries (R2). No raw `useQuery`, no hand-written fetch. |
| IV. State & Side-Effect Isolation | PASS | All new mutable state (staged file, busy flag, "just-created, open its editor" id) is local component `useState`, matching the sibling add-connectors exactly. Apollo cache normalization is the default (shared fragment + `id`/`__typename`); no bespoke `update()` callback is introduced. The centralized delete-confirmation state in `CalloutDetailDialogConnector` is extended (`kind` union), not duplicated. |
| V. Experience Quality & Safeguards | PASS | The upload zone (`DocumentImportZone`) is already WCAG 2.1 AA compliant (keyboard-operable, `aria-busy`, `role="alert"` errors) — reused unchanged. The new card follows `ContributionWhiteboardCard`'s existing accessible pattern (button semantics, `aria-hidden` decorative icon, focus-visible ring). Delete goes through the existing `ConfirmationDialog` (Golden Rule #9). Tests planned for the new pure mapping/response-type-plumbing branches. |
| Architecture Std 2 (CRD-only) | PASS | The new `ContributionDocumentCard` lives in `src/crd/components/contribution/`, imports only from `@/crd/lib/`, `lucide-react` — no `@mui/*`/`@emotion/*` (already fully removed repo-wide). No business logic in the CRD component; data mapping happens in `contributionDataMapper.ts`. |
| Architecture Std 3 (i18n) | PASS | Zero locale-file changes — every string is already present and generic across all six locales (`callout.addDocument`, `contributionSettings.types.document`, the `documentImportError*` family, the entity-agnostic `deleteContribution.*`), confirmed by direct inventory (R8). Nothing to keep in parity because nothing is added. |
| Architecture Std 5 (No barrel exports) | PASS | All new imports use explicit file paths, matching every file read during research. |
| Architecture Std 6 (SOLID/DRY) | PASS | **SRP**: `ContributionDocumentCard` renders only; `DocumentContributionAddConnector` only stages+uploads; `DocumentContributionConnector` only fetches-by-id; `CollaboraContributionEditorOverlay` only renders the editor chrome. **OCP**: `ResponsePanel`'s switch and the grid/dispatch switches gain a case without modifying existing cases. **LSP**: n/a (no inheritance/overrides introduced). **ISP**: the new contribution-scoped editor overlay gets its own narrow prop surface (adds `onDelete`/`canDelete`, drops framing-only concerns) rather than widening the existing framing overlay's props for an irrelevant capability (R4). **DIP**: connectors depend on generated Apollo hooks (the abstraction), never on raw fetch. **DRY**: `DocumentImportZone`, `validateCollaboraImportFile`, `collaboraImportFormats.ts`, `toCollaboraPreviewType`, `canRenameCollaboraDocument`, `useRenameCollaboraDocument`, `useDeleteContributionMutation`, and the centralized delete-confirmation dialog are all reused verbatim, not re-implemented (research R3–R7). |

No violations. Gate passes.

## Project Structure

### Documentation (this feature)

```text
specs/116-document-responses/
├── plan.md                  # This file
├── research.md              # Phase 0 output
├── data-model.md            # Phase 1 output
├── quickstart.md            # Phase 1 output
├── contracts/
│   └── graphql-operations.md
├── checklists/
│   └── requirements.md      # From /speckit.specify quality gate
└── tasks.md                 # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# New GraphQL operation — the one write-side contract this story adds
src/domain/collaboration/calloutContributions/collaboraDocument/graphql/
└── ImportCollaboraDocument.graphql               # NEW — mutation, reuses the existing CalloutContributionsCollaboraDocumentCard fragment

# Response-type plumbing (create/edit post form)
src/crd/forms/callout/
├── types.ts                                      # MODIFIED — ResponseType gains 'document'
├── ResponseTypeChipStrip.tsx                      # MODIFIED — new chip (FileText icon), ResponseTypeChipId gains 'document'
└── ResponsePanel.tsx                              # MODIFIED — 'document' case → existing SimpleContributionPanel

src/main/crdPages/space/callout/
├── calloutFormMapper.ts                           # MODIFIED — RESPONSE_TO_CONTRIBUTION_TYPE gains document → CollaboraDocument
└── calloutFormMapper.test.ts                      # MODIFIED — coverage for the new mapping branch

# Contribution data mapping (read side glue — the write side already exists)
src/main/crdPages/space/dataMappers/
├── contributionDataMapper.ts                      # MODIFIED — ContributionCardData + AnyContributionItem gain document fields; new mapping branch
└── contributionDataMapper.test.ts                 # NEW — covers the new branch

# New add / open / render connectors (mirror the existing per-type family)
src/main/crdPages/space/callout/
├── DocumentContributionAddConnector.tsx            # NEW — upload-only add flow (DocumentImportZone + validateCollaboraImportFile + useImportCollaboraDocumentMutation)
├── DocumentContributionConnector.tsx               # NEW — fetch-by-id wrapper (useCalloutContributionQuery, includeCollaboraDocument: true), renders the overlay
├── CollaboraContributionEditorOverlay.tsx          # NEW — fullscreen Collabora editor for a CONTRIBUTION document (sibling of CollaboraFramingEditorOverlay; different refetchQueries; adds onDelete/canDelete)
├── ContributionGridConnector.tsx                   # MODIFIED — 'document' case → ContributionDocumentCard
├── ContributionsPreviewConnector.tsx               # MODIFIED — addConnector switch + addLabel + local ContributionCard switch gain the CollaboraDocument case
└── CalloutDetailDialogConnector.tsx                # MODIFIED — trailingSlot switch, documentContributionId/documentEditorOpen state, handleContributionClick branch, documentOverlay render, confirmDeleteContribution.kind extended to include 'document'

# New CRD card
src/crd/components/contribution/
└── ContributionDocumentCard.tsx                    # NEW — type-icon card, structurally mirrors ContributionWhiteboardCard

# i18n
# No locale file changes — every string this feature needs (addDocument, documentImportHint/
# MaxSize/Or/RemoveFile, documentImportError*, contentType.document, deleteContribution.*) is
# already present and generic across all six locales (confirmed by direct inventory, R8).
```

**Structure Decision**: The new write-side GraphQL operation lives alongside
its sibling framing-upload operations in
`src/domain/collaboration/calloutContributions/collaboraDocument/graphql/`
(the existing home for every Collabora-document mutation). Every new
UI connector lives in `src/main/crdPages/space/callout/`, matching the
existing one-connector-per-contribution-type family (Whiteboard/Memo/Post/
Link) exactly — there is no new directory, no new naming convention, and no
new architectural seam; this story fills in the one missing branch of an
already-established pattern.

## Phase 0: Outline & Research

See [research.md](research.md) for the consolidated findings (R1–R8):
the exact write mutation and why no blank-create path exists (R1); the
already-shipped, unused read-side plumbing being activated (R2); reuse of
the existing upload-zone and validation building blocks over the generic
storage-bucket upload pattern (R3); the contribution-scoped editor overlay
as a small sibling of the framing one rather than a shared, conditionally-
branching component (R4); reuse of the generic delete mutation and the
*existing* centralized confirm-delete mechanism (R5); the closed set of
response-type-plumbing edits (R6); the new icon-only contribution card,
independent of the unrelated `client-web#9872` framing-preview story (R7);
and the i18n key inventory (R8).

No `[NEEDS CLARIFICATION]` markers remain after the spec's two-iteration
`/speckit.clarify` pass; research closes the remaining mechanism-level
questions only.

## Phase 1: Design & Contracts

See:

- [data-model.md](data-model.md) — the extended `ResponseType` union, the extended `ContributionCardData` shape, the new mapping branch, and the new `.graphql` operation.
- [contracts/graphql-operations.md](contracts/graphql-operations.md) — the exact (unmodified) server contract consumed, the new client operation document, and the codegen outputs it produces.
- [quickstart.md](quickstart.md) — dev-loop commands, a manual verification recipe per user story, and the automated-coverage inventory.

The agent context (`CLAUDE.md` Recent Changes / Active Technologies) is
updated by `update-agent-context.sh claude`, run immediately after this plan.

## Constitution Check (Post-Design)

Re-evaluating after Phase 1 artifacts:

| Principle | Re-check |
|-----------|----------|
| I. Domain-Driven Frontend Boundaries | PASS — confirmed by the file layout above; no logic leaks into `src/crd/` or into route-level components. |
| II. React 19 Concurrent UX Discipline | PASS — no new global/blocking state; local `useState` only, matching sibling connectors. |
| III. GraphQL Contract Fidelity | PASS — one new operation file against an unmodified schema; codegen output to be committed in the same PR as the source `.graphql` change. |
| IV. State & Side-Effect Isolation | PASS — confirmed: the only "shared" state touched is the pre-existing centralized delete-confirmation state in `CalloutDetailDialogConnector`, extended (not duplicated) per R5. |
| V. Experience Quality & Safeguards | PASS — accessibility inherited from reused components (`DocumentImportZone`, `ConfirmationDialog`, the `ContributionWhiteboardCard` pattern); test plan finalized in quickstart.md. |
| Architecture Std 2/3/5/6 | PASS — confirmed in the file layout and the DRY inventory (research R3–R7); no MUI, no barrel exports, full SOLID mapping documented above. |

No new violations. Gate passes.

## Complexity Tracking

> No constitution violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
