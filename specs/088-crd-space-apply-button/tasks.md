---
description: "Task list for 088-crd-space-apply-button"
---

# Tasks: CRD Space Apply/Join Button on Dashboard

**Input**: Design documents from `/specs/088-crd-space-apply-button/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/connector.md, quickstart.md

**Tests**: No new automated tests requested. The connector is a thin composition of components already tested by spec 087; existing `pnpm vitest run` must continue to pass unchanged.

**Organization**: Tasks are grouped by user story to enable incremental validation. Because the entire feature delivers as a single connector + one two-line edit, the code work is concentrated in the Foundational phase; each user-story phase consists of dedicated verification scenarios that exercise a specific slice of behavior from `quickstart.md`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files or independent verifications, no dependencies on incomplete tasks)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Each task cites its concrete file path or quickstart scenario.

## Path Conventions

Single Web SPA. Per plan.md, the new code file and the one edit target are:
- NEW: `src/main/crdPages/space/SpaceApplyButtonConnector.tsx`
- EDIT: `src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx`

All referenced 087 components and domain hooks already exist; this feature adds no other files.

---

## Phase 1: Setup

**Purpose**: Confirm the local environment is ready; no project initialization or tooling changes are required.

- [ ] T001 Bring the dev environment online: Alkemio backend at `localhost:3000`, run `pnpm start` for the frontend at `localhost:3001`, and enable the CRD toggle (Admin → Platform Settings → Design System, or `localStorage.setItem('alkemio-crd-enabled','true')` + reload). Validate against the steps in `specs/088-crd-space-apply-button/quickstart.md` §1–§2.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build the single new integration connector and wire it into the CRD Dashboard. After this phase, every user story in Phases 3–6 becomes verifiable.

**⚠️ CRITICAL**: T002 → T003 → T004 are sequential; T003 imports the file created in T002, and T004 type-checks both.

- [ ] T002 Create the integration connector at `src/main/crdPages/space/SpaceApplyButtonConnector.tsx`. Follow `specs/088-crd-space-apply-button/contracts/connector.md` exactly: the `SpaceApplyButtonConnectorProps` type (`spaceId`, `spaceProfileUrl`, optional `className`); call `useApplicationButton({ spaceId, onJoin: () => navigate(spaceProfileUrl) })` from `@/domain/access/ApplicationsAndInvitations/useApplicationButton`; return `null` when `applicationButtonProps.isMember || applicationButtonProps.loading`; render the `SpaceAboutApplyButton` from `@/crd/components/space/SpaceAboutApplyButton` using the state-mapping table in the contract; render the five dialog subtrees (`ApplyDialogConnector` and `InvitationDetailConnector` from `./about/…`, plus `ApplicationSubmittedDialog`, `PreApplicationDialog`, `PreJoinParentDialog` from `@/crd/components/community/…`), each controlled by a local `useState<boolean>` flag; pull the Space display name from `useSpace()` for the submitted dialog's `communityName`; compute `preAppDialogVariant` via `isApplicationPending` from `@/domain/community/applicationButton/isApplicationPending`; build the login URL with `buildLoginUrl` from `@/main/routing/urlBuilders`. No `ref`, no MUI imports, no `useMemo`/`useCallback`/`React.memo`.

- [ ] T003 Wire the connector into `src/main/crdPages/space/tabs/CrdSpaceDashboardPage.tsx`. Add the import `import { SpaceApplyButtonConnector } from '../SpaceApplyButtonConnector';` and insert the JSX block immediately before `<CalloutListConnector …>`: `<SpaceApplyButtonConnector spaceId={space.id} spaceProfileUrl={space.about.profile.url} className="mb-6" />`. `space` is already in scope via the existing `useSpace()` call at line 20; no other edits are required.

- [ ] T004 Run `pnpm lint` from the repo root. Confirm TypeScript type-checks, Biome formatting checks, and ESLint (including `react-compiler`) all pass with no warnings or errors attributable to the new file or the Dashboard edit.

**Checkpoint**: Foundation is ready. The CRD Dashboard now renders the apply/join CTA; every user story's verification can begin.

---

## Phase 3: User Story 1 — Non-member sees a clear call-to-action on the Space Dashboard (Priority: P1) 🎯 MVP

**Goal**: Non-member viewers (anonymous and authenticated) see a correctly-labelled call-to-action at the top of the Dashboard and can act on it without navigating through About.

**Independent Test**: Following `quickstart.md` §3, run Scenarios 1, 2, 3, 5, and 6 on a fresh browser session. Confirm in each case the correct label, the correct follow-up flow surface, and state transitions on success.

### Implementation for User Story 1

(No additional code; all behavior is delivered by the foundational phase.)

### Verification for User Story 1

- [ ] T005 [P] [US1] Anonymous guest: run Scenario 1 from `specs/088-crd-space-apply-button/quickstart.md` §3. Confirm "Sign in to apply" label with helper text, and that clicking navigates to login with the Space URL preserved as the return destination; after sign-in the user lands back on the same Space Dashboard with the button now showing the signed-in state (FR-008, US1 scenario 1).

- [ ] T006 [P] [US1] Authenticated non-member, apply-required Space: run Scenario 2 from `specs/088-crd-space-apply-button/quickstart.md` §3. Confirm "Apply" label; clicking opens the application form with questions and community guidelines; valid submission closes the form, opens the "Application submitted" confirmation, and on close the Dashboard CTA transitions to "Application pending" (disabled) with no manual refresh (FR-004, US1 scenario 3).

- [ ] T007 [P] [US1] Authenticated non-member, can-join Space: run Scenario 3 from `specs/088-crd-space-apply-button/quickstart.md` §3. Confirm "Join" label; clicking opens the join confirmation (no questions); confirming navigates into the Space and the CTA is absent on re-render (member state) (FR-005, US1 scenario 2).

- [ ] T008 [P] [US1] Authenticated non-member, existing pending application: run Scenario 6 from `specs/088-crd-space-apply-button/quickstart.md` §3. Confirm "Application pending" label, disabled, no follow-up surface on click (FR-003, US1 scenario 5).

- [ ] T009 [P] [US1] Authenticated non-member, pending invitation: run Scenario 5 from `specs/088-crd-space-apply-button/quickstart.md` §3 — both accept and reject paths. Confirm "Accept invitation" label; accept path navigates into the Space and the CTA disappears; reject path closes the dialog and state re-evaluates on next interaction (FR-006, US1 scenario 4).

**Checkpoint**: User Story 1 (the MVP) is fully functional and verifiable end-to-end.

---

## Phase 4: User Story 2 — Member sees an uncluttered Dashboard (Priority: P1)

**Goal**: Members see the content feed directly below the tab navigation, with no disabled "Member" pill, no placeholder, and no layout shift as membership state resolves.

**Independent Test**: Following `quickstart.md` §3 Scenario 4, sign in as a member of the Space, open the Dashboard, and verify the CTA section is absent (not merely hidden with reserved space).

### Verification for User Story 2

- [ ] T010 [P] [US2] Authenticated member: run Scenario 4 from `specs/088-crd-space-apply-button/quickstart.md` §3. Confirm the CTA section is not rendered, the callout feed appears directly below the Space navigation tabs, and there is no layout shift between initial paint and final resolved state (FR-009, US2 scenario 1).

- [ ] T011 [P] [US2] Loading guard: throttle the network in DevTools to slow down `useApplicationButtonQuery`, reload the Dashboard, and observe the first paint. Confirm the CTA section remains absent during loading (no spinner, no disabled placeholder), and only appears once the state resolves — and only for non-members (FR-010, US2 scenario 2).

**Checkpoint**: User Stories 1 and 2 both work independently; the CTA is correctly gated on membership and resolved-state readiness.

---

## Phase 5: User Story 3 — Call-to-action is scoped to the Dashboard tab (Priority: P2)

**Goal**: The CTA appears only on the Dashboard tab. Community and Subspaces tabs are unaffected.

**Independent Test**: Following `quickstart.md` §3 Scenario 7, navigate between Dashboard → Community → Subspaces → Dashboard and confirm the CTA is visible only on the Dashboard tab.

### Verification for User Story 3

- [ ] T012 [P] [US3] Non-Dashboard tabs are unaffected: as a non-member, navigate from Dashboard to Community, then to Subspaces. Confirm no CTA is shown on either tab (FR-011, US3 scenario 1). Reference `specs/088-crd-space-apply-button/quickstart.md` §3 Scenario 7.

- [ ] T013 [P] [US3] Round-trip restoration: from a non-Dashboard tab, switch back to Dashboard and confirm the CTA reappears in the correct state for the viewer's membership and application status (US3 scenario 2).

**Checkpoint**: Tab scoping matches the legacy MUI behaviour exactly; User Story 3 is complete.

---

## Phase 6: User Story 4 — Dashboard CTA respects subspace-only policies (Priority: P3)

**Goal**: For Spaces whose policy requires parent-Space engagement first, the CTA opens the correct parent-prompt flow instead of submitting an application here.

**Independent Test**: On a Space whose community policy requires either joining or applying to the parent first, activate the Dashboard CTA and confirm the parent-prompt surface opens with the correct variant (join-parent, apply-to-parent, or parent-application-pending).

### Verification for User Story 4

- [ ] T014 [P] [US4] Apply-to-parent prompt: on a subspace-policy Space where the viewer lacks parent membership and cannot yet apply here, activate the CTA and confirm the `PreApplicationDialog` opens in the `dialog-apply-parent` variant with a link to the parent Space (FR-007, US4 scenario 2).

- [ ] T015 [P] [US4] Join-parent prompt: on a Space whose parent allows direct join and the viewer has not yet joined it, activate the CTA and confirm the `PreJoinParentDialog` opens with the parent Space link (FR-007, US4 scenario 1).

- [ ] T016 [P] [US4] Parent-application-pending variant: as a viewer with a pending application to the parent Space, activate the CTA and confirm the `PreApplicationDialog` opens in the `dialog-parent-app-pending` variant rather than offering another submission.

**Checkpoint**: All four user stories are independently verified.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Run the cross-cutting validations from the spec and quickstart: automated suite, toggle-off fallback, mutation failure, accessibility, and mobile viewport.

- [ ] T017 [P] Run `pnpm vitest run` from the repo root. Confirm the existing test suite (≈57 files / 595 tests) passes with no regressions; no new test files are expected.

- [ ] T017a [P] No-new-translation-keys audit: from the repo root, run `git diff --name-only develop -- src/crd/i18n/ src/core/i18n/` against the base branch. Confirm the output is empty, proving no locale files were added or modified by this feature (FR-012, SC-009).

- [ ] T018 [P] CRD toggle OFF fallback: run Scenario 8 from `specs/088-crd-space-apply-button/quickstart.md` §3. Disable the CRD toggle via the Admin UI (or `localStorage.removeItem('alkemio-crd-enabled')`) and reload. Confirm the legacy MUI apply/join CTA renders on the Dashboard via `src/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage.tsx:79-92` with no CRD chrome, no duplicated CTA, and no console errors. Re-enable the toggle and reload: CRD CTA returns (FR-002, FR-019, SC-010).

- [ ] T019 [P] Mutation failure UX: run Scenario 9 from `specs/088-crd-space-apply-button/quickstart.md` §3. Open the apply form, stop the backend (or throttle the network to force a failure), submit, and confirm the platform's toast surfaces the error while the form dialog stays open with the user's text intact. Restart the backend and resubmit to verify success (FR-013).

- [ ] T020 [P] Keyboard + screen-reader accessibility: run the accessibility spot checks in `specs/088-crd-space-apply-button/quickstart.md` §5. Tab to the CTA (visible focus ring), press Enter to open the flow surface (focus moves inside dialog), press Esc (dialog closes, focus returns to CTA). With VoiceOver / NVDA, confirm button label and helper text are announced and decorative icons are skipped (FR-014, FR-015, SC-008).

- [ ] T021 [P] Mobile 360px viewport: run the mobile spot check in `specs/088-crd-space-apply-button/quickstart.md` §6. In Chrome DevTools at a 360px-wide viewport, confirm the CTA fits the content column, the label does not overflow, no horizontal scroll appears, and helper text sits directly beneath the button (FR-016).

**Checkpoint**: All functional, non-functional, accessibility, and cross-toggle behaviors pass the spec's acceptance scenarios.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies. Must be completed before any other phase because the dev environment is the verification surface.
- **Foundational (Phase 2)**: Depends on Setup. Blocks every user-story phase — the CTA is not rendered until T003 lands.
- **User Stories (Phases 3–6)**: All depend on Foundational completion. Once Foundational is done the four user stories can be verified in parallel since they exercise independent slices of the same code path.
- **Polish (Phase 7)**: Depends on Phases 3–6 being validated — the cross-cutting checks assume the CTA is functioning.

### User Story Dependencies

- **US1 (P1)** — No dependencies on other stories.
- **US2 (P1)** — No dependencies on other stories; inverse guard of US1 (members vs. non-members).
- **US3 (P2)** — No dependencies on other stories; structural placement of the connector inside the Dashboard page delivers this story for free.
- **US4 (P3)** — No dependencies on other stories; specific sub-states of the same state machine US1 exercises.

### Within Each User Story

- All tasks in Phases 3–6 are verification only; there are no internal dependencies within a story beyond "dev environment is running".

### Parallel Opportunities

- Within Foundational (Phase 2): T002 → T003 → T004 are strictly sequential (same-file dependency chain).
- Within each user-story phase: every task is marked `[P]` and can be run in any order — they are independent browser verifications on different fixtures.
- User-story phases themselves can be verified in parallel by different testers once Foundational is complete.
- Polish tasks (T017–T021) are all `[P]` and independent of one another.

---

## Parallel Example: User Story 1 verification

Once T004 (`pnpm lint`) passes, a single tester can cycle through these in any order, or four testers can split them:

```bash
# All independent — run any / all in parallel:
Task: "T005 Anonymous guest — Scenario 1"
Task: "T006 Authenticated non-member, apply-required — Scenario 2"
Task: "T007 Authenticated non-member, can-join — Scenario 3"
Task: "T008 Existing pending application — Scenario 6"
Task: "T009 Pending invitation accept + reject — Scenario 5"
```

---

## Implementation Strategy

### MVP First (User Story 1 only)

1. Complete Phase 1 (T001) — environment ready.
2. Complete Phase 2 (T002 → T003 → T004) — the connector is live on the Dashboard and type-checks.
3. Complete Phase 3 (T005–T009) — run the five non-member scenarios.
4. **STOP & VALIDATE**: the MVP delivers the primary parity gap — a non-member can now apply/join from the CRD Dashboard.
5. Deploy / demo if ready.

### Incremental Delivery

1. Setup + Foundational → Foundation ready.
2. US1 → MVP validated.
3. US2 → Member UX confirmed (no placeholder, no layout shift).
4. US3 → Tab scoping confirmed.
5. US4 → Parent-prompt flows confirmed.
6. Polish → Toggle-off / mutation-failure / a11y / mobile.

### Parallel Team Strategy

For a two-person team post-Foundational:
- Tester A: US1 + US3 (the member-facing happy-path slice + tab scoping).
- Tester B: US2 + US4 (the guard-and-edge-case slice + parent prompts).
- Both: Polish (T017–T021) split by affinity (automated vs. manual).

---

## Notes

- `[P]` tasks = independent verifications (in Phases 3–7) or separate files (not applicable here — only one new file exists).
- `[Story]` label maps each task to a specific user story for traceability.
- T002–T003 must be committed together or in sequence — T003 imports the file created by T002.
- No new translation keys are introduced; no locale files are touched. Verify this via `git status` before committing (T004 side-effect).
- Commit after T003 (or T002 + T003 together), then after T004, then optionally after each verification slice.
- Avoid: adding a CRD CTA to `CrdSpacePageLayout.tsx`, introducing a `useMemo`/`useCallback`/`React.memo`, importing from `@mui/*` or `@emotion/*` anywhere in the new file, or altering `CrdSpaceAboutPage.tsx`.
