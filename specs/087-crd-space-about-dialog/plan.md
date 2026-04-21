# Implementation Plan: CRD Space About Dialog

**Branch**: `087-crd-space-about-dialog` | **Date**: 2026-04-16 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/087-crd-space-about-dialog/spec.md`

## Summary

Bring the CRD Space About to feature-parity with the legacy MUI dialog at `/:spaceId/about` so that environments with the `alkemio-crd-enabled` localStorage toggle on get the new visual language without losing any functionality. The current CRD About is a plain page view (`src/crd/components/space/SpaceAboutView.tsx`) inside a thin container (`src/main/crdPages/space/about/CrdSpaceAboutPage.tsx`). We will: (a) wrap the view in a shadcn dialog, (b) extend the view with slots and per-section edit affordances, (c) build a state-driven CRD apply button, (d) build CRD versions of the four MUI flow dialogs (`ApplicationFormDialog`, `ApplicationSubmittedDialog`, `PreApplicationDialog`, `PreJoinParentDialog`), (e) build a CRD `CommunityGuidelinesBlock` with a nested "Read more" dialog, and (f) wire everything in the existing integration container, reusing existing domain hooks (`useApplicationButton`, `useDirectMessageDialog`, `useCommunityGuidelinesQuery`, `useApplyForEntryRoleOnRoleSetMutation`, `useInvitationActions`, `useBackWithDefaultUrl`) and the existing CRD `InvitationDetailDialog` for invitation acceptance. Routing is unchanged: `TopLevelRoutes.tsx` already toggles MUI ↔ CRD space routes based on `useCrdEnabled()`. Subspace About continues to render the legacy MUI dialog (L0-only scope per FR-024).

## Technical Context

**Language/Version**: TypeScript 5.x / React 19 / Node 24.14.0 (Volta-pinned)
**Primary Dependencies**: shadcn/ui (Radix UI + Tailwind CSS v4), `class-variance-authority`, `lucide-react`, Apollo Client (existing, unchanged), `yup` (already in deps; used standalone for form validation, no Formik in CRD), React Compiler (`babel-plugin-react-compiler`)
**Storage**: N/A (frontend SPA; data via existing GraphQL queries — no schema changes)
**Testing**: Vitest with jsdom (existing suite continues to pass)
**Target Platform**: Web SPA (Vite, localhost:3001, backend at localhost:3000)
**Project Type**: Web SPA — existing monorepo with established CRD layer
**Performance Goals**: Dialog interactive within 1 s of route navigation on typical broadband (SC-003); apply flow completes in <90 s for ≤5-question forms (SC-004)
**Constraints**: Zero MUI/Emotion in `src/crd/`; no GraphQL/domain/auth/router imports in `src/crd/`; integration layer (`src/main/crdPages/space/about/`) only renders MUI for the reused `directMessageDialog` (see Complexity Tracking); WCAG 2.1 AA; React Compiler compatible (no manual `useMemo`/`useCallback`/`React.memo`); `.crd-root` CSS scoping; props-only / event-handler-as-prop in CRD layer
**Scale/Scope**: 8 new CRD components, 1 modified CRD component, 6 i18n locale files extended, 1 rewritten integration page, 1 new connector (apply form + GraphQL), 1 new connector (invitation detail wrapping)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Status | Notes |
|---|-----------|--------|-------|
| I | Domain-Driven Frontend Boundaries | PASS | CRD components are presentational only; all business logic lives in `src/domain/` (existing hooks reused) and `src/main/crdPages/space/about/` (integration container) |
| II | React 19 Concurrent UX Discipline | PASS | No legacy lifecycle patterns; no manual memoization (React Compiler); Suspense already wraps the lazy-loaded page in `CrdSpaceRoutes.tsx`; mutations use Apollo's existing async patterns |
| III | GraphQL Contract Fidelity | PASS | Reuse existing generated hooks (`useSpaceAboutDetailsQuery`, `useCommunityGuidelinesQuery`, `useApplicationDialogQuery`, `useApplyForEntryRoleOnRoleSetMutation`, `useUserPendingMembershipsQuery`); no schema changes |
| IV | State & Side-Effect Isolation | PASS | CRD components hold visual-only state (open/close, expanded); side effects live in integration hooks under `src/domain/` and `src/main/crdPages/` |
| V | Experience Quality & Safeguards | PASS | FR-020 / FR-021 / FR-022 / SC-006 enforce WCAG 2.1 AA, keyboard operability, and mobile responsiveness; FR-019 / SC-007 enforce i18n in 6 languages |
| Arch 1 | Feature directory taxonomy | PASS | `src/crd/components/space/`, `src/crd/components/community/`, `src/main/crdPages/space/about/` — all within established taxonomy |
| Arch 2 | Styling standard (CRD vs MUI) | **VIOLATION (intentional, see Complexity Tracking)** | Tailwind via shadcn alongside MUI is the explicit migration policy. The integration layer also renders the existing MUI `DirectMessageDialog` because no CRD equivalent exists yet — same precedent as messaging/notifications in `CrdLayoutWrapper` |
| Arch 3 | i18n pipeline | PASS | New keys added to `src/crd/i18n/space/space.<lang>.json` (CRD-namespaced, manually managed); existing main-translation keys reused for shared copy (e.g., `context.L0.why.title`, `aboutDialog.applyNotSignedInHelperText`, `components.application-button.dialog-*`) |
| Arch 4 | Build determinism | PASS | No Vite config changes |
| Arch 5 | Import transparency | PASS | No barrel exports; explicit file paths everywhere |
| Arch 6 | SOLID / DRY | PASS | Each CRD component has a single responsibility (dialog chrome, view, apply button, guidelines, form, success, prompts); apply state machine extracted into the CRD button rather than duplicated across consumers; data hooks reused not duplicated |
| Eng 5 | Root cause analysis | PASS | No workarounds. The reused MUI `DirectMessageDialog` is acknowledged as a temporary stopgap (Assumption section in spec) until a CRD messaging dialog is built — not a fix masking another problem |

## Project Structure

### Documentation (this feature)

```text
specs/087-crd-space-about-dialog/
├── plan.md              # This file (/speckit.plan output)
├── spec.md              # Feature specification
├── research.md          # Phase 0: decisions confirmed during exploration
├── data-model.md        # Phase 1: CRD prop type definitions for new components
├── quickstart.md        # Phase 1: developer setup + manual test guide
├── contracts/           # Phase 1: component prop contracts (TypeScript-style)
└── checklists/
    └── requirements.md  # Spec quality checklist (created by /speckit.specify)
```

### Source Code (repository root)

This is a single web SPA. New and modified files live within the existing established structure.

```text
src/
├── crd/                                       # Presentational design system (no business logic, no MUI)
│   ├── components/
│   │   ├── space/
│   │   │   ├── SpaceAboutDialog.tsx           # NEW — shadcn dialog wrapper around SpaceAboutView
│   │   │   ├── SpaceAboutView.tsx             # MODIFY — add slots, level-aware titles, edit pencils, dual host position
│   │   │   ├── SpaceAboutApplyButton.tsx      # NEW — state-driven CRD apply button (forwardRef for "Learn why" link)
│   │   │   └── CommunityGuidelinesBlock.tsx   # NEW — guidelines composite + nested "Read more" dialog
│   │   ├── community/                         # NEW SUBDIR — apply/join flow dialogs (CRD)
│   │   │   ├── ApplicationFormDialog.tsx      # NEW — CRD apply/join form with question state + yup validation
│   │   │   ├── ApplicationSubmittedDialog.tsx # NEW — CRD success confirmation
│   │   │   ├── PreApplicationDialog.tsx       # NEW — CRD parent-application prompt
│   │   │   └── PreJoinParentDialog.tsx        # NEW — CRD parent-join prompt
│   │   └── dashboard/
│   │       └── InvitationDetailDialog.tsx     # REUSE EXISTING — no changes
│   └── i18n/space/
│       ├── space.en.json                      # MODIFY — extend about.*, add apply.*
│       ├── space.nl.json                      # MODIFY — mirror EN keys (English values until translated)
│       ├── space.es.json                      # MODIFY — mirror EN keys
│       ├── space.bg.json                      # MODIFY — mirror EN keys
│       ├── space.de.json                      # MODIFY — mirror EN keys
│       └── space.fr.json                      # MODIFY — mirror EN keys
│
├── main/crdPages/space/about/                 # Integration layer (CRD + MUI permitted only for reused legacy dialogs)
│   ├── CrdSpaceAboutPage.tsx                  # REWRITE — full integration: hooks, mappers, dialog wiring
│   ├── ApplyDialogConnector.tsx               # NEW — wraps CRD ApplicationFormDialog with useApplicationDialogQuery + apply mutation
│   └── InvitationDetailConnector.tsx          # NEW — wraps CRD InvitationDetailDialog with useInvitationActions + useInvitationHydrator (mirrors dashboard pattern)
│
├── domain/                                    # Untouched — hooks reused as-is
│   ├── access/ApplicationsAndInvitations/useApplicationButton.ts          # REUSE
│   ├── community/applicationButton/isApplicationPending.ts                # REUSE
│   ├── community/invitations/useInvitationActions.ts                      # REUSE
│   ├── community/pendingMembership/PendingMemberships.ts                  # REUSE (useInvitationHydrator)
│   ├── community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection.ts  # REUSE (getMessageType)
│   ├── communication/messaging/DirectMessaging/useDirectMessageDialog.tsx # REUSE — returns MUI dialog JSX rendered in portal
│   └── space/about/*.tsx                      # UNTOUCHED — legacy MUI dialog remains the toggle-off render path
│
├── core/apollo/generated/apollo-hooks.ts      # REUSE — useSpaceAboutDetailsQuery, useCommunityGuidelinesQuery, useApplicationDialogQuery, useApplyForEntryRoleOnRoleSetMutation
├── core/routing/useBackToPath.ts              # REUSE — useBackWithDefaultUrl
├── main/routing/urlBuilders.ts                # REUSE — buildSettingsUrl, buildLoginUrl, buildSignUpUrl
└── main/routing/TopLevelRoutes.tsx            # UNTOUCHED — already toggles MUI/CRD space routes via useCrdEnabled()
```

**Structure Decision**: Single Web SPA, three-layer architecture already established by 039 / 041 / 042 / 086:

1. **Presentation (CRD)** — `src/crd/components/space/`, `src/crd/components/community/`, `src/crd/i18n/space/`. Pure, no MUI, no GraphQL, no router.
2. **Integration (CRD pages)** — `src/main/crdPages/space/about/`. Wires hooks, maps GraphQL types to CRD props, manages flow-dialog open/close state. Renders the reused MUI `directMessageDialog` element from the `useDirectMessageDialog` hook (single permitted MUI element here, see Complexity Tracking).
3. **Domain & routing** — unchanged. The `TopLevelRoutes.tsx` toggle and the `CrdSpaceRoutes.tsx` `/about` route are already in place.

## Component Mapping: CRD ← MUI

| New / Modified CRD Component | Replaces (or extends) MUI Component | Notes |
|---|---|---|
| `SpaceAboutDialog.tsx` (new) | `src/domain/space/about/SpaceAboutDialog.tsx` (chrome only) | Wraps `SpaceAboutView` in a shadcn `Dialog`; sticky header with optional lock-tooltip slot; scrollable body |
| `SpaceAboutView.tsx` (modify) | `src/domain/space/about/SpaceAboutDialog.tsx` (body content) + `AboutDescription.tsx` (sections) + `AboutHeader.tsx` (header text) | Adds slots (join/contact/guidelines/lock), level-aware section titles, lucide section icons, edit pencils, dual host position |
| `SpaceAboutApplyButton.tsx` (new) | `src/domain/community/applicationButton/ApplicationButton.tsx` | State machine ported verbatim; renders one shadcn Button + helper text; ref-forwarded for "Learn why" lock-tooltip programmatic click |
| `CommunityGuidelinesBlock.tsx` (new) | `src/domain/community/community/CommunityGuidelines/CommunityGuidelinesBlock.tsx` + `CommunityGuidelinesInfoDialog.tsx` | Nested shadcn `Dialog` for "Read more"; uses `MarkdownContent` |
| `ApplicationFormDialog.tsx` (new) | `src/domain/community/applicationButton/ApplicationDialog.tsx` | shadcn dialog; native `<textarea>` per question; `yup` validation (continuous); submit disabled until valid |
| `ApplicationSubmittedDialog.tsx` (new) | `src/domain/community/applicationButton/ApplicationSubmittedDialog.tsx` | shadcn dialog; single Close button |
| `PreApplicationDialog.tsx` (new) | `src/domain/community/applicationButton/PreApplicationDialog.tsx` | shadcn dialog; Trans-interpolated title/body; CTA `<a href>` |
| `PreJoinParentDialog.tsx` (new) | `src/domain/community/applicationButton/PreJoinParentDialog.tsx` | shadcn dialog; Trans-interpolated title/body; CTA `<a href>` |
| `InvitationDetailDialog.tsx` (existing CRD) | `src/domain/community/invitations/InvitationDialog.tsx` | Already exists at `src/crd/components/dashboard/`; wired here for invitation acceptance branch |

## Complexity Tracking

> Constitution Arch 2 ("Styling: CRD design system for new pages") is intentionally violated by rendering the existing MUI `DirectMessageDialog` (returned by `useDirectMessageDialog`) inside the CRD integration layer. Justified below.

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Render MUI `DirectMessageDialog` from `src/main/crdPages/space/about/` | The host messaging UI exists only in MUI today. Building a CRD equivalent would expand scope to a separate messaging-system migration — out of scope for this feature. The MUI dialog renders in a portal outside `.crd-root`, so its styling does not leak. | Building a CRD `DirectMessageDialog` would more than double the surface area of this feature, and a CRD messaging system is itself a multi-week effort that should be planned and prioritized separately. The MUI dialog is acknowledged as a temporary stopgap in the spec assumptions; the boundary remains explicit (one named element, one named hook) and is auditable via `grep`. Same precedent: `CrdLayoutWrapper` reuses MUI messages/notifications dialogs the same way. |

## Phase 0: Outline & Research

**Status**: Complete. All "NEEDS CLARIFICATION" items from spec resolution have been answered (see [`spec.md` § Clarifications](./spec.md#clarifications)). No further research required for technical context.

The 5 clarifications resolved during `/speckit.clarify`:

1. **Mutation failure UX** → reuse the platform's existing toast/notification mechanism; originating flow surface stays open.
2. **Subspace About behavior with CRD on** → continue rendering legacy MUI subspace dialog (CRD About is L0-exclusive).
3. **Close destination for users without read privilege** → step browser history back two entries; fall back to platform Home if no prior history.
4. **Apply form validation timing** → continuous validation; submit button disabled until valid; per-field inline error text only after first submit attempt or after a blur with invalid content.
5. **Mid-session permission change re-evaluation** → on next user interaction or natural cache refresh; no polling, no focus-triggered re-fetch, no real-time subscription.

Additional research already documented in [`research.md`](./research.md): MUI source line ranges to port, existing CRD primitives inventory, dialog reference patterns (`CalloutDetailDialog`), pickColorFromId usage, accessibility patterns for nested Radix dialogs.

## Phase 1: Design & Contracts

**Outputs**:

- [`data-model.md`](./data-model.md) — TypeScript prop type definitions for all 8 new / 1 modified CRD components.
- [`contracts/crd-components.md`](./contracts/crd-components.md) — public component contracts (props in / events out / slot conventions).
- [`quickstart.md`](./quickstart.md) — developer setup, toggle steps, and manual test matrix derived from spec acceptance scenarios.

Agent context update will be applied via `.specify/scripts/bash/update-agent-context.sh claude` to add this feature's tech stack delta to `CLAUDE.md`.

## Post-Design Constitution Re-Check

Re-checked after data-model + contracts: **all gates still pass.** The single intentional violation (MUI `DirectMessageDialog` rendered from integration layer) remains documented in Complexity Tracking; no additional violations were introduced by Phase 1 design.
