# Implementation Plan: Context-Aware Callout Delete Confirmation

**Branch**: `114-callout-delete-context` | **Date**: 2026-07-02 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/114-callout-delete-context/spec.md`

## Summary

Turn the generic callout delete confirmation into a context-aware dialog that lists what will be permanently removed. The presentational surface (`ConfirmationDialog` → `DeleteCalloutDialog`) gains a variable-height body that summarizes the callout's contents; the confirm button reflects the scope ("Delete callout and all contents" vs. "Delete"). Per the 2026-07-02 clarification (**Option A**), the summary is built **only from data already cached** by the existing `CalloutDetails` fragment — **no new GraphQL query, no codegen** — so opening the dialog issues zero extra network requests. A pure mapper in the integration layer converts `CalloutDetailsModelExtended` → a plain-TS summary; the CRD component renders it with i18n copy from the `crd-space` namespace (all six languages, key parity).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)  
**Primary Dependencies**: shadcn/ui + Tailwind CSS v4 + Radix UI (`@/crd/*`), `react-i18next`, `lucide-react`, Apollo Client (generated hooks only — unchanged), `date-fns` (only if a date is rendered)  
**Storage**: Apollo normalized cache — **no new persistence, no new query, no fragment change** (Option A uses fields already selected by the `CalloutDetails` fragment)  
**Testing**: Vitest + jsdom (`pnpm vitest run`); existing `space.parity.test.ts` enforces i18n key parity  
**Target Platform**: Web SPA (browsers with >90% global support per `caniuse`)  
**Project Type**: single (web frontend)  
**Performance Goals**: Opening the delete dialog MUST NOT trigger any additional GraphQL request; render is synchronous from cache  
**Constraints**: CRD golden rules (presentational-only, plain-TS props, Tailwind-only, no `@mui/*`/`@emotion/*`); all destructive actions route through `ConfirmationDialog` (golden rule #9); WCAG 2.1 AA; i18n parity across en/nl/es/bg/de/fr  
**Scale/Scope**: One CRD prop extension, one enhanced CRD dialog + one small summary sub-component, one pure mapper, i18n keys in six files, unit tests. No routing, no schema, no new dependency.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Standard | Assessment | Status |
|---|---|---|
| I. Domain-Driven Frontend Boundaries | GraphQL→summary mapping lives in `src/main/crdPages/space/callout/` (integration layer); CRD component stays presentational and receives a plain-TS summary. No business logic in `src/crd/`. | ✅ Pass |
| II. React 19 Concurrent UX Discipline | Only existing visual open/close state; no new effects; render is pure and reads from cache synchronously. Loading/failure states already handled by `CalloutSettingsConnector` (spinner + `notify`). | ✅ Pass |
| III. GraphQL Contract Fidelity | **No schema/fragment change, no codegen.** Uses fields already selected by `CalloutDetails`. Optional stretch (name link-contributions) is a TS-model type change only — still no query change. No generated types leak into CRD props. | ✅ Pass |
| IV. State & Side-Effect Isolation | No new persistent state, no new side effects; mutation path (`useCalloutManager.deleteCallout`) unchanged. | ✅ Pass |
| V. Experience Quality & Safeguards | Content list uses semantic `<ul>`/`<li>`; destructive styling + keyboard/AT reachable; i18n parity across six languages with plural forms; unit tests for the pure mapper + summary render. | ✅ Pass |
| Arch #2 — CRD is the only design system | New/changed UI is entirely in `src/crd/`; glue in `src/main/crdPages/`. No MUI/Emotion. | ✅ Pass |
| Arch #3 — CRD-first i18n | New keys added to `src/crd/i18n/space/space.<lang>.json` for all six languages in the same change; no legacy `translation` namespace. | ✅ Pass |
| Arch #5 — No barrel exports | All imports use explicit file paths. | ✅ Pass |
| Arch #6 — SOLID / DRY | Mapper has a single responsibility (data→summary); summary view depends on a plain-TS abstraction (DIP/ISP); confirm-label logic derived once. | ✅ Pass |
| Golden Rule #9 — deletions route through `ConfirmationDialog` | Preserved: `DeleteCalloutDialog` continues to compose `ConfirmationDialog`; we extend that shared component with an optional body slot rather than forking a bespoke dialog. | ✅ Pass |

**Result**: No violations. Complexity Tracking not required.

## Project Structure

### Documentation (this feature)

```text
specs/114-callout-delete-context/
├── plan.md              # This file (/speckit.plan output)
├── spec.md              # Feature spec (+ Clarifications)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── crd-delete-dialog.ts   # TS prop contracts (component + summary shape)
├── checklists/
│   └── requirements.md
└── tasks.md             # /speckit.tasks output (NOT created here)
```

### Source Code (repository root)

```text
src/crd/components/dialogs/
├── ConfirmationDialog.tsx          # EXTEND: confirm variant gains optional `children` body slot
├── DeleteCalloutDialog.tsx         # CHANGE: accept plain-TS `content` summary; derive confirm label; render summary
├── CalloutDeletionSummary.tsx      # NEW: presentational content list (intro line, count, "and N more", rich-content note, links)
└── calloutDeletionSummary.types.ts # NEW: plain-TS view-model types (CalloutDeletionSummaryModel etc.) shared by mapper + CRD

src/crd/i18n/space/
├── space.en.json                   # EXTEND: deleteCallout.* (confirmAll, contentsIntro, plural counts, rich-content, links, attachments note; description reworded neutral — no contributions/comments claim)
├── space.nl.json                   # EXTEND (parity)
├── space.es.json                   # EXTEND (parity)
├── space.bg.json                   # EXTEND (parity)
├── space.de.json                   # EXTEND (parity)
└── space.fr.json                   # EXTEND (parity)

src/main/crdPages/space/callout/
├── CalloutSettingsConnector.tsx    # CHANGE: build summary via mapper, pass `content` to DeleteCalloutDialog
└── dataMappers/
    └── mapCalloutToDeletionSummary.ts   # NEW: pure GraphQL-model → plain-TS summary (Option A: cache-only fields)

tests (co-located):
├── src/main/crdPages/space/callout/dataMappers/mapCalloutToDeletionSummary.test.ts   # NEW: pure mapper unit tests
└── src/crd/components/dialogs/CalloutDeletionSummary.test.tsx                          # NEW: render tests (count, more-line, empty, rich content)
```

**Structure Decision**: Single web-frontend project. The change splits cleanly across the two established layers: presentational (`src/crd/`) receives a plain-TS `content` summary and renders it; integration (`src/main/crdPages/space/callout/`) owns the GraphQL-model→summary mapping and wires it into the existing `CalloutSettingsConnector`. This mirrors the reference pattern already used for `DeleteCalloutDialog` and respects every CRD golden rule.

## Complexity Tracking

> No Constitution Check violations — this section intentionally left empty.
