# Implementation Plan: Admin UI for Space Conversions & Resource Transfers

**Branch**: `025-admin-transfer-ui` | **Date**: 2026-03-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/025-admin-transfer-ui/spec.md`

## Summary

Build a unified "Conversions & Transfers" admin page that enables Platform Administrators to perform 9 structural operations (space hierarchy conversions, account resource transfers, VC type conversion, and callout transfer) through the UI instead of direct API calls. The page is organized into two areas: **Conversions** (space level changes + VC type conversion) and **Transfers** (resource ownership changes). All backend mutations already exist — this is frontend-only work building React components, hooks, and GraphQL documents that consume them.

**Technical approach**: Extend the existing `TransferPage` under `src/domain/platformAdmin/management/transfer/` with new subsections following established URL-resolution + mutation patterns. New operations use `FormikAutocomplete` for target selection (accounts, sibling L1 spaces). Existing `TransferSpaceSection` and `TransferCalloutSection` are preserved as-is. 7 new `.graphql` documents + hooks + section components are needed.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19, Node ≥22.0.0
**Primary Dependencies**: MUI 7 (UI), Apollo Client 3 (GraphQL), react-i18next (i18n), Formik (forms), Emotion (CSS-in-JS)
**Storage**: Apollo Client normalized cache (no local persistence beyond session)
**Testing**: Vitest with jsdom environment
**Target Platform**: Web SPA served by Vite (localhost:3001, backend at localhost:3000)
**Project Type**: Web (frontend only — no backend changes)
**Performance Goals**: Any operation completable in <60 seconds (SC-004); mutation loading states prevent double-submission
**Constraints**: Frontend-only scope; all 9 mutations pre-exist in backend schema; WCAG 2.1 AA for all new interactive elements
**Scale/Scope**: 6 new section components, 7 new GraphQL documents, ~5 new hooks, ~80 new i18n keys (including section descriptions and operation hints), 1 reorganized admin page with contextual UX guidance

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### Pre-Phase 0 Gate

| # | Principle | Status | Evidence / Mitigation |
|---|-----------|--------|----------------------|
| I | Domain-Driven Frontend Boundaries | PASS | All new components go under `src/domain/platformAdmin/management/transfer/`. Domain hooks encapsulate GraphQL operations; section components orchestrate hooks and return UI. No business logic in components. |
| II | React 19 Concurrent UX Discipline | PASS | Admin mutations are sub-second one-shot operations (not "long-running" data fetches or transitions that block paint), so `useState` + `try/finally` loading states are sufficient — `useTransition` and `useOptimistic` provide no UX benefit here since there is no optimistic state to show and no concurrent rendering to coordinate. Confirmation dialogs are accessible and keyboard-navigable. |
| III | GraphQL Contract Fidelity | PASS | All operations use generated hooks from `apollo-hooks.ts`. 7 new `.graphql` documents require `pnpm codegen` in the implementation PR. No raw `useQuery`; no direct GraphQL type exports through UI contracts. |
| IV | State & Side-Effect Isolation | PASS | State lives in Apollo cache + local component state (URL inputs, dialog open/close). No direct DOM manipulation. Notifications go through `useNotification` adapter. |
| V | Experience Quality & Safeguards | PASS | All destructive operations (L1→L2, VC conversion, callout transfer) require explicit confirmation dialogs listing consequences. Contextual `Alert` hints surface operation impact before action. Section descriptions guide admins. `ToggleButtonGroup` prevents cognitive overload for L1 dual operations. WCAG 2.1 AA: semantic HTML, keyboard navigation, ARIA labels on form inputs. Loading indicators prevent double-submission. |

### Architecture Standards

| # | Standard | Status | Evidence |
|---|----------|--------|----------|
| 1 | Feature directories map to domain contexts | PASS | New subsections nested under existing `src/domain/platformAdmin/management/transfer/` |
| 2 | MUI theming | PASS | All UI uses MUI components (Button, Typography, Autocomplete) with theme tokens |
| 3 | i18n via react-i18next | PASS | All user-visible strings use `t()` with keys in `translation.en.json` |
| 4 | Deterministic builds | PASS | No Vite config changes |
| 5 | Import transparency (no barrel exports) | PASS | All imports use explicit file paths |
| 6 | SOLID principles | PASS | SRP: each section component handles one operation type; hooks separate data logic from UI. OCP: new sections extend the page without modifying existing ones. DIP: components consume hooks, not direct GraphQL queries. |

### Engineering Workflow

| # | Requirement | Status |
|---|------------|--------|
| 1 | Planning documents affected contexts, React 19 features, GraphQL ops | PASS (this document) |
| 2 | `pnpm codegen` in PR with generated artifacts | Required at implementation time |
| 3 | Domain-first: façade → GraphQL → UI | PASS — plan follows this order |
| 4 | A11y, performance, testing evidence in PR | Required at implementation time |
| 5 | Root cause analysis before fixes | N/A — new feature, no debugging |

**GATE RESULT: PASS** — No violations. Proceeding to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/025-admin-transfer-ui/
├── spec.md                          # Feature specification
├── plan.md                          # This file
├── conversion-transfer-analysis.md  # Backend mutation analysis (pre-existing)
├── research.md                      # Phase 0 output
├── data-model.md                    # Phase 1 output
├── quickstart.md                    # Phase 1 output
├── contracts/                       # Phase 1 output
│   ├── SpaceConversion.graphql      # Space conversion mutations + queries
│   ├── VcConversion.graphql         # VC type conversion mutation + queries
│   ├── TransferInnovationHub.graphql    # Hub transfer mutation + queries
│   ├── TransferInnovationPack.graphql   # Pack transfer mutation + queries
│   ├── TransferVirtualContributor.graphql # VC transfer mutation + queries
│   └── AccountSearch.graphql        # Shared account search query
├── checklists/
│   └── requirements.md              # Quality checklist (pre-existing)
└── tasks.md                         # Phase 2 output (NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
src/domain/platformAdmin/management/transfer/
├── TransferPage.tsx                        # Reorganized: two areas (Conversions + Transfers)
├── toFullUrl.ts                            # Existing utility (preserved)
│
├── spaceConversion/                        # NEW — P1
│   ├── SpaceConversionSection.tsx          # Single URL input, dynamic operations by level
│   ├── useSpaceConversion.ts              # URL resolution + conversion mutations
│   ├── useSpaceConversion.test.ts         # Tests for level-based branching and sibling-target filtering
│   ├── SpaceConversionOperations.tsx       # Renders applicable operations based on level
│   └── SpaceConversion.graphql             # URL resolve + lookup + 3 conversion mutations
│
├── vcConversion/                           # NEW — P3
│   ├── VcConversionSection.tsx            # VC URL input + conversion UI
│   ├── useVcConversion.ts                 # URL resolution + conversion mutation
│   ├── useVcConversion.test.ts            # Tests for eligibility and source-space/callout branching
│   └── VcConversion.graphql               # URL resolve + lookup + conversion mutation
│
├── transferSpace/                          # EXISTING (preserved as-is)
│   ├── TransferSpaceSection.tsx
│   ├── useTransferSpace.ts
│   └── TransferSpace.graphql
│
├── transferInnovationHub/                  # NEW — P2
│   ├── TransferInnovationHubSection.tsx
│   ├── useTransferInnovationHub.ts
│   └── TransferInnovationHub.graphql
│
├── transferInnovationPack/                 # NEW — P2
│   ├── TransferInnovationPackSection.tsx
│   ├── useTransferInnovationPack.ts
│   └── TransferInnovationPack.graphql
│
├── transferVirtualContributor/             # NEW — P2
│   ├── TransferVirtualContributorSection.tsx
│   ├── useTransferVirtualContributor.ts
│   └── TransferVirtualContributor.graphql
│
├── transferCallout/                        # EXISTING (preserved as-is)
│   ├── TransferCalloutSection.tsx
│   ├── useTransferCallout.ts
│   └── TransferCallout.graphql
│
└── shared/                                 # NEW — shared utilities
    ├── AccountSearchPicker.tsx             # Searchable picker for target accounts (with hasSearched-aware noOptionsText)
    ├── useAccountSearch.ts                 # Lazy query for account search (exposes hasSearched via Apollo called state)
    ├── useAccountSearch.test.ts            # Tests for combined results, privilege filtering
    └── AccountSearch.graphql               # Account search query
```

**Structure Decision**: Follows the existing `src/domain/platformAdmin/management/transfer/` structure. Each operation type gets its own subdirectory with a section component, a hook, and a GraphQL document — matching the pattern established by `transferSpace/` and `transferCallout/`. A `shared/` directory holds the reusable `AccountSearchPicker` used by 3 transfer operations.

## Post-Phase 1 Constitution Re-check

| # | Principle | Status | Post-Design Evidence |
|---|-----------|--------|---------------------|
| I | Domain-Driven Frontend | PASS | All 6 new subdirectories under `src/domain/platformAdmin/management/transfer/`. Shared `AccountSearchPicker` in `shared/` — cross-cutting within the admin domain, not leaked outside. |
| II | React 19 Concurrent UX | PASS | Admin mutations are sub-second one-shot operations — `useState` + `try/finally` is appropriate because there is no optimistic state, no concurrent rendering risk, and no long-running transition to coordinate. `useTransition` would add complexity without UX benefit. |
| III | GraphQL Contract Fidelity | PASS | 6 new `.graphql` documents defined in `contracts/`. All use generated hooks after `pnpm codegen`. No raw queries. Return types request only `{ id }` to avoid schema mismatches. |
| IV | State & Side-Effect Isolation | PASS | All state is local (URL inputs, dialog open, loading flags) or Apollo cache. `useNotification` for side effects. No direct DOM manipulation. |
| V | Experience Quality & Safeguards | PASS | 4 distinct confirmation dialogs with operation-specific consequences. Contextual `Alert` hints per space conversion operation. Section descriptions below every title. ToggleButtonGroup for mutually exclusive L1 operations. ConfirmationDialog has default confirm label fallback. AccountSearchPicker distinguishes "no search yet" from "no results". WCAG: form inputs have labels, buttons have descriptive text, dialogs are keyboard-navigable. Empty picker states handled with explanatory messages. |
| SOLID | SRP + DIP | PASS | Each section: 1 component + 1 hook + 1 GraphQL doc. Components depend on hook abstractions, not direct queries. `AccountSearchPicker` extracted as shared component (DRY). |

**GATE RESULT: PASS** — No violations in designed artifacts.

## Complexity Tracking

> No constitution violations to justify. All patterns align with existing codebase conventions.

*No entries needed.*
