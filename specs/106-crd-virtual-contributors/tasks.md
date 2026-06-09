# Tasks: CRD Virtual Contributors Migration

**Input**: Design documents from `/specs/106-crd-virtual-contributors/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: The spec does not request TDD. Per the established VC CRD pattern, only **mapper unit tests** and **access-guard tests** are included (mirroring `vcProfileMapper.test.ts` / `useCanEditVcSettings.test.ts`). No broad test scaffolding.

**Organization**: Tasks are grouped by user story. Stories are independent and individually shippable. Spec priority order is US1(P1) → US2(P2) → US3(P2) → US4(P3) → US5(P3); the **recommended execution order is warm-up-first, heavy-components-last** (US5 → US3 → US2 → US4 → US1) per plan.md — see Implementation Strategy. (US4's remaining prompt-graph card is complex, not a warm-up; the wizard is largest, so both go last.)

## Path & layer conventions (all stories)

- **Layer 3 (pure presentational)**: `src/crd/components/virtualContributor/**`, `src/crd/components/common/**` — no `@mui/*`, `@apollo/client`, `@/domain/*`, `react-router-dom`, `formik`; plain-TS props; `lucide-react` icons; `cn()` + Tailwind; `useTranslation('crd-…')`.
- **Layer 2 (integration)**: `src/main/crdPages/topLevelPages/vcPages/**`, `src/main/crdPages/space/dialogs/**` — Apollo hooks + mappers; no `@mui/*`/`@emotion/*`.
- **Routing**: `src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx`, `src/main/routing/TopLevelRoutes.tsx`, `src/main/routing/urlBuilders.ts`.
- **i18n**: namespace `crd-contributorSettings` (`src/crd/i18n/contributorSettings/*.json`, 6 languages: en, es, nl, bg, de, fr); badge/add-VC strings extend `crd-community`/`crd-common`.
- **No new runtime deps.** React Compiler on (no manual memoization). "Virtual Contributor" stays English (glossary).

---

## Phase 1: Setup (orientation — no shared code to scaffold)

**Purpose**: Confirm the environment and the existing seams the migration plugs into.

- [ ] T001 Confirm CRD is active for local testing and the VC area renders CRD: `localStorage.setItem('alkemio-design-version','2')`, then load `/vc/<id>` and `/vc/<id>/settings/settings`; confirm `crdEnabled ? <CrdVCRoutes/> : <VCRoute/>` dispatch in `src/main/routing/TopLevelRoutes.tsx` (~line 254).
- [ ] T002 [P] Re-read the reference implementation to mirror conventions: `src/main/crdPages/topLevelPages/vcPages/settings/profile/{CrdVCProfileTab.tsx,useVcProfileTabData.ts,vcProfileMapper.ts}` and `src/crd/components/virtualContributor/settings/VCSettingsTabView.tsx`.

---

## Phase 2: Foundational (no blocking shared code)

**Purpose**: The CRD foundation (route dispatch, 3-layer pattern, `crd-contributorSettings` namespace registration in `src/core/i18n/config.ts` + `@types/i18next.d.ts`, `pickColorFromId`, typography tokens, sticky-dialog rule) already exists. No new shared infrastructure is required before stories begin.

- [ ] T003 Verify the `crd-contributorSettings` namespace is registered and editable in all 6 language files under `src/crd/i18n/contributorSettings/` (new keys for each story are added within that story's i18n task).

**Checkpoint**: Foundation confirmed — user stories can proceed in any order (they touch disjoint files).

---

## Phase 3: User Story 1 — Create a Virtual Contributor (Priority: P1) 🎯 MVP

**Goal**: Rebuild the legacy modal wizard as a full-page CRD experience launched from every CRD surface, reusing all GraphQL hooks. Contract: `contracts/creationWizard.ts`.

**Independent test**: With CRD active, launch "Create Virtual Contributor" from the CRD dashboard and the user/org account tab; complete every path (written-knowledge, existing-space, external) end-to-end to a created VC, exercising cancel/external-AI/try-VC sub-dialogs — zero MUI styling (SC-001).

### Layer 3 — presentational (pure)

- [ ] T004 [P] [US1] Add prop types in `src/crd/components/virtualContributor/creationWizard/VCCreationWizardView.types.ts` from `contracts/creationWizard.ts` (step machine, values, view props, sub-dialog props).
- [ ] T005 [US1] Build the full-page shell `src/crd/components/virtualContributor/creationWizard/VCCreationWizardView.tsx` (header, step switch, footer with Back/Next/Create — page scroll, not dialog).
- [ ] T006 [P] [US1] Build initial step `src/crd/components/virtualContributor/creationWizard/steps/InitialStep.tsx` (name/tagline/description/avatar + 3 path cards).
- [ ] T007 [P] [US1] Build add-knowledge step `.../steps/AddKnowledgeStep.tsx` with post rows (`PostItem`) and document rows (`DocumentItem`) — add/remove, validation display.
- [ ] T008 [P] [US1] Build existing-space step `.../steps/ExistingSpaceStep.tsx` (select space/subspace as Body of Knowledge; `pickColorFromId` fallbacks).
- [ ] T009 [P] [US1] Build choose-community + try-VC-info steps `.../steps/ChooseCommunityStep.tsx` and `.../steps/TryVcInfoStep.tsx` (+ `LoadingStep`).
- [ ] T010 [P] [US1] Build sub-dialog `.../dialogs/VCWizardCancelDialog.tsx` (confirm discard; sticky-chrome).
- [ ] T011 [P] [US1] Build sub-dialog `.../dialogs/VCExternalAIDialog.tsx` + nested coming-soon request form (sticky-chrome).
- [ ] T012 [US1] DESCOPED — the interactive "try the VC" demo (`TryVirtualContributorDialog`) is launched from the **space dashboard** (`src/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardView.tsx`), **not** the creation wizard; it is out of scope for US1 (a space-page concern). The wizard's final step is the info step `TryVcInfoStep` (built in T009). No implementation in this task.

### Layer 2 — integration (reuse GraphQL hooks unchanged)

- [ ] T013 [US1] Create `src/main/crdPages/topLevelPages/vcPages/creationWizard/useVcCreationWizard.ts` by relocating the step machine + all data calls from `src/main/topLevelPages/myDashboard/newVirtualContributorWizard/useVirtualContributorWizard.tsx` (reuse `useCreateVirtualContributorOnAccountMutation`, `useNewVirtualContributorMySpacesQuery`, `useAllSpaceSubspacesLazyQuery`, `useUploadVisualMutation`, `useCreateSpaceMutation`, `useRefreshBodyOfKnowledgeMutation`, `useCreateLinkOnCalloutMutation`, `useAssignRoleToVirtualContributorMutation`, `useSubspaceCommunityAndRoleSetIdLazyQuery`, `useSpaceAboutBaseLazyQuery`, Formik/Yup schemas); swap `DialogWithGrid` shell for page rendering.
- [ ] T014 [P] [US1] Create `src/main/crdPages/topLevelPages/vcPages/creationWizard/vcCreationWizardMapper.ts` (GraphQL spaces/communities/createdVc → `VcWizardSelectableSpace[]`/`VcWizardCreatedVc`).
- [ ] T015 [US1] Create integration page `src/main/crdPages/topLevelPages/vcPages/creationWizard/CrdVCCreationWizardPage.tsx` (reads target account from route state/query, scopes avatar upload via `StorageConfigContextProvider`, renders `VCCreationWizardView`).

### Routing & launch points

- [ ] T016 [US1] Add `buildCreateVirtualContributorUrl(accountId?, name?)` to `src/main/routing/urlBuilders.ts`.
- [ ] T017 [US1] Mount the full-page route (lazy + `Suspense` + `WithApmTransaction`, wrapped in `CrdLayoutWrapper`) in `src/main/crdPages/topLevelPages/vcPages/CrdVCRoutes.tsx` (or `TopLevelRoutes.tsx` if top-level), guarded so only account-privileged users reach it.
- [ ] T018 [US1] Switch the four CRD launch points from inline `{virtualContributorWizard}` to `navigate(buildCreateVirtualContributorUrl(...))`: `src/main/crdPages/dashboard/DashboardWithoutMemberships.tsx`, `.../DashboardWithMemberships.tsx`, `src/main/crdPages/topLevelPages/userPages/settings/account/CrdUserAccountTab.tsx`, `.../organizationPages/settings/account/CrdOrgAccountTab.tsx`.

### i18n & tests

- [ ] T019 [P] [US1] Add `wizard.*` keys (steps, fields, paths, sub-dialogs, errors, success/cancel) to all 6 `src/crd/i18n/contributorSettings/contributorSettings.<lang>.json`.
- [ ] T020 [P] [US1] Add `vcCreationWizardMapper.test.ts` next to the mapper (space/community/createdVc mapping + null safety).

**Checkpoint**: US1 independently shippable — VC creation is fully CRD from all launch points.

---

## Phase 4: User Story 2 — Browse a VC's Knowledge Base (Priority: P2)

**Goal**: Promote the legacy `KnowledgeBaseDialog` to a full-page CRD route at `/vc/:nameId/knowledge-base`. Contract: `contracts/knowledgeBase.ts`.

**Independent test**: With CRD active, open a VC's Knowledge Base from the profile and via deep link; confirm listing, empty state, and (authorized) refresh/description controls render in CRD (SC-002).

- [ ] T021 [P] [US2] Add prop types `src/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView.types.ts` from `contracts/knowledgeBase.ts`.
- [ ] T022 [US2] Build `src/crd/components/virtualContributor/knowledgeBase/VCKnowledgeBaseView.tsx` (identity header, editable description, refresh control + last-updated, empty state, `calloutsSlot`).
- [ ] T023 [US2] Research+confirm `CalloutsGroupView` renders acceptably under `.crd-root`; add a thin CRD adapter only if needed (record finding in PR). Reuse restrictions from `src/domain/community/virtualContributor/knowledgeBase/virtualContributorsCalloutRestrictions.ts`.
- [ ] T024 [P] [US2] Create `src/main/crdPages/topLevelPages/vcPages/knowledgeBase/vcKnowledgeBaseMapper.ts` (VC + KB GraphQL → `VcKnowledgeBaseViewProps`; `pickColorFromId`, last-updated ISO).
- [ ] T025 [US2] Create data hook `src/main/crdPages/topLevelPages/vcPages/knowledgeBase/useVcKnowledgeBaseData.ts` reusing `useKnowledgeBase` (`useVirtualContributorKnowledgeBaseQuery`, `useVirtualContributorKnowledgePrivilegesQuery`, `useVirtualContributorKnowledgeBaseLastUpdatedQuery`, `useUpdateVirtualContributorMutation`, `useRefreshBodyOfKnowledgeMutation`).
- [ ] T026 [US2] Create integration page `src/main/crdPages/topLevelPages/vcPages/knowledgeBase/CrdVCKnowledgeBasePage.tsx` and **repoint** the `/vc/:nameId/knowledge-base` route in `CrdVCRoutes.tsx` from the MUI `VCKnowledgeBaseRoute` to this CRD page.
- [ ] T027 [P] [US2] Add `knowledgeBase.*` keys (title, description, refresh, last-updated, empty state) to all 6 `contributorSettings.<lang>.json`.
- [ ] T028 [P] [US2] Add `vcKnowledgeBaseMapper.test.ts` (privilege-gated controls, empty vs populated, timestamp formatting).

**Checkpoint**: US2 independently shippable — KB is a CRD page reachable from profile + deep link.

---

## Phase 5: User Story 3 — Add an existing VC to a community (Priority: P2)

**Goal**: Wire the existing `VirtualContributorInviteConnector` into the CRD community surface and add the missing preview step; retire legacy invite/browse dialogs. Contract: `contracts/addVcToCommunity.ts`.

**Independent test**: With CRD active, from a community surface open add-VC → search → preview → add/invite; confirm no legacy MUI VC dialog is reachable (SC-003).

- [ ] T029 [P] [US3] Add preview prop types `src/crd/components/virtualContributor/community/VirtualContributorPreview.types.ts` from `contracts/addVcToCommunity.ts`.
- [ ] T030 [US3] Build `src/crd/components/virtualContributor/community/VirtualContributorPreview.tsx` (avatar, tags, host card, description, Back + action button; loading state).
- [ ] T031 [US3] Extend `src/crd/components/community/VirtualContributorInviteDialog.tsx` with the optional `previewSlot` + `onPreview` extension so selection routes through preview before add/invite (sticky-chrome on each view).
- [ ] T032 [US3] Extend `src/main/crdPages/space/dialogs/VirtualContributorInviteConnector.tsx`: add preview data via `useVirtualContributorProviderLazyQuery`, map to `VcPreviewData`, manage preview view state (reuse `useCommunityAdmin`/`useVirtualContributorsAdmin`).
- [ ] T033 [US3] Verify the add-VC flow is wired (it already is — `VirtualContributorInviteConnector` is mounted in `src/main/crdPages/space/tabs/CrdSpaceCommunityPage.tsx` (`canInviteVc`/`handleInviteVc`, rendered ~L158) and `src/main/crdPages/topLevelPages/spaceSettings/CrdSpaceSettingsPage.tsx`). Surface the new preview view at these existing trigger points; add other CRD community entry points only if found missing.
- [ ] T034 [US3] Confirm the legacy MUI VC invite/browse dialogs (`InviteVCsDialog`, `InviteVirtualContributorDialog`, `PreviewContributorDialog`, browse-to-add `VirtualContributorsDialog`) are unreachable from CRD surfaces; document remaining MUI-only entry points (FR-004). (Display-only `VirtualContributorsBlock` is out of scope.)
- [ ] T035 [P] [US3] Add add-VC/preview i18n keys to all 6 `src/crd/i18n/community/community.<lang>.json` (`crd-community`).

**Checkpoint**: US3 independently shippable — add-VC is fully CRD with preview; legacy retired on CRD.

---

## Phase 6: User Story 4 — Configure advanced VC behavior (Priority: P3)

**Goal**: Add the only remaining admin-config surface — the prompt-graph editor card — to the existing CRD settings tab. (Visibility, BoK, prompt, external-config cards already live.) Contract: `contracts/promptGraph.ts`.

**Independent test**: With CRD active and `promptGraphEditingEnabled`, open `/vc/:nameId/settings/settings`; view system nodes (read-only) and edit user nodes (prompt + output properties), Save/Reset; confirm non-admins see no controls (SC-004).

- [ ] T036 [P] [US4] Add prop types `src/crd/components/virtualContributor/settings/VCPromptGraphCard.types.ts` from `contracts/promptGraph.ts`.
- [ ] T037 [US4] Build `src/crd/components/virtualContributor/settings/VCPromptGraphCard.tsx` using shadcn `Accordion` + a custom output-property-row editor (add/edit/delete); system nodes locked; Save/Reset; per-section save-status flash. **No graph library.**
- [ ] T038 [US4] Extend `src/main/crdPages/topLevelPages/vcPages/settings/settings/vcSettingsMapper.ts` with prompt-graph mapping (mirror legacy `promptGraph/utils.ts` traversal: nodes ordered START→END, input-variable extraction, `null`-reset workaround).
- [ ] T039 [US4] Extend `src/main/crdPages/topLevelPages/vcPages/settings/settings/useVcSettingsTabData.ts` to surface `VcPromptGraphCardProps` (reuse `useAiPersonaQuery`, `useUpdateAiPersonaMutation`, `useUpdateVirtualContributorPlatformSettingsMutation`; gate on `platformSettings.promptGraphEditingEnabled` + `Update` privilege).
- [ ] T040 [US4] Render `VCPromptGraphCard` inside `src/crd/components/virtualContributor/settings/VCSettingsTabView.tsx` when present (engine-conditional, after the existing cards).
- [ ] T041 [P] [US4] Add `promptGraph.*` keys (node labels, variables, property table, save/reset, platform toggle) to all 6 `contributorSettings.<lang>.json`.
- [ ] T042 [P] [US4] Add prompt-graph mapping unit test in `src/main/crdPages/topLevelPages/vcPages/settings/settings/__tests__/` (traversal, reset payload, read-only system nodes).

**Checkpoint**: US4 independently shippable — full advanced-config parity (prompt graph completes it).

---

## Phase 7: User Story 5 — Consistent VC presence across the app (Priority: P3)

**Goal**: Create a CRD VC badge for CRD contributor surfaces and verify VC notifications render. Contract: `contracts/vcBadge.ts`.

**Independent test**: With CRD active, see the VC indicator on a comment authored by a VC, and confirm both VC notification types render in the CRD notifications panel.

- [ ] T043 [US5] **(Constitution III watch-item — do first)** Verify the CRD comment author payload exposes whether the author is a VC (`type`/`isVirtualContributor`). If missing, add the field to the comment/message GraphQL fragment, run `pnpm codegen`, and commit generated outputs.
- [ ] T044 [P] [US5] Add prop types `src/crd/components/common/VirtualContributorBadge.types.ts` from `contracts/vcBadge.ts`.
- [ ] T045 [US5] Build `src/crd/components/common/VirtualContributorBadge.tsx` (shadcn Badge variant, VC `lucide-react` icon + localized label; "Virtual Contributor" stays English).
- [ ] T046 [US5] Render the badge in `src/crd/components/comment/CommentItem.tsx` when the author is a VC; thread the `isVirtualContributor` flag through the comment data mapper/connector that feeds `CommentItem`.
- [ ] T047 [US5] Verify both VC in-app notification types (`VirtualAdminSpaceCommunityInvitation`, `SpaceAdminVirtualCommunityInvitationDeclined`) render correctly in the CRD `NotificationsPanel` via `src/main/ui/layout/notificationDataMapper.tsx` (interpolation values present); document the result. (No new per-type view needed.)
- [ ] T048 [P] [US5] Add the badge label key to all 6 `src/crd/i18n/common/common.<lang>.json` (or `crd-community`) — English term preserved.

**Checkpoint**: US5 independently shippable — VC indicator on CRD comments; notifications verified.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Quality gates and acceptance verification across all stories.

- [ ] T049 [P] Grep new CRD files for forbidden imports (`@mui/*`, `@emotion/*`, `@apollo/client`, `@/domain/*`, `react-router-dom`, `formik`) under `src/crd/components/virtualContributor/`, `src/crd/components/common/VirtualContributorBadge.tsx`; fix any leak (FR-013).
- [ ] T050 [P] Confirm every navigational URL in new code comes from `src/main/routing/urlBuilders.ts` (no inline templates) (FR-015).
- [ ] T051 [P] Accessibility pass (WCAG 2.1 AA): keyboard nav + focus + `aria-label` on icon buttons across wizard, KB, prompt-graph rows, preview, badge.
- [ ] T052 Run `pnpm lint` and `pnpm vitest run`; fix failures.
- [ ] T053 Manual acceptance against Success Criteria with CRD on: SC-001 (wizard, all launch points), SC-002 (KB + deep link), SC-003 (no legacy VC dialog), SC-004 (non-admin gating), then SC-005 with legacy design on (VC screens unchanged).
- [ ] T054 [P] Verify i18n completeness: every new key exists in all 6 languages; platform terms (incl. "Virtual Contributor") preserved per glossary (FR-014/SC-007).

---

## Dependencies & Execution Order

### Phase dependencies
- **Setup (P1)** → **Foundational (P2)** → **user stories** → **Polish (P8)**.
- User stories US1–US5 are **independent** (disjoint files) and may proceed in any order or in parallel by different developers.

### Within-story dependencies (typical)
- `*.types.ts` (from contracts) → presentational component → mapper → data hook → integration page → routing wire. i18n + tests run parallel `[P]` once their sibling exists.
- **US1**: T004→T005; T005 + steps/sub-dialogs T006–T011 → T013 (hook) → T014 (mapper) → T015 (page) → T016→T017→T018 (routing/launch). T012 is descoped.
- **US2**: T021→T022; T024→T025→T026 (T026 repoints the route). 
- **US3**: T029→T030→T031→T032→T033 (T034 retire check after wiring). 
- **US4**: T036→T037; T038→T039→T040. 
- **US5**: **T043 first** (codegen gate) → T044→T045→T046; T047 independent.

### Recommended execution order (warm-up-first, heavy-components-last, per plan.md)
**US5 → US3 → US2 → US4 → US1**. US5 is the true small warm-up and resolves the confirmed codegen dependency (T043). US4's prompt-graph card and US1's wizard are the two most complex builds, so they go last. US3's add-VC flow is **already wired** into the CRD community surfaces — its only real gap is the preview step (T029–T032). (Spec MVP remains US1 = P1.)

## Parallel execution examples
- **Across stories**: assign US4, US5, US3 to three developers concurrently — no shared files.
- **Within US1**: T006–T011 (step/sub-dialog components) run in parallel after the shell types (T004) land.
- **i18n + tests**: every `[P]` i18n/test task runs alongside its feature task.

## Implementation Strategy
- **MVP = US1** (creation wizard, P1) — the largest but highest-value gap. Ship it behind the existing toggle; legacy stays as fallback.
- **Incremental delivery**: each story is a standalone PR cross-referencing `106-crd-virtual-contributors`. Recommended merge order is warm-up-first, heavy-components-last (US5→US3→US2→US4→US1) to bank quick wins and de-risk the two complex builds (prompt-graph, wizard) last.
- **No backend changes**: only the US5 comment-author field may require `pnpm codegen` (additive); everything else reuses generated hooks (SC-006).
