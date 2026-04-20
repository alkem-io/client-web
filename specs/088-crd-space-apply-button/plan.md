# Implementation Plan: CRD Space Apply/Join Button on Dashboard

**Branch**: `088-crd-space-apply-button` | **Date**: 2026-04-17 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/088-crd-space-apply-button/spec.md`

## Summary

Close the parity gap introduced by 087: render the existing CRD `SpaceAboutApplyButton` and its five flow surfaces at the top of the CRD Space Dashboard tab when the current viewer is not a member, mirroring the legacy MUI Dashboard call-to-action. No new CRD presentational components, no new translation keys, no routing or toggle changes, no domain changes. The work is a single new integration connector that reuses spec-087's CRD button + connectors + dialogs and one two-line edit to the CRD Dashboard page.

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing, unchanged), `react-i18next` (existing), React Compiler (`babel-plugin-react-compiler`). No new dependencies.
**Storage**: N/A (frontend SPA; data via existing GraphQL queries — no schema changes and no new queries/mutations)
**Testing**: Vitest with jsdom (existing suite continues to pass); no new test files required (thin connector over already-tested 087 components)
**Target Platform**: Web SPA (Vite, localhost:3001 dev; backend at localhost:3000)
**Project Type**: Web SPA — single monorepo with the three-layer CRD architecture (presentation / integration / domain)
**Performance Goals**: Dashboard interactive within 1 s of route navigation (existing target for the Dashboard tab; the CTA adds one lightweight Apollo query — `useApplicationButtonQuery` — and five dialog subtrees that lazy-render via `open` flags). Apply flow complete in <90 s for ≤5-question forms (SC-005); join flow <15 s (SC-006).
**Constraints**: Zero MUI/Emotion imports added to `src/crd/`; no GraphQL/domain/auth/router imports in `src/crd/`; `src/main/crdPages/space/` may import from `@/domain/*`, `@/core/apollo/*`, and `@/main/routing/*` (integration layer); WCAG 2.1 AA; React Compiler compatible (no manual `useMemo` / `useCallback` / `React.memo`); `.crd-root` CSS scoping applies naturally because the connector lives inside the CRD Dashboard tree; props-only / event-handler-as-prop in the CRD layer.
**Scale/Scope**: 1 new integration file (~110 lines), 1 modified integration file (+2 lines). Zero presentation, zero domain, zero translation changes.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | No domain rules added; the connector orchestrates the existing `useApplicationButton` façade. All business rules stay in `src/domain/access/ApplicationsAndInvitations/` and `src/domain/community/applicationButton/`. |
| II | React 19 Concurrent UX Discipline | PASS | No legacy lifecycle patterns; no manual memoization (React Compiler handles it); dialog open/close state is trivially pure; Suspense already wraps the lazy-loaded Dashboard tab in `CrdSpaceRoutes.tsx`; apply/join mutations use Apollo's existing async flows. |
| III | GraphQL Contract Fidelity | PASS | No schema changes. Reuses generated hooks from `src/core/apollo/generated/apollo-hooks.ts`: `useApplicationButtonQuery`, `useUserPendingMembershipsQuery`, `useApplyForEntryRoleOnRoleSetMutation`, `useJoinRoleSetMutation` (all consumed by the existing `useApplicationButton` hook and `ApplyDialogConnector`). No raw `useQuery`. No generated GraphQL types leak into CRD prop contracts. |
| IV | State & Side-Effect Isolation | PASS | Component state is five `useState` flags for dialog open/close — purely visual. Persistent state lives in the Apollo cache via existing `useApplicationButton`. No direct DOM manipulation. The only side effects are navigation (via `useNavigate`, an established `src/core` adapter) and dialog mutations routed through the reused domain hooks. |
| V | Experience Quality & Safeguards | PASS | Inherits WCAG 2.1 AA from the reused CRD button + dialogs (focus traps, Esc-to-close, `aria-hidden` on decorative icons, keyboard-operable, visible focus rings). i18n uses `react-i18next` and reuses existing keys under `crd-space` — no hard-coded copy. |
| Arch 1 | Feature directory taxonomy | PASS | New file lives at `src/main/crdPages/space/SpaceApplyButtonConnector.tsx` — the integration layer for the CRD Space feature, beside the existing `about/` subdirectory. Edit target `src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx` is already in the correct location. |
| Arch 2 | Styling standard (CRD vs MUI) | PASS | All presentation is via the existing CRD button + dialogs. Zero MUI / Emotion imports in either new or modified files. (Unlike 087, this feature does not reuse the legacy MUI `DirectMessageDialog`; no contact-host affordance is in scope.) |
| Arch 3 | i18n pipeline | PASS | No new keys. All strings the button surfaces already exist under `src/crd/i18n/space/space.<lang>.json` (`about.*` button state labels and `apply.*` dialog labels introduced by 087). The connector renders no text of its own; translations are handled inside the reused presentation components. No changes to any of the six locale files. |
| Arch 4 | Build determinism | PASS | No Vite config changes. The new file adds one chunk-internal import; it is eagerly imported by `CrdSpaceDashboardPage.tsx` (which is itself lazy-loaded by the router), so the connector code is pulled into the Dashboard chunk that only loads when a user visits the Dashboard tab with the CRD toggle on. |
| Arch 5 | Import transparency | PASS | Explicit file paths only; no barrel exports. New file imports from `@/crd/components/space/SpaceAboutApplyButton`, `@/crd/components/community/*`, `@/domain/access/ApplicationsAndInvitations/useApplicationButton`, `@/domain/community/applicationButton/isApplicationPending`, `@/main/routing/urlBuilders`, `@/core/routing/useNavigate`, `@/domain/space/context/useSpace`, and `./about/ApplyDialogConnector` / `./about/InvitationDetailConnector`. |
| Arch 6 | SOLID / DRY | PASS | **SRP**: the connector does one thing — wire the apply-flow for a given `spaceId` / `spaceProfileUrl`. **OCP**: configurable via props; no conditional branches that encode policy. **LSP / ISP**: the connector consumes the already-published contracts of `SpaceAboutApplyButton` and the four CRD dialogs verbatim. **DIP**: depends on the `useApplicationButton` domain abstraction, not on concrete GraphQL hooks. **DRY**: the state-machine state mapping that exists inline at `CrdSpaceAboutPage.tsx:162-183` is lifted into this connector so the Dashboard and About page paths share the same wiring if/when we later choose to unify them (currently About stays inline — see Complexity Tracking). |
| Eng 5 | Root cause analysis | PASS | No workarounds are introduced. The CTA absence on the CRD Dashboard is the actual gap being closed; the fix is the minimum necessary: render the CTA. No `fetchPolicy`, no retry logic, no defensive guards. Members-see-nothing is a deliberate UX requirement (FR-009), not a mask for a loading bug. |

**Result**: All gates pass. No entries required in Complexity Tracking.

## Project Structure

### Documentation (this feature)

```text
specs/088-crd-space-apply-button/
├── plan.md              # This file (/speckit.plan output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: decisions confirmed during exploration
├── data-model.md        # Phase 1: CRD prop type definitions for the new integration
├── quickstart.md        # Phase 1: developer setup + manual test matrix
├── contracts/           # Phase 1: connector contract
│   └── connector.md
└── checklists/
    └── requirements.md  # Spec quality checklist (already complete)
```

### Source Code (repository root)

Web SPA — the three-layer CRD architecture established by 039 / 041 / 042 / 086 / 087 is preserved.

```text
src/
├── crd/                                                        # UNCHANGED (presentation layer)
│   ├── components/space/SpaceAboutApplyButton.tsx              # REUSE (087)
│   ├── components/community/ApplicationFormDialog.tsx          # REUSE (087)
│   ├── components/community/ApplicationSubmittedDialog.tsx     # REUSE (087)
│   ├── components/community/PreApplicationDialog.tsx           # REUSE (087)
│   ├── components/community/PreJoinParentDialog.tsx            # REUSE (087)
│   ├── components/dashboard/InvitationDetailDialog.tsx         # REUSE (087 via InvitationDetailConnector)
│   └── i18n/space/space.<lang>.json                            # UNCHANGED — existing keys reused
│
├── main/crdPages/space/                                        # Integration layer (CRD)
│   ├── SpaceApplyButtonConnector.tsx                           # NEW — the one new file for this feature
│   ├── about/ApplyDialogConnector.tsx                          # REUSE (087)
│   ├── about/InvitationDetailConnector.tsx                     # REUSE (087)
│   ├── about/CrdSpaceAboutPage.tsx                             # UNCHANGED (keeps its inline wiring)
│   └── tabs/CrdSpaceDashboardPage.tsx                          # MODIFY — +2 lines to render the connector
│
├── domain/                                                     # UNCHANGED
│   ├── access/ApplicationsAndInvitations/useApplicationButton.ts   # REUSE
│   ├── community/applicationButton/isApplicationPending.ts         # REUSE
│   └── space/context/useSpace.ts                                    # REUSE (already called by Dashboard page)
│
├── core/                                                       # UNCHANGED
│   ├── apollo/generated/apollo-hooks.ts                        # REUSE — `useApplicationButtonQuery`, etc. (transitive)
│   └── routing/useNavigate.ts                                  # REUSE
│
├── main/routing/urlBuilders.ts                                 # REUSE — `buildLoginUrl`
├── main/routing/TopLevelRoutes.tsx                             # UNCHANGED — CRD toggle already routes Dashboard via CRD
└── domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage.tsx   # UNCHANGED — MUI default
```

**Structure Decision**: Single Web SPA, three-layer CRD architecture retained. Zero new files in `src/crd/`, zero new files in `src/domain/`, zero changes to routing. One new integration file under `src/main/crdPages/space/` beside `about/`. One two-line edit in the existing Dashboard tab page under `src/main/crdPages/space/tabs/`.

## Complexity Tracking

> No Constitution violations. This section is intentionally empty.

## Phase 0: Outline & Research

**Status**: Complete. Consolidated in [`research.md`](./research.md).

No `NEEDS CLARIFICATION` items remain from spec resolution (the `/speckit.clarify` pass reported "No critical ambiguities detected worth formal clarification" — the spec inherits all dialog UX, validation, and mutation-failure semantics from 087). The research document captures five concrete decisions (placement, visibility guard, state-machine mapping, login-URL preservation, and refetch flow) and maps each to the existing 087 source locations.

## Phase 1: Design & Contracts

**Status**: Complete.

Outputs:
- [`contracts/connector.md`](./contracts/connector.md) — the public prop contract for `SpaceApplyButtonConnector` + the exact state-mapping table from `applicationButtonProps` to `SpaceAboutApplyButton` props.
- [`data-model.md`](./data-model.md) — TypeScript prop type definition for the single new integration component, plus the upstream types it re-uses.
- [`quickstart.md`](./quickstart.md) — developer setup, CRD toggle steps, and the manual nine-scenario verification matrix from the spec.

No `contracts/` GraphQL schema is required — the feature adds no endpoints, mutations, or queries beyond what 087 already wired.

Agent context update is applied via `.specify/scripts/bash/update-agent-context.sh claude` to record the (minor) dependency delta for this feature in `CLAUDE.md`.

## Post-Design Constitution Re-Check

Re-checked after data-model + contract: **all gates still pass.** No new violations were introduced by Phase 1 design. Arch 2 (CRD styling) is satisfied without exception — unlike 087, this feature does not render any MUI dialog.
