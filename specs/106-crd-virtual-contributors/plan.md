# Implementation Plan: CRD Virtual Contributors Migration

**Branch**: `106-crd-virtual-contributors` | **Date**: 2026-06-09 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/106-crd-virtual-contributors/spec.md`

## Summary

Close the remaining gaps in the VirtualContributor (VC) MUI → CRD migration so the whole VC area is consistent on the new design (default design version). The public profile, the three settings tabs, and the core invite dialog are already migrated; this feature delivers the rest, in priority order:

1. **Creation wizard (P1)** — rebuild the legacy modal `useVirtualContributorWizard` flow as a **CRD dialog** (the CRD equivalent of the legacy modal), reusing every existing GraphQL hook unchanged. *Dominant effort.*
2. **Knowledge Base (P2)** — promote the legacy `KnowledgeBaseDialog` (`DialogWithGrid`) to a **full-page CRD route** at `/vc/:nameId/knowledge-base`.
3. **Add-to-community (P2)** — wire the already-built `VirtualContributorInviteConnector` into the CRD community entry points, add the missing **preview step**, and retire the legacy invite dialogs.
4. **Admin config (P3)** — *scope reduced by discovery:* visibility, BoK management, prompt, and external-config cards are **already live** in the CRD settings tab. The only remaining surface is the **prompt graph (state-machine) editor** (FR-006).
5. **Cross-cutting (P3)** — create a CRD **VC badge** and render it on CRD contributor surfaces (comments); **VC notifications already render** via the generic CRD notification mapper (verify only).
6. **Standalone demo coverage (P3)** — add a demo page per migrated VC surface to the standalone CRD preview app (`src/crd/app/`) backed by **hardcoded mock Virtual Contributors**, mirroring the existing `VCProfileDemoPage` + `MOCK_VC_DATASYNTH` pattern, so each surface can be iterated on backend-free via `pnpm crd:dev`.

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
**Scale/Scope**: ~5 work areas. Net-new CRD components: creation-wizard (dialog shell + step views + sub-dialogs), KB page, prompt-graph card, add-VC preview, VC badge. Reused: ~15 generated GraphQL hooks, `useVirtualContributorWizard` orchestration logic, `VirtualContributorInviteConnector`, the generic notification mapper.

### Key discoveries from Phase 0 research (reshape the spec's effort estimate)

- **US4 is mostly done.** The live CRD settings tab (`VCSettingsTabView` + `useVcSettingsTabData`) already renders the visibility, Body-of-Knowledge, prompt, and external-config cards. FR-005 is satisfied **except** the prompt graph. Remaining US4 work = **prompt-graph editor card only** (FR-006).
- **US5 notifications already work.** The CRD notifications panel uses a single generic `notificationDataMapper` (not per-type views), so the two VC notification types already render. FR-008 work reduces to **verification** + an optional VC type badge.
- **KB route is already dispatched** in `CrdVCRoutes` but points at the **MUI** `VCKnowledgeBaseRoute`. The migration swaps that target for a CRD page.
- **Add-VC connector is already wired** into `CrdSpaceCommunityPage` + `CrdSpaceSettingsPage`; the **preview step has no CRD equivalent** — the preview is the real (and only) US3 gap.
- **Wizard launch points** (`DashboardWith/WithoutMemberships`, `CrdUserAccountTab`, `CrdOrgAccountTab`) currently render the MUI dialog inline via `useVirtualContributorWizard()`; they switch to **opening the CRD `CrdVCCreationWizardDialog`** (local open state; account passed directly).

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
├── CrdVCRoutes.tsx                                # MODIFY: KB → CRD page (the wizard is a dialog, no route)
├── creationWizard/                                # NEW (US1)
│   ├── CrdVCCreationWizardDialog.tsx              # Controlled dialog connector { open, onClose, account?, accountName? }
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

src/crd/app/                                       # EXISTING — standalone preview app (mock data, no backend); the ONLY crd/ dir allowed to use react-router-dom
├── data/
│   └── virtualContributors.ts                     # NEW (US6) — hardcoded mock VCs: wizard selectable spaces + created VC, KB items, prompt-graph nodes, add-VC preview/available list, badge
├── pages/
│   ├── VCProfileDemoPage.tsx                       # EXISTING — reference pattern (uses MOCK_VC_DATASYNTH)
│   ├── VCCreationWizardDemoPage.tsx                # NEW (US6) — trigger button opens the wizard dialog, all 3 paths + sub-dialogs, local step state
│   ├── VCKnowledgeBaseDemoPage.tsx                 # NEW (US6) — populated + empty + authorized-refresh variants
│   ├── VCAddToCommunityDemoPage.tsx                # NEW (US6) — VirtualContributorInviteDialog + VirtualContributorPreview, search→preview→confirm
│   └── VCAdminConfigDemoPage.tsx                   # NEW (US6) — VCPromptGraphCard (system read-only / user editable); + VC badge showcase
├── CrdApp.tsx                                      # MODIFY (US6): register the 4 new demo routes + add "(preview)" nav entries
└── main.tsx                                        # MODIFY (US6): eagerly load 'crd-contributorSettings' + 'crd-community' namespaces (EN) — not currently loaded

src/main/crdPages/dashboard/DashboardWithoutMemberships.tsx                           # MODIFY: open CrdVCCreationWizardDialog (current-user account)
src/main/crdPages/dashboard/DashboardWithMemberships.tsx                              # MODIFY: open CrdVCCreationWizardDialog (current-user account)
src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab.tsx       # MODIFY: open CrdVCCreationWizardDialog (pass user account)
src/main/crdPages/topLevelPages/organizationPages/settings/account/CrdOrgAccountTab.tsx # MODIFY: open CrdVCCreationWizardDialog (pass org account)
#   The wizard is a dialog opened in-place from each launch point — no route, no URL builder, no settings-route mount.
#   urlBuilders.ts, the settings route trees, and TopLevelRoutes.tsx are unchanged for the wizard.
```

**Structure Decision**: Reuse the existing VC CRD taxonomy verbatim (validated against the live profile/settings implementation). Net-new code clusters under `creationWizard/`, `knowledgeBase/`, the single `VCPromptGraphCard`, the add-VC `VirtualContributorPreview`, and the `VirtualContributorBadge`. The legacy MUI files stay in place (toggle-gated default), per the migration guide.

## Phasing & Dependencies (implementation order)

The user stories are independently shippable. US6 (standalone demo coverage) depends only on the **pure CRD components** of US1–US5 existing — not on their integration layers — so each surface's demo page can land alongside (or immediately after) that surface's Layer-3 component. Recommended sequence — **true warm-up first, the two heavy components last**:

1. **US5 — VC badge + notification verification** (genuinely smallest, cross-cutting). Resolves the Constitution-III watch-item early (the comment-author VC-type field, which an audit confirmed is missing → needs a fragment field + `pnpm codegen`).
2. **US3 — add-to-community**. The connector is **already wired** into `CrdSpaceCommunityPage` + `CrdSpaceSettingsPage`; the only real gap is the **preview step** (+ confirm legacy dialogs are unreachable on CRD).
3. **US2 — Knowledge Base page** (full-page route; reuses `CalloutsGroupView` until it is itself CRD).
4. **US4 — prompt-graph card** (only 1 of 5 admin cards remains, but that card — the accordion node editor with editable property tables — is the **most complex single new component after the wizard**, *not* a warm-up). Sequenced just before the wizard.
5. **US1 — creation wizard** (largest; dialog rebuild + rewire launch points). Last because it is the biggest and benefits from patterns settled in 1–4.

> The MVP remains **US1** (the P1 story). This is a *risk/effort* execution order, not a priority reordering.

## Complexity Tracking

> No Constitution violations — section intentionally empty.

## Addendum — Knowledge Base callout restrictions (US7)

*Added 2026-06-10, after the KB "Add callout" capability landed (extends US2).*

**Problem.** The KB page now opens the shared CRD `CalloutFormConnector` to create callouts, but that dialog exposes the full callout feature set (6 framing chips, 4 response types, framing + contribution comment toggles, rich-media upload). A VC's knowledge base supports none of: comments, whiteboard/memo/document/CTA/media-gallery framing, or memo/whiteboard responses. MUI already constrains this via `CalloutRestrictions` (`src/domain/collaboration/callout/CalloutRestrictionsTypes.ts` + `virtualContributorsCalloutRestrictions.ts`); CRD must reach parity (FR-021..FR-024 / SC-010).

**Approach — copy the concept to CRD as an integration-layer descriptor + optional pure-component props.** Contract: `contracts/calloutRestrictions.ts`.

- **Descriptor (integration layer):** `CrdCalloutRestrictions` (allow-lists + visibility flags) and a `VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS` preset, in `src/main/crdPages/space/callout/calloutRestrictions.ts`. Expressed in CRD chip vocabulary (clearer than MUI's partial flag bag, which does not actually force None-only framing). Absent descriptor ⇒ unchanged full feature set (no regression — FR-021).
- **Pure CRD components gain optional props only (Constitution I / FR-024):** `FramingChipStrip` + `allowedChips?: FramingChipId[]`; `ResponseTypeChipStrip` + `allowedChips?: ResponseTypeChipId[]`; `ResponsePanel` + `showContributionComments?: boolean`. No business logic enters `src/crd/`.
- **Form defaults:** `useCrdCalloutForm` accepts `initialOverrides?: Partial<CalloutFormValues>` (merged into initial state + `reset`), mirroring MUI `CalloutForm`'s `commentsEnabled` seeding — so the *hidden* comment toggles submit `false` (FR-023).
- **Connector wiring (`CalloutFormConnector`):** new optional `restrictions?` prop → seed form overrides; hide the framing strip + editor when `allowedFramingChips` is `[]`; pass `allowedChips` to both strips; pass `showContributionComments` to `ResponsePanel`; render `AllowCommentsField` only when framing comments are allowed; apply `disableRichMedia` to the description editor. **Chip allow-lists apply in create mode only** (edit-mode strips stay locked + unfiltered so an existing callout's type is never hidden); comment toggles are hidden in both modes.
- **Consumer:** `CrdVCKnowledgeBasePage` passes `restrictions={VC_KNOWLEDGE_BASE_CALLOUT_RESTRICTIONS}` to its `CalloutFormConnector`.
- **Templates (FR-023):** hiding/filtering the UI controls is not enough — the "Find Template" picker and the active flow state's default template both `prefill()` arbitrary form values that could reintroduce a disallowed framing/response type or re-enable comments. A `clampFormValuesToRestrictions(values, restrictions)` helper sanitizes **create-mode** template prefills (disallowed framing/response → `'none'`, comment flags → `false`), mirroring the MUI seam `mapCalloutTemplateToCalloutForm(template, calloutRestrictions)`. Edit-mode prefill of an existing callout is **not** clamped (its stored settings are authoritative).

**No backend/GraphQL changes** (Constitution III) — purely presentational gating of an existing create flow. **Tests:** extend `FramingChipStrip`/`ResponseTypeChipStrip` unit tests for `allowedChips`; assert a restricted submit yields framing None + comments off; confirm the unrestricted space-tab create dialog is unchanged.
