# Implementation Plan: Document Framing on a Post — Create New or Upload

**Branch**: `095-collabora-import` | **Date**: 2026-05-04 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/095-collabora-import/spec.md`

## Summary

Wire up the FE for the **Document** framing option in the Create Post dialog so that authors can either create a blank Word Document / Spreadsheet / Presentation (existing behaviour) **or** upload a `.docx` / `.xlsx` / `.pptx` file (≤ 15 MB) which becomes the post's framing document. The implementation uses the existing `createCalloutOnCalloutsSet` mutation, extended with one new optional `file: Upload` argument and two newly-optional input fields, finalised on alkem-io/server branch `095-collabora-import`. Both FE paths (the production-default MUI surface in `src/domain/collaboration/callout/CalloutForm/` and the CRD surface wired via `src/main/crdPages/space/callout/`) reuse the same domain hook (`useCalloutCreation`) — the iteration extends that hook to accept an optional file and threads the file through to the mutation. Documents are explicitly removed from the Response Options surfaces in both paths (FR-015 / FR-016). Apollo Client's upload link (`apollo-upload-client`) is already configured at the http-link level (`src/core/apollo/graphqlLinks/httpLink.ts`), so no transport-level work is required.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node ≥ 22 (Volta-pinned 24.14.0)
**Primary Dependencies**: `@apollo/client` (existing), `apollo-upload-client` ^18 (already wired in `httpLink.ts`), `react-i18next` (existing), Formik (existing form state), MUI for the production-default form surface, CRD (shadcn/ui + Tailwind v4) for the new design-system surface, `lucide-react` for CRD icons, `@mui/icons-material` for the MUI surface
**Storage**: N/A — server-side via GraphQL; uploaded bytes go through file-service-go and end up as the framing document's content. No client-side caching of file bytes.
**Testing**: Vitest with jsdom — unit tests for the new pure helpers (extension/size validation, displayName-decision, auto-prefill comparison) and for the existing `calloutFormMapper.ts` which gains an upload-path branch.
**Target Platform**: Web SPA served by Vite; same browser support matrix as the rest of the client (≥ 90% global per `caniuse.com`).
**Project Type**: Web client only. The server contract is finalised on alkem-io/server branch `095-collabora-import` and is consumed by this iteration unchanged.
**Performance Goals**: SC-001 (blank-create flow under 5 s end-to-end), SC-002 (upload flow under 10 s end-to-end for a few-hundred-KB file). All client-side pre-checks complete synchronously; no network call is initiated until pre-checks pass.
**Constraints**: Two parallel UI paths (MUI + CRD) must reach feature parity. Atomic-failure server contract — the FE MUST NOT compensate for partial backend state. Pre-checks (single file, extension ∈ `.docx`/`.xlsx`/`.pptx`, size ≤ 15 MB) MUST run before any network request. Picker `accept` hint and helper text MUST share a single canonical format/size source. The 15 MB cap is hardcoded in P1 — same one file-service-go enforces.
**Scale/Scope**: Approximately 12–18 files modified or created across `src/domain/collaboration/calloutsSet/useCalloutCreation/`, `src/domain/collaboration/calloutContributions/collaboraDocument/`, `src/domain/collaboration/callout/CalloutForm/`, `src/main/crdPages/space/callout/`, `src/crd/forms/callout/`, `src/core/i18n/en/translation.en.json`, and `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json`. One `.graphql` file modified; codegen regenerated.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain-Driven Frontend Boundaries | PASS | The shared `useCalloutCreation` hook in `src/domain/collaboration/calloutsSet/useCalloutCreation/` is extended to accept an optional `file`. UI surfaces (MUI in `src/domain/collaboration/callout/CalloutForm/`, CRD in `src/main/crdPages/space/callout/` with presentational pieces in `src/crd/forms/callout/`) consume the hook abstraction without inlining business logic. New pure helpers (validation, displayName-decision, auto-prefill comparison) live next to the domain hook they serve in `src/domain/collaboration/calloutContributions/collaboraDocument/`. |
| II. React 19 Concurrent UX Discipline | PASS | The existing `useCalloutCreation` already uses `useState` for `isCreating`; this iteration keeps that pattern. The submission path is a single Apollo mutation — concurrency-safe. The drag-drop / file-staging UI uses local `useState` for staged-file display only; nothing blocks render. No deprecated lifecycle patterns. Suspense not required for this flow. |
| III. GraphQL Contract Fidelity | PASS | The existing `calloutCreation.graphql` is the only operation file modified — adding the optional `file: Upload` argument and threading it through the mutation root call. `pnpm run codegen` regenerates `useCreateCalloutMutation` with the new variable. No raw `useQuery`. Generated outputs are committed in the same PR per project policy. |
| IV. State & Side-Effect Isolation | PASS | All cache mutation logic stays in the existing `useCalloutCreation` `update` callback. Form state (post title, framing type, staged file, selected blank-create card) lives in Formik. No new global state, no direct DOM manipulation. The `apollo-require-preflight` header is already set globally on the upload link — no per-mutation header configuration. |
| V. Experience Quality & Safeguards | PASS | The drag-drop upload zone meets WCAG 2.1 AA: keyboard-operable (`<button>` semantics, focus-visible ring, Enter/Space triggers the file picker, drag-and-drop is an _augmentation_ on top of the click-to-upload affordance, not a replacement), `aria-busy` while uploading, inline error rendered with `role="alert"` near the offending field, focus moves to the error on rejection. The 15 MB cap and accepted-extensions list are surfaced in helper text before any selection. Tests cover the pure helpers; manual tests cover the drag-drop UX and screen-reader flow. |
| Architecture Std 2 (Styling) | PASS | MUI surface (`CalloutFormFramingSettings.tsx`) keeps MUI patterns; CRD surface uses shadcn/ui + Tailwind exclusively (`src/crd/forms/callout/CollaboraDocumentTypePicker.tsx` extension). The new CRD upload-zone component imports only from `@/crd/primitives/`, `@/crd/lib/`, and `lucide-react`. No `@mui/*` or `@emotion/*` imports in CRD. |
| Architecture Std 3 (i18n) | PASS | New MUI strings added to `src/core/i18n/en/translation.en.json` (Crowdin-managed; only English edited). New CRD strings added manually to all six `src/crd/i18n/space/space.{en,nl,es,bg,de,fr}.json` files per the CRD CLAUDE policy (Crowdin not used for CRD). No hardcoded user-visible text. |
| Architecture Std 5 (No barrel exports) | PASS | All new imports use explicit file paths. |
| Architecture Std 6 (SOLID) | PASS | **SRP**: separate pure functions for `validateCollaboraImportFile` (pre-checks), `deriveDisplayNameOnSubmit` (typed-vs-prefill decision), and `filenameWithoutExtension`. **OCP**: the framing picker accepts the upload zone as a sub-component; new framing types in the future plug in alongside without modifying the upload zone. **LSP**: the extended `useCalloutCreation` keeps the existing call signature when `file` is omitted (parameter is optional); existing blank-create callsites are unchanged. **ISP**: the new CRD `<DocumentImportZone>` exposes a minimal prop surface (`acceptedExtensions`, `maxBytes`, `value`, `onChange`, `onError`, labels). **DIP**: UI components depend on the `useCalloutCreation` hook abstraction, not on the generated mutation directly. **DRY**: the supported-format list and 15 MB cap are exported from a single module (`collaboraImportFormats.ts`) consumed by both UI paths and the validation helper. |

No violations. Gate passes.

## Project Structure

### Documentation (this feature)

```text
specs/095-collabora-import/
├── plan.md                  # This file
├── research.md              # Phase 0 output
├── data-model.md            # Phase 1 output
├── quickstart.md            # Phase 1 output
├── contracts/               # Phase 1 output
│   └── graphql-mutation-extension.md
├── checklists/
│   └── requirements.md      # From /speckit.specify quality gate
└── tasks.md                 # Phase 2 output (created by /speckit.tasks)
```

### Source Code (repository root)

```text
# Shared domain layer — both MUI and CRD callout-creation flows go through here
src/domain/collaboration/calloutsSet/useCalloutCreation/
├── calloutCreation.graphql                       # MODIFIED — add `$file: Upload` arg + thread through mutation
├── useCalloutCreation.ts                         # MODIFIED — accept optional `file: File` param; pass to mutation variables
└── useCalloutCreationWithPreviewImages.ts        # MODIFIED — surface the file param to its callers (whiteboard preview wrapper)

# Domain helpers for the import path (pure functions; consumed by both UI paths)
src/domain/collaboration/calloutContributions/collaboraDocument/
├── collaboraImportFormats.ts                     # NEW — single source of truth for supported extensions + 15 MB cap
├── collaboraImportFormats.spec.ts                # NEW — table-driven tests for the extension/cap constants
├── validateCollaboraImportFile.ts                # NEW — pre-check: single file, extension, size; returns typed error or ok
├── validateCollaboraImportFile.spec.ts           # NEW — covers each rejection branch + the exact-cap boundary
├── deriveCollaboraDocumentDisplayName.ts         # NEW — typed-vs-prefill decision rule (FR-004b)
├── deriveCollaboraDocumentDisplayName.spec.ts    # NEW — covers all 4 branches in the decision rule
└── filenameWithoutExtension.ts                   # NEW — strip-extension helper (used for auto-prefill + filename hints)

# MUI form surface (production-default path)
src/domain/collaboration/callout/CalloutForm/
├── CalloutFormFramingSettings.tsx                # MODIFIED — add upload zone after the document-type radios when type=COLLABORA_DOCUMENT
├── CalloutFormContributionSettings.tsx           # MODIFIED — remove the disabled COLLABORA_DOCUMENT radio entirely (FR-015)
└── CalloutFormModel.ts                           # MODIFIED — extend framing's collaboraDocument shape with optional staged file

# CRD form surface (design-system path)
src/main/crdPages/space/callout/
├── CalloutFormConnector.tsx                      # MODIFIED — read the staged file from form values, pass to useCalloutCreation
├── calloutFormMapper.ts                          # MODIFIED — branch the mapping for upload-vs-blank submission shapes
└── calloutFormMapper.test.ts                     # MODIFIED — add tests for the new upload-path mapping branch

src/crd/forms/callout/
├── CollaboraDocumentTypePicker.tsx               # MODIFIED — add the "or upload" zone after the three blank-create cards
└── DocumentImportZone.tsx                        # NEW — pure CRD drag-drop / click-to-upload zone (presentational only)

# Response-options cleanup (FR-015 / FR-016 cross-cutting)
src/main/crdPages/space/callout/
└── (response-options panel — wherever the CRD "Documents (Coming soon)" tab lives)  # MODIFIED — remove the tab

# i18n surfaces
src/core/i18n/en/translation.en.json              # MODIFIED — new strings: upload helper, errors, busy/state labels (MUI scope)
src/crd/i18n/space/space.en.json                  # MODIFIED — new CRD strings (English source)
src/crd/i18n/space/space.{nl,es,bg,de,fr}.json    # MODIFIED — manually-translated peers per CRD CLAUDE policy
```

**Structure Decision**: Domain logic — the mutation file, the hook, and the pure helper functions — lives under `src/domain/`. The MUI form pieces stay in `src/domain/collaboration/callout/CalloutForm/` (existing pattern for callout-form code that predates the CRD migration). The CRD upload zone is a pure presentational component in `src/crd/forms/callout/`, mounted by the connectors in `src/main/crdPages/space/callout/`. Both UI paths converge on the same shared hook (`useCalloutCreation`), satisfying the "domain hook, twin UI paths" pattern already established for blank-create.

## Phase 0: Outline & Research

See [research.md](research.md) for the consolidated findings. Topics resolved:

1. **Apollo upload-link wiring** — already configured at `src/core/apollo/graphqlLinks/httpLink.ts:13` (`createUploadLink` + `apollo-require-preflight`). No transport work required.
2. **Where the existing `createCalloutOnCalloutsSet` mutation is invoked** — single source via `useCalloutCreation` hook, consumed by both MUI and CRD form paths.
3. **Client-side pre-check strategy** — extension + size + single-file checks, all pure-synchronous, returning a discriminated-union error type. No content sniffing on the client.
4. **Auto-prefill detection strategy** — track the auto-prefilled value as a Formik field metadata; compare current title to prefilled value at submit time to decide whether to send displayName explicitly or rely on server filename derivation.
5. **Atomic-failure FE pattern** — server is atomic; FE never compensates for partial state. On any error the dialog stays open with input preserved (FR-010); navigation to the new post happens only on success.
6. **Response-options removal scope** — two surfaces: hardcoded `disabled: true` radio in `CalloutFormContributionSettings.tsx` (MUI) and the "Coming soon" Documents tab in the CRD response-options panel. Both removed in this iteration.

No `[NEEDS CLARIFICATION]` markers remained after the spec's `/speckit.clarify` pass; research closes the only remaining domain-level mechanism questions.

## Phase 1: Design & Contracts

See:

- [data-model.md](data-model.md) — minimal client-side types (staged-file shape, validation-error union, form-values extension).
- [contracts/graphql-mutation-extension.md](contracts/graphql-mutation-extension.md) — the exact `.graphql` change to `calloutCreation.graphql` and the resulting generated-hook signature.
- [quickstart.md](quickstart.md) — dev-environment setup, manual test recipes for each user story, and the validation commands.

The agent context (`CLAUDE.md` recent changes) is updated by `update-agent-context.sh` (run after this plan).

## Constitution Check (Post-Design)

Re-evaluating after Phase 1 artifacts:

| Principle | Re-check |
|-----------|----------|
| I. Domain-Driven Frontend Boundaries | PASS — every new helper lives in domain layer; UI surfaces consume the domain hook. |
| II. React 19 Concurrent UX Discipline | PASS — no new long-running synchronous render paths; Formik handles form state with no side effects in render. |
| III. GraphQL Contract Fidelity | PASS — single GraphQL file modification; codegen regenerates the hook. The contract itself is firm and on the named server branch. |
| IV. State & Side-Effect Isolation | PASS — Apollo cache update stays in the existing `update` callback; staged-file lives in Formik; no new global state. |
| V. Experience Quality & Safeguards | PASS — accessibility plan documented in research.md; tests planned for every pure helper; the drag-drop zone has both keyboard and pointer paths. |
| Architecture Std 2/3/5/6 | PASS — confirmed in the file layout above. |

No new violations. Gate passes.

## Complexity Tracking

> No constitution violations to justify.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| (none) | — | — |
