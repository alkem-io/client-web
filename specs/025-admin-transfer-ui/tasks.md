# Tasks: Admin UI for Space Conversions & Resource Transfers

**Input**: Design documents from `/specs/025-admin-transfer-ui/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Constitution Engineering Workflow #4 requires test evidence in PRs. Test tasks cover non-trivial hook logic (branching, filtering, state transitions).

**Organization**: Tasks grouped by user story (P1→P3). US4 (Callout Transfer) requires no work — existing `TransferCalloutSection` is preserved as-is (FR-028).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup

**Purpose**: Admin page label update and i18n groundwork for the reorganized page

- [ ] T001 Update the admin management page tab label from "Transfer" to "Conversions & Transfers" — locate the tab configuration that routes to the existing TransferPage and update its label and corresponding i18n key
- [ ] T002 [P] Add page-level i18n keys to `src/core/i18n/en/translation.en.json`: `pages.admin.conversionsAndTransfers.pageTitle`, `pages.admin.conversionsAndTransfers.conversionsArea`, `pages.admin.conversionsAndTransfers.transfersArea`

---

## Phase 2: Foundational (Page Reorganization)

**Purpose**: Restructure the existing `TransferPage` into two visual areas — prerequisite for all new section integrations

**Warning**: No user story work can begin until this phase is complete

- [ ] T003 Reorganize `src/domain/platformAdmin/management/transfer/TransferPage.tsx` into two visual areas using `PageContentBlock` with `BlockTitle` headers: "Conversions" area (top, with placeholder for new sections) and "Transfers" area (bottom, containing existing `TransferSpaceSection` and `TransferCalloutSection` unchanged)

**Checkpoint**: Page structure ready — user story implementation can begin

---

## Phase 3: User Story 1 — Space Hierarchy Conversions (Priority: P1) — MVP

**Goal**: Platform admins can promote/demote spaces between hierarchy levels (L0/L1/L2) from the admin UI, with a single URL entry point that dynamically shows applicable operations based on the resolved space's level.

**Independent Test**: Navigate to admin page → enter a space URL → see only applicable operations based on level → confirm through warning dialog → verify space appears at new level.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Create `src/domain/platformAdmin/management/transfer/spaceConversion/SpaceConversion.graphql` — adapt from `contracts/SpaceConversion.graphql`: URL resolve query (`SpaceConversionUrlResolve`), space lookup query (`SpaceConversionLookup` with community roleSet counts for L1→L2 warning), sibling subspaces query (`SpaceConversionSiblingSubspaces`), and 3 conversion mutations (`ConvertSpaceL1ToL0`, `ConvertSpaceL1ToL2`, `ConvertSpaceL2ToL1`)
- [ ] T005 [US1] Run `pnpm codegen` to generate SpaceConversion hooks (requires backend at `localhost:4000/graphql`)
- [ ] T006 [US1] Create `src/domain/platformAdmin/management/transfer/spaceConversion/useSpaceConversion.ts` — URL input state, `urlResolver` lazy query, space lookup lazy query, sibling L1 fetch (lazy, for demotion picker), 3 mutation handlers with `useState` loading/error states and `try/finally` pattern, `useNotification` for success/error feedback, `toFullUrl` utility for URL normalization
- [ ] T007 [P] [US1] Add space conversion i18n keys to `src/core/i18n/en/translation.en.json` under `pages.admin.spaceConversion.*`: sectionTitle, urlPlaceholder, resolve, noConversions (L0 message), promoteL1ToL0 (button/confirmTitle/confirmWarning), demoteL1ToL2 (button/confirmTitle/confirmWarning/noTargets/targetLabel), promoteL2ToL1 (button/confirmTitle/confirmWarning), successMessage, errorMessage, urlNotFound, urlNotSpace
- [ ] T008 [US1] Create `src/domain/platformAdmin/management/transfer/spaceConversion/SpaceConversionOperations.tsx` — renders applicable operations based on resolved space level: L0 = informational "no conversions" message; L1 = "Promote to Space (L1→L0)" button + "Demote to Sub-subspace (L1→L2)" with `FormikAutocomplete` picker for sibling L1 spaces (exclude source, empty state message); L2 = "Promote to Subspace (L2→L1)" button — each operation opens a `ConfirmationDialog` with operation-specific warnings per FR-007 through FR-009
- [ ] T009 [US1] Create `src/domain/platformAdmin/management/transfer/spaceConversion/SpaceConversionSection.tsx` — `PageContentBlock` wrapper with `BlockTitle`, URL text input with resolve button, space state display card (name, level, account owner, community counts for L1), `SpaceConversionOperations` child component
- [ ] T010 [US1] Integrate `SpaceConversionSection` into `src/domain/platformAdmin/management/transfer/TransferPage.tsx` Conversions area

**Checkpoint**: Space hierarchy conversions fully functional — L1→L0, L1→L2, L2→L1 all operable from admin UI

---

## Phase 4: User Story 2 — Resource Transfers Between Accounts (Priority: P2)

**Goal**: Platform admins can transfer innovation hubs, innovation packs, and virtual contributors from one account to another using a URL + searchable account picker pattern. Existing Transfer Space and Transfer Callout subsections remain unchanged.

**Independent Test**: Enter a resource URL → see resolved entity details → select target account from searchable picker → confirm transfer → verify resource appears under new account.

### Shared Infrastructure for User Story 2

- [ ] T011 [P] [US2] Create `src/domain/platformAdmin/management/transfer/shared/AccountSearch.graphql` — adapt from `contracts/AccountSearch.graphql`: `AccountSearchUsers` query (platformAdmin.users with UserFilterInput) and `AccountSearchOrganizations` query (platformAdmin.organizations with OrganizationFilterInput), both returning account ID, host displayName, and authorization.myPrivileges
- [ ] T012 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferInnovationHub/TransferInnovationHub.graphql` — adapt from `contracts/TransferInnovationHub.graphql`: URL resolve query (`InnovationHubTransferUrlResolve`), hub lookup query (`InnovationHubTransferLookup` with account host displayName), transfer mutation (`TransferInnovationHubToAccount`)
- [ ] T013 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferInnovationPack/TransferInnovationPack.graphql` — adapt from `contracts/TransferInnovationPack.graphql`: URL resolve query (`InnovationPackTransferUrlResolve`), pack lookup query (`InnovationPackTransferLookup`), transfer mutation (`TransferInnovationPackToAccount`)
- [ ] T014 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferVirtualContributor/TransferVirtualContributor.graphql` — adapt from `contracts/TransferVirtualContributor.graphql`: URL resolve query (`VcTransferUrlResolve`), VC lookup query (`VcTransferLookup`), transfer mutation (`TransferVirtualContributorToAccount`)
- [ ] T015 [US2] Run `pnpm codegen` to generate hooks for AccountSearch + 3 transfer operations (requires backend at `localhost:4000/graphql`)
- [ ] T016 [US2] Create `src/domain/platformAdmin/management/transfer/shared/useAccountSearch.ts` — wraps generated `useAccountSearchUsersLazyQuery` and `useAccountSearchOrganizationsLazyQuery`, combines results with type labels ("User" / "Organization"), filters by `TransferResourceAccept` privilege, returns search handler and combined results array for the picker
- [ ] T017 [US2] Create `src/domain/platformAdmin/management/transfer/shared/AccountSearchPicker.tsx` — `FormikAutocomplete` wrapper that uses `useAccountSearch`, triggers search on input change, displays "displayName (User)" or "displayName (Organization)" options, handles empty results with explanatory message, returns selected account ID

### Implementation for User Story 2

- [ ] T018 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferInnovationHub/useTransferInnovationHub.ts` — URL input state, URL resolve lazy query (validate type = InnovationHub), hub lookup lazy query (display name, account owner), `transferInnovationHubToAccount` mutation handler with loading state and notifications; error handler must surface authorization errors as user-understandable messages (US2-AS5, FR-023)
- [ ] T019 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferInnovationPack/useTransferInnovationPack.ts` — same pattern as hub: URL resolve (validate type = InnovationPack), pack lookup, `transferInnovationPackToAccount` mutation; error handler must surface authorization errors as user-understandable messages (US2-AS5, FR-023)
- [ ] T020 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferVirtualContributor/useTransferVirtualContributor.ts` — same pattern: URL resolve (validate type = VirtualContributor), VC lookup, `transferVirtualContributorToAccount` mutation; error handler must surface authorization errors as user-understandable messages (US2-AS5, FR-023)
- [ ] T021 [P] [US2] Add transfer i18n keys to `src/core/i18n/en/translation.en.json` under `pages.admin.transferHub.*`, `pages.admin.transferPack.*`, `pages.admin.transferVc.*`: sectionTitle, urlPlaceholder, resolve, targetAccountLabel, confirmTitle, confirmWarning, successMessage, errorMessage, urlNotFound, urlNotExpectedType per section
- [ ] T022 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferInnovationHub/TransferInnovationHubSection.tsx` — `PageContentBlock` with URL input + resolve button, hub state display (name, current account), `AccountSearchPicker` for target account, `ConfirmationDialog` with transfer warning, loading state on confirm button
- [ ] T023 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferInnovationPack/TransferInnovationPackSection.tsx` — same pattern as hub section: URL input, pack state display, AccountSearchPicker, ConfirmationDialog
- [ ] T024 [P] [US2] Create `src/domain/platformAdmin/management/transfer/transferVirtualContributor/TransferVirtualContributorSection.tsx` — same pattern: URL input, VC state display (name, current account), AccountSearchPicker, ConfirmationDialog
- [ ] T025 [US2] Integrate `TransferInnovationHubSection`, `TransferInnovationPackSection`, and `TransferVirtualContributorSection` into `src/domain/platformAdmin/management/transfer/TransferPage.tsx` Transfers area (between existing TransferSpaceSection and TransferCalloutSection)

**Checkpoint**: All 3 new resource transfer operations functional — hub, pack, and VC transferable between accounts via searchable picker

---

## Phase 5: User Story 3 — Virtual Contributor Type Conversion (Priority: P3)

**Goal**: Platform admins can convert a space-based virtual contributor to knowledge-base-based, with clear display of the VC's current type, source space, and callout count that will be moved.

**Independent Test**: Enter a space-based VC URL → see VC type, source space, callout count → confirm conversion → verify VC type changed and callouts moved. Also: enter an already-converted VC URL → see conversion disabled with explanation.

### Implementation for User Story 3

- [ ] T026 [P] [US3] Create `src/domain/platformAdmin/management/transfer/vcConversion/VcConversion.graphql` — adapt from `contracts/VcConversion.graphql`: URL resolve query (`VcConversionUrlResolve`), VC lookup query with `aiPersona.bodyOfKnowledgeType` and `aiPersona.bodyOfKnowledgeID` (`VcConversionLookup`), source space callout count query (`VcConversionSourceSpaceCallouts`), conversion mutation (`ConvertVcToKnowledgeBase`)
- [ ] T027 [US3] Run `pnpm codegen` to generate VcConversion hooks (requires backend at `localhost:4000/graphql`)
- [ ] T028 [US3] Create `src/domain/platformAdmin/management/transfer/vcConversion/useVcConversion.ts` — URL resolve → VC lookup → conditional source space callout count fetch (only for ALKEMIO_SPACE type) → `convertVirtualContributorToUseKnowledgeBase` mutation handler; disable conversion for KNOWLEDGE_BASE type VCs; `useNotification` for feedback
- [ ] T029 [P] [US3] Add VC conversion i18n keys to `src/core/i18n/en/translation.en.json` under `pages.admin.vcConversion.*`: sectionTitle, urlPlaceholder, resolve, vcType, sourceSpace, calloutCount, alreadyConverted (disabled message), confirmTitle, confirmWarning (callouts moved not copied), successMessage, errorMessage, urlNotFound, urlNotVc
- [ ] T030 [US3] Create `src/domain/platformAdmin/management/transfer/vcConversion/VcConversionSection.tsx` — `PageContentBlock` with URL input + resolve button, VC state card (name, current type, source space name, callout count), disabled conversion button with message for KNOWLEDGE_BASE VCs, `ConfirmationDialog` warning about callouts being moved (not copied) from source space (FR-010)
- [ ] T031 [US3] Integrate `VcConversionSection` into `src/domain/platformAdmin/management/transfer/TransferPage.tsx` Conversions area (below SpaceConversionSection)

**Checkpoint**: VC type conversion operational — space-based VCs convertible to knowledge-base-based with callout migration

---

## Phase 6: Tests

**Purpose**: Cover non-trivial hook logic with unit tests per Constitution Engineering Workflow #4

- [ ] T032 [P] [US1] Create `src/domain/platformAdmin/management/transfer/spaceConversion/useSpaceConversion.test.ts` — test level-based operation filtering (L0 → no operations, L1 → promote + demote, L2 → promote only), empty sibling picker state (no valid L1 targets), URL resolution error handling (invalid URL, non-space entity)
- [ ] T033 [P] [US2] Create `src/domain/platformAdmin/management/transfer/shared/useAccountSearch.test.ts` — test combined user + organization results, privilege filtering (only accounts with `TransferResourceAccept`), empty results handling, search query propagation
- [ ] T034 [P] [US3] Create `src/domain/platformAdmin/management/transfer/vcConversion/useVcConversion.test.ts` — test type-based disabling (KNOWLEDGE_BASE → disabled), source space callout count fetch (only for ALKEMIO_SPACE type), URL resolution error handling

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Validation and verification across all user stories

- [ ] T035 Run `pnpm lint` to verify TypeScript compilation and lint rules pass across all new files
- [ ] T036 Run `pnpm vitest run` to verify all tests pass (existing + new test files)
- [ ] T037 Validate against `specs/025-admin-transfer-ui/quickstart.md` testing checklist: verify existing Transfer Space and Transfer Callout work unchanged, test each new section end-to-end (resolve URL → view state → confirm operation), test error cases (invalid URL, empty picker)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on T002 (i18n keys for area headers) — BLOCKS all user stories
- **User Story 1 (Phase 3)**: Depends on Phase 2 completion
- **User Story 2 (Phase 4)**: Depends on Phase 2 completion — independent of US1
- **User Story 3 (Phase 5)**: Depends on Phase 2 completion — independent of US1 and US2
- **Tests (Phase 6)**: Depends on the corresponding user story's hook being complete (T032 after T006, T033 after T016, T034 after T028) — all 3 can run in parallel
- **Polish (Phase 7)**: Depends on all desired user stories and tests being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2. No dependencies on other stories. **Recommended MVP scope.**
- **US2 (P2)**: Can start after Phase 2. Independent of US1. Includes shared `AccountSearchPicker` infrastructure (T011–T017) as internal prerequisite.
- **US3 (P3)**: Can start after Phase 2. Independent of US1 and US2.
- **US4 (P4)**: No work needed — existing `TransferCalloutSection` preserved as-is.

### Within Each User Story

1. GraphQL document(s) created first
2. `pnpm codegen` to generate typed hooks
3. Custom hook(s) wrapping generated queries/mutations
4. i18n keys (can overlap with hook creation — different file)
5. Section component(s) consuming hooks + i18n
6. Integration into TransferPage.tsx

### Parallel Opportunities

**Phase 3 (US1)**:
- T004 (GraphQL) and T007 (i18n keys) can run in parallel — different files

**Phase 4 (US2)**:
- T011–T014: All 4 `.graphql` files can be created in parallel
- T018–T021: All 3 hooks + i18n keys can run in parallel after codegen + shared component
- T022–T024: All 3 section components can run in parallel

**Phase 5 (US3)**:
- T026 (GraphQL) and T029 (i18n keys) can run in parallel

**Cross-story**: US1, US2, and US3 can all run in parallel after Phase 2 (if team capacity allows)

---

## Parallel Example: User Story 2

```bash
# Launch all GraphQL documents together (different files, no dependencies):
Task: T011 — AccountSearch.graphql in shared/
Task: T012 — TransferInnovationHub.graphql
Task: T013 — TransferInnovationPack.graphql
Task: T014 — TransferVirtualContributor.graphql

# After codegen (T015) + shared components (T016, T017):
# Launch all hooks + i18n together (different files):
Task: T018 — useTransferInnovationHub.ts
Task: T019 — useTransferInnovationPack.ts
Task: T020 — useTransferVirtualContributor.ts
Task: T021 — i18n keys for all 3 transfer sections

# Launch all section components together:
Task: T022 — TransferInnovationHubSection.tsx
Task: T023 — TransferInnovationPackSection.tsx
Task: T024 — TransferVirtualContributorSection.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (tab label + i18n keys)
2. Complete Phase 2: Foundational (page reorganization)
3. Complete Phase 3: User Story 1 (space hierarchy conversions)
4. **STOP and VALIDATE**: Test L1→L0, L1→L2, L2→L1 conversions independently
5. Deploy/demo if ready — admins can already perform the most impactful operations

### Incremental Delivery

1. Setup + Foundational → Page structure ready
2. Add US1 (Space Conversions) → Test → Deploy (MVP — addresses primary admin support burden)
3. Add US2 (Resource Transfers) → Test → Deploy (3 new transfer operations)
4. Add US3 (VC Conversion) → Test → Deploy (specialized VC lifecycle management)
5. Each story adds value without breaking previous stories or existing functionality

### Sequential Execution (Single Developer)

Recommended order: Phase 1 → Phase 2 → Phase 3 (US1) → Phase 4 (US2) → Phase 5 (US3) → Phase 6

- Follows priority order (P1 → P2 → P3)
- Each phase builds on the previous without rework
- Natural validation checkpoints after each user story

---

## Notes

- All mutations pre-exist in the backend schema — this is frontend-only work
- `pnpm codegen` requires a running backend at `localhost:4000/graphql`
- Commit generated GraphQL outputs (`src/core/apollo/generated/`) with implementation code
- Follow the domain-first workflow: GraphQL → codegen → hook → component → integration
- Each section component is self-contained — manages its own state, no props from parent
- Existing `TransferSpaceSection` and `TransferCalloutSection` must remain unchanged
- All confirmation dialogs must list operation-specific consequences (SC-006) — no generic warnings
- All user-visible strings must use `t()` with keys in `translation.en.json` — no hardcoded text
