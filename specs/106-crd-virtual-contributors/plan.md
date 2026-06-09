# Implementation Plan: CRD Virtual Contributors Migration

**Branch**: `106-crd-virtual-contributors` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/106-crd-virtual-contributors/spec.md`

## Summary

Close the remaining gaps in the VirtualContributor (VC) MUI → CRD migration so the whole VC area is consistent on the new design (default design version). The public profile, the three settings tabs, and the core invite dialog are already migrated; this feature delivers the rest, in priority order:

1. **Creation wizard (P1)** — rebuild the legacy modal `useVirtualContributorWizard` flow as a **full-page CRD experience**, reusing every existing GraphQL hook unchanged. *Dominant effort.*
2. **Knowledge Base (P2)** — promote the legacy `KnowledgeBaseDialog` (`DialogWithGrid`) to a **full-page CRD route** at `/vc/:nameId/knowledge-base`.
3. **Add-to-community (P2)** — wire the already-built `VirtualContributorInviteConnector` into the CRD community entry points, add the missing **preview step**, and retire the legacy invite dialogs.
4. **Admin config (P3)** — *scope reduced by discovery:* visibility, BoK management, prompt, and external-config cards are **already live** in the CRD settings tab. The only remaining surface is the **prompt graph (state-machine) editor** (FR-006).
5. **Cross-cutting (P3)** — create a CRD **VC badge** and render it on CRD contributor surfaces (comments); **VC notifications already render** via the generic CRD notification mapper (verify only).

**Technical approach:** Follow the established CRD 3-layer pattern exactly — pure presentational components in `src/crd/components/virtualContributor/`, integration pages + data hooks + mappers in `src/main/crdPages/topLevelPages/vcPages/`, route wiring in `CrdVCRoutes.tsx`/`TopLevelRoutes.tsx`. **No backend or GraphQL schema changes** — all data hooks are generated and reused (Constitution III).

## Technical Context

**Language/Version**: TypeScript 5.x, React 19 (React Compiler enabled — no manual `useMemo`/`useCallback`/`React.memo`)
**Primary Dependencies**: Apollo Client (generated hooks only); shadcn/ui + Tailwind v4 + Radix UI (`@/crd/primitives/*`); `lucide-react`; `react-i18next`; `class-variance-authority`; Formik + Yup (reused for wizard forms, decoupled from MUI); `date-fns` for any date formatting. **No new runtime dependencies** — the prompt-graph editor is built from existing CRD primitives (shadcn Accordion + custom property rows), no graph library.
**Storage**: N/A (frontend SPA). Client-side state via Apollo cache + local React state; file uploads via existing `MarkdownUploadScope` / `StorageConfigContextProvider`.
**Testing**: Vitest + jsdom; mapper unit tests + access-guard tests mirroring existing `vcProfileMapper.test.ts` / `useCanEditVcSettings.test.ts`.
**Target Platform**: Web SPA (Vite), browsers with >90% global support per CLAUDE.md.
**Project Type**: web (single frontend repo)
**Performance Goals**: Lazy-loaded routes (no bundle penalty for the unused MUI/CRD chunk); no added GraphQL round-trips beyond the legacy behavior.
**Constraints**: CRD layer purity (no `@mui/*`, `@emotion/*`, `@apollo/client`, `@/domain/*`, `react-router-dom`, Formik **inside `src/crd/`**); i18n for all strings; URL building via `@/main/routing/urlBuilders`; behavioral parity in CRD visual language (FR-017/SC-008).
**Scale/Scope**: ~5 work areas. Net-new CRD components: creation-wizard (full-page shell + step views + 3 sub-dialogs), KB page, prompt-graph card, add-VC preview, VC badge. Reused: ~15 generated GraphQL hooks, `useVirtualContributorWizard` orchestration logic, `VirtualContributorInviteConnector`, the generic notification mapper.

### Key discoveries from Phase 0 research (reshape the spec's effort estimate)

- **US4 is mostly done.** The live CRD settings tab (`VCSettingsTabView` + `useVcSettingsTabData`) already renders the visibility, Body-of-Knowledge, prompt, and external-config cards. FR-005 is satisfied **except** the prompt graph. Remaining US4 work = **prompt-graph editor card only** (FR-006).
- **US5 notifications already work.** The CRD notifications panel uses a single generic `notificationDataMapper` (not per-type views), so the two VC notification types already render. FR-008 work reduces to **verification** + an optional VC type badge.
- **KB route is already dispatched** in `CrdVCRoutes` but points at the **MUI** `VCKnowledgeBaseRoute`. The migration swaps that target for a CRD page.
- **Add-VC connector is already wired** into `CrdSpaceCommunityPage` + `CrdSpaceSettingsPage`; the **preview step has no CRD equivalent** — the preview is the real (and only) US3 gap.
- **Wizard launch points** (`DashboardWith/WithoutMemberships`, `CrdUserAccountTab`, `CrdOrgAccountTab`) currently render the MUI dialog inline via `useVirtualContributorWizard()`; they must switch to **navigating to the full-page route**.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|---|---|---|
| **I. Domain-Driven Boundaries** | Business logic stays in domain hooks (`useVirtualContributorWizard`, `useKnowledgeBase`, `useCommunityAdmin`, `useVirtualContributorsAdmin`) and integration hooks under `src/main/crdPages/`. CRD components are pure presentational. Mappers are the only GraphQL↔props seam. | ✅ Pass |
| **II. React 19 Concurrent UX** | Lazy routes behind `Suspense`; mutations use existing async patterns; explicit loading/empty/error states (FR-010). No legacy lifecycle patterns. | ✅ Pass |
| **III. GraphQL Contract Fidelity** | All data via generated hooks; **no `.graphql` changes anticipated**, so no codegen required. *Risk:* the CRD comment author payload may not expose `type`/`isVirtualContributor` for the VC badge — if a fragment field must be added, run `pnpm codegen` and commit outputs in the same PR. Flagged in research.md. | ✅ Pass (with watch-item) |
| **IV. State & Side-Effect Isolation** | Apollo cache + scoped React state; effects only in hooks. File uploads via existing scoped providers. | ✅ Pass |
| **V. Experience Quality** | WCAG 2.1 AA for all new interactive elements (wizard steps, KB, prompt-graph rows, badge); mapper + guard unit tests; sticky-chrome rule for retained dialogs. | ✅ Pass |
| **Arch Std #2 (CRD design system)** | New surfaces use shadcn/Tailwind; CRD purity rules enforced. | ✅ Pass |
| **Arch Std #5 (no barrel exports)** | Explicit file-path imports throughout. | ✅ Pass |

**No violations.** Complexity Tracking section omitted (nothing to justify).

## Project Structure

### Documentation (this feature)

```text
specs/106-crd-virtual-contributors/
├── plan.md              # This file
├── research.md          # Phase 0 — decisions (wizard form, KB page, prompt-graph, add-VC, badge, notifications)
├── data-model.md        # Phase 1 — entities + CRD prop shapes (no schema changes)
├── quickstart.md        # Phase 1 — how to build/run/test each area
├── contracts/           # Phase 1 — TypeScript prop interfaces for new CRD components
│   ├── creationWizard.ts
│   ├── knowledgeBase.ts
│   ├── promptGraph.ts
│   ├── addVcToCommunity.ts
│   └── vcBadge.ts
├── checklists/
│   └── requirements.md  # From /speckit.specify + /speckit.clarify
└── tasks.md             # Phase 2 — created by /speckit.tasks (NOT here)
```

### Source Code (repository root)

```text
src/crd/components/virtualContributor/            # EXISTING — pure presentational VC components
├── creationWizard/                               # NEW (US1)
│   ├── VCCreationWizardView.tsx                   # Full-page shell: step switch, header, footer
│   ├── VCCreationWizardView.types.ts
│   ├── steps/                                     # InitialStep, AddKnowledgeStep, ExistingSpaceStep,
│   │   └── *.tsx                                  #   ExternalProviderStep, ChooseCommunityStep, TryVcInfoStep
│   └── dialogs/                                   # CRD sub-dialogs (sticky-chrome rule)
│       ├── VCWizardCancelDialog.tsx
│       ├── VCExternalAIDialog.tsx (+ ComingSoon)
│       └── VCTryContributorDialog.tsx
├── knowledgeBase/                                 # NEW (US2)
│   └── VCKnowledgeBaseView.tsx (+ .types.ts)      # Page: header + refresh control + callouts slot + empty state
├── settings/
│   └── VCPromptGraphCard.tsx (+ .types.ts)        # NEW (US4) — accordion node editor, plugs into VCSettingsTabView
└── community/                                     # add-VC preview lives near the existing invite dialog
    └── VirtualContributorPreview.tsx (+ .types.ts) # NEW (US3)

src/crd/components/common/
└── VirtualContributorBadge.tsx (+ .types.ts)      # NEW (US5) — VC type indicator

src/crd/components/community/VirtualContributorInviteDialog.tsx  # EXISTING — extend with optional preview slot

src/main/crdPages/topLevelPages/vcPages/           # EXISTING — integration layer
├── CrdVCRoutes.tsx                                # MODIFY: KB → CRD page; add creation route mount if route-based
├── creationWizard/                                # NEW (US1)
│   ├── CrdVCCreationWizardPage.tsx                # Integration page
│   ├── useVcCreationWizard.ts                     # Wraps/relocates legacy useVirtualContributorWizard logic
│   └── vcCreationWizardMapper.ts
├── knowledgeBase/                                 # NEW (US2)
│   ├── CrdVCKnowledgeBasePage.tsx
│   ├── useVcKnowledgeBaseData.ts                  # Reuses useKnowledgeBase
│   └── vcKnowledgeBaseMapper.ts
└── settings/settings/                             # EXISTING — extend for prompt graph
    ├── useVcSettingsTabData.ts                    # MODIFY: surface promptGraph card props
    └── vcSettingsMapper.ts                        # MODIFY: map promptGraph + visibility flag

src/main/crdPages/space/dialogs/
├── VirtualContributorInviteConnector.tsx          # EXISTING — extend with preview; wire into CRD community surface
└── (wire-in at the CRD space community entry point)

src/crd/i18n/contributorSettings/                  # EXISTING namespace 'crd-contributorSettings'
└── contributorSettings.<lang>.json                # ADD keys: wizard.*, knowledgeBase.*, promptGraph.* (en+es+nl+bg+de+fr)
# VC badge + add-VC strings: extend 'crd-community' / 'crd-common' namespaces as appropriate

src/main/routing/TopLevelRoutes.tsx                # MODIFY only if creation wizard becomes a top-level route
```

**Structure Decision**: Reuse the existing VC CRD taxonomy verbatim (validated against the live profile/settings implementation). Net-new code clusters under `creationWizard/`, `knowledgeBase/`, the single `VCPromptGraphCard`, the add-VC `VirtualContributorPreview`, and the `VirtualContributorBadge`. The legacy MUI files stay in place (toggle-gated default), per the migration guide.

## Phasing & Dependencies (implementation order)

The five user stories are independently shippable. Recommended sequence — **true warm-up first, the two heavy components last**:

1. **US5 — VC badge + notification verification** (genuinely smallest, cross-cutting). Resolves the Constitution-III watch-item early (the comment-author VC-type field, which an audit confirmed is missing → needs a fragment field + `pnpm codegen`).
2. **US3 — add-to-community**. The connector is **already wired** into `CrdSpaceCommunityPage` + `CrdSpaceSettingsPage`; the only real gap is the **preview step** (+ confirm legacy dialogs are unreachable on CRD).
3. **US2 — Knowledge Base page** (full-page route; reuses `CalloutsGroupView` until it is itself CRD).
4. **US4 — prompt-graph card** (only 1 of 5 admin cards remains, but that card — the accordion node editor with editable property tables — is the **most complex single new component after the wizard**, *not* a warm-up). Sequenced just before the wizard.
5. **US1 — creation wizard** (largest; full-page rebuild + relocate launch points). Last because it is the biggest and benefits from patterns settled in 1–4.

> The MVP remains **US1** (the P1 story). This is a *risk/effort* execution order, not a priority reordering.

## Complexity Tracking

> No Constitution violations — section intentionally empty.
