# Implementation Plan: Global Administration in the CRD Design System

**Branch**: `105-crd-global-admin` | **Date**: 2026-06-08 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/105-crd-global-admin/spec.md`

## Summary

Recreate the entire MUI global administration area (`/admin` and all sub-routes) inside the CRD design system, gated by the existing per-user **Design Version** toggle. This is a **visual-only migration**: every CRD admin screen reuses the existing GraphQL data layer, hooks, validation, and authorization of the MUI admin (`src/domain/platformAdmin/` + `src/main/admin/`); only the presentation layer is new. The CRD admin lives under `src/main/crdPages/topLevelPages/admin/` (integration) and `src/crd/components/admin/` (presentation), reusing the proven CRD settings primitives (`SettingsShell`, `SettingsTabStrip`, `Table`, `ConfirmationDialog`, CRD form fields) already powering Space/User/Organization settings.

The work is delivered in 10 independently testable slices (one per user story). The foundational slice (US1) establishes the CRD admin shell, the section navigation (a horizontal CRD tab strip mirroring the MUI `adminTabs`), the access gate, the route/toggle wiring, and a new `crd-admin` i18n namespace. Each subsequent slice fills one admin section (Users, Organizations, Spaces, Global Roles, Innovation Packs/Hubs/VCs, Authorization Policies, Transfer & Conversions, Layout) with behavioral parity to MUI.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: shadcn/ui + Tailwind CSS v4 + Radix UI (CRD layer, via `@/crd/primitives/*`); Apollo Client (generated hooks only); `react-i18next`; `lucide-react`; `react-router-dom` (route wiring only, in `src/main`); `date-fns` (CRD/crdPages date formatting). **All existing — no new runtime dependencies.**
**Storage**: N/A (frontend SPA). Client-side state via Apollo `InMemoryCache`; admin lists reuse the MUI admin's existing query/refetch policies unchanged.
**Testing**: Vitest + jsdom + Testing Library (`pnpm vitest run`). Parity-focused component/integration tests per section.
**Target Platform**: Web SPA served by Vite; lazy-loaded route chunks (CRD admin chunk fetched only when design version = CRD).
**Project Type**: web (single SPA, three-layer CRD structure: `src/crd` design system → `src/main/crdPages` integration → `TopLevelRoutes` wiring).
**Performance Goals**: No regression vs MUI admin; CRD admin chunk lazy-loaded so MUI-version users incur zero bundle cost (matches existing toggle pattern).
**Constraints**: Zero `@mui/*` / `@emotion/*` imports in `src/crd/` and `src/main/crdPages/`; props are plain TS (never GraphQL types); all strings via `t()`; WCAG 2.1 AA; behavioral parity with MUI (data, actions, gating, confirmations, post-mutation refresh); MUI admin files remain untouched and remain the default for MUI-version users.
**Scale/Scope**: 10 admin sections, ~13+ routed pages (incl. user detail/edit, user email-change history, org create/edit), ~40 reused GraphQL operations, 9 global roles, 5 transfer + 2 conversion flows.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle / Standard | Status | Notes |
|---|---|---|
| **I. Domain-Driven Frontend Boundaries** | PASS | Business rules stay in `src/domain/platformAdmin/*` (reused as-is). CRD components are pure presentation; integration layer in `src/main/crdPages/topLevelPages/admin/` orchestrates domain hooks. No ad-hoc state shape introduced. |
| **II. React 19 Concurrent UX Discipline** | PASS | New components are pure; loading via Suspense/skeletons; mutations use existing hooks. No legacy lifecycle. No manual memoization (React Compiler). |
| **III. GraphQL Contract Fidelity** | PASS | Reuses existing generated hooks from `apollo-hooks.ts`. **No new GraphQL operations expected** → no codegen needed. Component props are plain TS, never generated types (mappers convert at the seam). If any field is found missing during build, add a fragment + run `pnpm codegen` (flagged as a risk, not a planned step). |
| **IV. State & Side-Effect Isolation** | PASS | Persistent state in Apollo cache; effects confined to hooks; routing/toggle funnel through existing `useCrdEnabled` + `TopLevelRoutes`. URLs via `@/main/routing/urlBuilders`. |
| **V. Experience Quality & Safeguards** | PASS | WCAG 2.1 AA enforced in CRD; every section/action gets parity tests (FR-097); destructive actions via `ConfirmationDialog` (FR-090). |
| **Arch #2 (CRD design system)** | PASS | New pages use CRD; MUI admin untouched until toggle removal (out of scope). |
| **Arch #3 (i18n)** | PASS | New `crd-admin` namespace (manually/AI-maintained, all 6 langs, not Crowdin) per CRD i18n rules. No hardcoded strings. |
| **Arch #5 (no barrel exports)** | PASS | Explicit file-path imports only. |
| **Arch #6 (SOLID)** | PASS | SRP: data hooks vs mappers vs presentational components separated per tab. OCP: section navigation is config-driven (`adminTabs`-equivalent descriptor list). ISP: each CRD component takes a minimal, focused prop type. DIP: components depend on callback/prop abstractions, not Apollo. DRY: one shared `CrdAdminSearchableTable` + one shared `AdminShell` reused across all list sections. |
| **Workflow #5 (Root cause before fixes)** | PASS | Parity is verified against MUI behavior; no `fetchPolicy`/workaround band-aids — reuse existing policies. |

**Result**: PASS. No violations. Complexity Tracking section not required.

## Project Structure

### Documentation (this feature)

```text
specs/105-crd-global-admin/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output (entity → CRD prop-type view models)
├── quickstart.md        # Phase 1 output (how to build/verify one section)
├── contracts/           # Phase 1 output (component prop contracts + reused GraphQL op list)
│   ├── admin-shell.contract.ts
│   ├── admin-searchable-table.contract.ts
│   ├── section-contracts.md
│   └── reused-graphql-operations.md
└── checklists/
    └── requirements.md  # Spec quality checklist (already created)
```

### Source Code (repository root)

```text
# ── CRD presentation layer (pure, no MUI, plain-TS props) ──
src/crd/
├── components/admin/
│   ├── AdminShell.tsx                 # NEW: page-title header + horizontal section tab strip + body slot
│   ├── AdminSearchableTable.tsx       # NEW: generic searchable/paginated table (Name + custom cols + row actions + delete-confirm)
│   ├── columns/                        # NEW: reusable cell renderers (ListedInStore, SearchVisibility, AccountOwner, VisibilityChip)
│   ├── users/                          # NEW: presentational pieces (UserEditForm fields, EmailChangeHistoryView, ChangeEmailDialog body)
│   ├── organizations/                  # NEW: OrganizationForm fields, VerificationToggle
│   ├── roles/                          # NEW: RoleMembersEditor (current members + available-users picker) — reuses UserSelector
│   ├── licensePlans/                   # NEW: ManageLicensePlans view (assign + active-plans table)
│   ├── authorizationPolicies/          # NEW: policy lookup + rules display + per-user privileges
│   └── transfer/                       # NEW: transfer/conversion section UIs + AccountPicker UI (reuses ContributorSelector)
└── i18n/admin/
    └── admin.en.json (+ nl, es, bg, de, fr)   # NEW namespace 'crd-admin'

# ── Integration layer (Apollo + mappers; no MUI) ──
src/main/crdPages/topLevelPages/admin/
├── CrdAdminRoutes.tsx                  # NEW: CRD admin route tree (sections + sub-routes), wrapped by CrdLayoutWrapper
├── CrdAdminShellPage.tsx               # NEW: renders AdminShell, computes active section from URL, gates access
├── useAdminAccessGuard.ts             # NEW: PlatformAdmin privilege gate (parity with NonPlatformAdminRedirect)
├── adminSections.ts                   # NEW: section descriptor list (id, path, labelKey, lucide icon) — CRD twin of adminTabs
├── spaces/   { CrdAdminSpacesPage.tsx, spaceListMapper.ts }
├── users/    { CrdAdminUsersPage.tsx, CrdAdminUserPage.tsx, CrdAdminUserEmailHistoryPage.tsx, *Mapper.ts }
├── organizations/ { CrdAdminOrganizationsPage.tsx, CrdAdminOrganizationFormPage.tsx, *Mapper.ts }
├── innovationPacks/  { CrdAdminInnovationPacksPage.tsx, mapper.ts }
├── innovationHubs/   { CrdAdminInnovationHubsPage.tsx, mapper.ts }
├── virtualContributors/ { CrdAdminVirtualContributorsPage.tsx, mapper.ts }
├── authorization/    { CrdAdminGlobalRolesPage.tsx, mapper.ts }
├── authorizationPolicies/ { CrdAdminAuthorizationPoliciesPage.tsx, mapper.ts }
├── transfer/         { CrdAdminTransferPage.tsx, sections... }
└── layout/           { CrdAdminLayoutPage.tsx }

# ── Reused, unchanged ──
src/domain/platformAdmin/**            # All data hooks/queries/mutations reused as-is
src/main/admin/NonPlatformAdminRedirect.tsx  # Reference for the CRD access guard
src/core/apollo/generated/apollo-hooks.ts    # Existing generated hooks (no codegen expected)

# ── Wiring ──
src/main/routing/TopLevelRoutes.tsx    # EDIT: at the /admin/* route, dispatch crdEnabled ? <CrdAdminRoutes/> : <PlatformAdminRoute/>
src/core/i18n/config.ts                # EDIT: register 'crd-admin' in crdNamespaceImports
@types/i18next.d.ts                    # EDIT: register 'crd-admin' resource types

# ── Tests ──
src/main/crdPages/topLevelPages/admin/**/__tests__/   # NEW: per-section parity tests
src/crd/components/admin/**/__tests__/                 # NEW: presentational component tests
```

**Structure Decision**: Standard three-layer CRD structure already used by every migrated page. Presentation lives in `src/crd/components/admin/`; the GraphQL↔props seam (mappers) and data orchestration live in `src/main/crdPages/topLevelPages/admin/`; the MUI↔CRD selection happens once in `TopLevelRoutes.tsx` at the `/admin/*` route. The MUI admin (`src/domain/platformAdmin/`) is reused for data and left untouched as the MUI-version default.

## Key Design Decisions

1. **Shell**: Add a dedicated `AdminShell` (not the avatar-centric `SettingsShell`). The admin is platform-wide, so the header is a page title ("Administration") rather than an entity avatar. The horizontal section navigation **reuses `SettingsTabStrip`** (config-driven, scroll-on-mobile, a11y `role="tablist"`) — the same primitive Space/User/Org settings use — fed by a CRD `adminSections` descriptor list (the twin of MUI `adminTabs`).
2. **Tables**: One generic `CrdAdminSearchableTable` (the CRD twin of MUI `AdminSearchableTable`) supports both server-paginated (Users, Orgs) and client-side "show more" (Spaces, Packs, Hubs, VCs) modes, custom columns, per-row actions, and delete-with-`ConfirmationDialog`. This single component backs all six list sections (DRY/SRP).
3. **Reused cell renderers**: `ListedInStore`, `SearchVisibility`, `AccountOwner`, `VisibilityChip` ported as CRD `Badge`-based renderers.
4. **License plans**: One `ManageLicensePlans` CRD view reused by Spaces, Users, and Organizations (all three manage account license plans).
5. **Role membership + account/user pickers**: reuse `UserSelector` / `ContributorSelector` from `src/crd/forms/`.
6. **Confirmations**: every destructive action routes through `ConfirmationDialog` (`variant="destructive"`); edit forms with unsaved input use `useDialogCloseGuard`.
7. **Data layer untouched**: integration pages call the existing `src/domain/platformAdmin/` hooks; mappers convert results to plain-TS view models. No GraphQL changes anticipated → no codegen.
8. **Toggle/routing**: a single conditional at `/admin/*` in `TopLevelRoutes.tsx`; CRD branch wrapped in `CrdLayoutWrapper` (CRD shell), MUI branch unchanged.

## Phasing (maps to spec user stories)

- **Phase A (US1, P1)**: `AdminShell` + `adminSections` + `useAdminAccessGuard` + `CrdAdminRoutes` + toggle wiring + `crd-admin` namespace + empty section placeholders. Independently shippable.
- **Phase B (US2–US4, P1)**: Users, Organizations, Spaces — incl. `CrdAdminSearchableTable`, `ManageLicensePlans`, edit/create forms, email-change/history, verification toggle.
- **Phase C (US5–US6, P2)**: Global Roles; Innovation Packs / Hubs / Virtual Contributors.
- **Phase D (US7–US9, P3)**: Authorization Policies; Transfer & Conversions; Layout placeholder.

Each phase is independently testable and leaves the app shippable (toggle-gated; MUI default intact).

## Risks & Mitigations

| Risk | Mitigation |
|---|---|
| A reused query returns a shape needing an extra field for the CRD view | Prefer mapping existing fields; only if truly missing, add a fragment + `pnpm codegen` in the same PR (constitution III). Flagged, not planned. |
| MUI admin uses `RemoveModal`/MUI dialogs whose exact copy must match | Port copy into `crd-admin` i18n; verify via parity tests (SC-006). |
| Server-paginated vs client-side "show more" parity | `CrdAdminSearchableTable` supports both modes explicitly (mirrors MUI `AdminSearchableTable.clientSide`). |
| Role-gated actions (global-admin-only email change) leaking to non-admins | Reuse the same privilege checks in the integration layer; cover with gating tests (SC-004). |
| Large surface → scope creep | Strict phase boundaries; only replicate existing MUI behavior (no redesign / new capability). |

## Complexity Tracking

*No constitution violations — section intentionally empty.*
