# Tasks: CRD Pending Memberships Dialog

**Input**: Design documents from `/specs/084-crd-pending-memberships-dialog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/pending-memberships.ts

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Port missing primitive and add i18n keys needed by all components

- [ ] T001 Port Separator primitive from `prototype/src/app/components/ui/separator.tsx` to `src/crd/primitives/separator.tsx` — update `cn()` import to `@/crd/lib/utils`, remove `"use client"` directive, verify `@radix-ui/react-separator` is in dependencies
- [ ] T002 [P] Add `pendingMemberships.*` i18n keys to `src/crd/i18n/dashboard/dashboard.en.json` — include title, empty, loading, close, closeDialog, section titles (invitationsSection, vcInvitationsSection, applicationsSection), and detail keys (back, reject, rejectAriaLabel, accept, acceptAriaLabel, join, joinAriaLabel) per plan.md Step 4
- [ ] T003 [P] Add `pendingMemberships.*` translated keys to `src/crd/i18n/dashboard/dashboard.nl.json`
- [ ] T004 [P] Add `pendingMemberships.*` translated keys to `src/crd/i18n/dashboard/dashboard.es.json`
- [ ] T005 [P] Add `pendingMemberships.*` translated keys to `src/crd/i18n/dashboard/dashboard.bg.json`
- [ ] T006 [P] Add `pendingMemberships.*` translated keys to `src/crd/i18n/dashboard/dashboard.de.json`
- [ ] T007 [P] Add `pendingMemberships.*` translated keys to `src/crd/i18n/dashboard/dashboard.fr.json`

**Checkpoint**: Separator primitive available, all i18n keys in place across 6 languages

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: CRD card components and section helper needed by both US1 and US2

**Critical**: These components are shared building blocks. Must complete before user story phases.

- [ ] T008 [P] Create `PendingInvitationCard` CRD component at `src/crd/components/dashboard/PendingInvitationCard.tsx` — clickable `<button>` card with space Avatar (rounded-lg, initials fallback), sender name + space name text, welcome message excerpt (truncated, `line-clamp-1`), time elapsed right-aligned. Styling: `border border-border bg-card hover:bg-accent/50 transition-colors rounded-lg p-4`. Focus ring: `focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none`. Min touch target: `min-h-11`. Props: `PendingInvitationCardProps` from contracts. Uses `useTranslation('crd-dashboard')` for any labels. Export types.
- [ ] T009 [P] Create `PendingApplicationCard` CRD component at `src/crd/components/dashboard/PendingApplicationCard.tsx` — clickable `<a href={spaceHref}>` card with space Avatar (rounded-lg, initials fallback), space name, tagline (muted, truncated). Same card styling pattern as T008. `onClick` prop with `e.preventDefault()` pattern. Props: `PendingApplicationCardProps` from contracts. Export types.
- [ ] T010 [P] Create `PendingMembershipsSection` CRD component at `src/crd/components/dashboard/PendingMembershipsSection.tsx` — renders `<section>` with `<h3 className="text-sm font-semibold text-muted-foreground mb-2">` title and `<ul role="list" className="space-y-2">` wrapping children as `<li>` items. Props: `PendingMembershipsSectionProps` from contracts. Export types.

**Checkpoint**: All reusable card/section building blocks ready for dialog assembly

---

## Phase 3: User Story 1 — View Pending Invitations List (Priority: P1) MVP

**Goal**: User can open the Pending Memberships dialog and see all their invitations and applications organized in sections

**Independent Test**: Enable CRD, navigate to `/home`, click "Invitations" in sidebar. Dialog opens with sections for invitations, VC invitations, and applications. Each card shows correct data. Empty state shown when no items exist. Loading skeletons shown during fetch.

### Implementation for User Story 1

- [ ] T011 [US1] Create `PendingMembershipsListDialog` CRD component at `src/crd/components/dashboard/PendingMembershipsListDialog.tsx` — dialog shell following TipsAndTricksDialog pattern. Uses `Dialog`, `DialogContent` (`sm:max-w-[600px] flex flex-col max-h-[85vh]`), `DialogHeader`, `DialogTitle`, `DialogFooter`. Scrollable body: `flex-1 min-h-0 overflow-y-auto`. Loading state: Skeleton placeholders with `role="status"` and `aria-label={t('pendingMemberships.loading')}`. Empty state: `<output>` with `t('pendingMemberships.empty')`. Footer: close Button. `onClose` via `onOpenChange`. Props: `PendingMembershipsListDialogProps` from contracts. `useTranslation('crd-dashboard')`.
- [ ] T012 [US1] Create data mapper functions at `src/main/crdPages/dashboard/pendingMembershipsDataMappers.ts` — implement `mapHydratedInvitationToCardData(hydrated: InvitationWithMeta, t: TFunction): PendingInvitationCardData` (uses `formatTimeElapsed`, truncates welcomeMessage to ~100 chars), `mapHydratedApplicationToCardData(hydrated: ApplicationWithMeta): PendingApplicationCardData`, and `mapHydratedInvitationToDetailData(hydrated: InvitationWithMeta, t: TFunction): InvitationDetailData`. Import types from `@/domain/community/pendingMembership/PendingMemberships` and `@/domain/shared/utils/formatTimeElapsed`.
- [ ] T013 [US1] Create integration wrapper `CrdPendingMembershipsDialog` at `src/main/crdPages/dashboard/CrdPendingMembershipsDialog.tsx` — LIST VIEW ONLY in this task. Reuse `usePendingMembershipsDialog()` for dialog state, `usePendingMemberships({ skip })` for data. Separate invitations by `ActorType.VirtualContributor`. Create internal `HydratedInvitationCard` wrapper (calls `useInvitationHydrator`, maps via `mapHydratedInvitationToCardData`, renders `PendingInvitationCard`). Create internal `HydratedApplicationCard` wrapper (calls `useApplicationHydrator`, maps via `mapHydratedApplicationToCardData`, renders `PendingApplicationCard`). Render `PendingMembershipsListDialog` with `PendingMembershipsSection` children for each non-empty section. Handle `handleInvitationCardClick` (placeholder — will connect to detail view in US2). Handle `handleSpaceCardClick` (close dialog + navigate). Wire `useEffect` to refetch when list view opens.
- [ ] T014 [US1] Swap dialog import in `src/main/ui/layout/CrdLayoutWrapper.tsx` — change lazy import from `@/domain/community/pendingMembership/PendingMembershipsDialog` to `@/main/crdPages/dashboard/CrdPendingMembershipsDialog`. Update JSX reference in Suspense wrapper.

**Checkpoint**: List dialog opens from sidebar/header, shows 3 sections with hydrated cards, empty/loading states work. Application clicks navigate. Invitation clicks are wired but detail view not yet implemented.

---

## Phase 4: User Story 2 — View and Act on Invitation Details (Priority: P1)

**Goal**: User can click an invitation card to see full details and accept/decline the invitation

**Independent Test**: Open Pending Memberships dialog, click an invitation card. Detail dialog shows space card, invitation description, welcome message, community guidelines. Accept navigates to space. Decline returns to list. Back button returns to list. Loading states on buttons during mutations.

### Implementation for User Story 2

- [ ] T015 [US2] Create `InvitationDetailDialog` CRD component at `src/crd/components/dashboard/InvitationDetailDialog.tsx` — detail view dialog. `DialogContent` (`sm:max-w-[700px] flex flex-col max-h-[85vh]`). Header: back button (`ArrowLeft` icon, `aria-label={t('pendingMemberships.detail.back')}`), title prop. Body: responsive `flex flex-col sm:flex-row gap-4` — left side: space card (`<a>` with Avatar, spaceName, spaceTagline, spaceTags as Badge components); right side: `descriptionSlot`, `welcomeMessageSlot`, `guidelinesSlot` ReactNode slots. Footer (`flex-col-reverse sm:flex-row`): Decline button (`variant="outline"`, X icon, `aria-label` with spaceName, `disabled={updating && !rejecting}`, `aria-busy={rejecting}`), Accept button (`variant="default"`, Check icon, `aria-label` with spaceName, `disabled={updating && !accepting}`, `aria-busy={accepting}`). Props: `InvitationDetailDialogProps` from contracts. `useTranslation('crd-dashboard')`.
- [ ] T016 [US2] Add `InvitationDetailContainer` wrapper and detail view wiring to `src/main/crdPages/dashboard/CrdPendingMembershipsDialog.tsx` — create `InvitationDetailContainer` internal component that calls `useInvitationHydrator(invitation, { withCommunityGuidelines: true })` + `useInvitationActions({ onAccept, onReject, spaceId })`. Maps hydrated data to `InvitationDetailData` via `mapHydratedInvitationToDetailData`. Renders `InvitationDetailDialog` with: title (different for VC vs regular, using `t()`), acceptLabel ("Join" vs "Accept"), rejectLabel from `t()`, `descriptionSlot` (render `DetailedActivityDescription` from MUI), `welcomeMessageSlot` (render `WrapperMarkdown` from MUI for `welcomeMessage`), `guidelinesSlot` (render guidelines title + `WrapperMarkdown` + `References` from MUI). Wire `handleInvitationCardClick` to set `InvitationView` dialog state. Wire `onInvitationAccept` (navigate + close for regular; return to list for VC). Wire `onInvitationReject` (return to list).

**Checkpoint**: Full dialog flow works: list → detail → accept/decline → navigation/list return. All slots render MUI content. VC vs regular invitation labels correct.

---

## Phase 5: User Story 3 — Open Dialog via URL Parameter (Priority: P2)

**Goal**: Dashboard auto-opens the dialog when `?dialog=invitations` URL param is present

**Independent Test**: Navigate to `/home?dialog=invitations` with CRD enabled. Dialog opens automatically on page load.

### Implementation for User Story 3

- [ ] T017 [US3] Verify `?dialog=invitations` URL parameter handling works with the new CRD dialog — the existing `useDashboardDialogs` hook in `src/main/crdPages/dashboard/useDashboardDialogs.ts` already handles this URL param and calls `onPendingMembershipsClick`. Since `DashboardPage.tsx` wires this to `usePendingMembershipsDialog()`, the CRD dialog should open automatically. Test and fix if any wiring issue exists. No new code expected — this is a verification task.

**Checkpoint**: URL parameter deep link works end-to-end

---

## Phase 6: User Story 4 — Dialog Triggered from Header Menu (Priority: P2)

**Goal**: Dialog can be opened from the CRD layout header on any page, badge shows correct count

**Independent Test**: From any CRD page (not just dashboard), click invitations trigger in header. Dialog opens. Badge count reflects pending invitations.

### Implementation for User Story 4

- [ ] T018 [US4] Verify header trigger works with the new CRD dialog — `CrdLayoutWrapper.tsx` already passes `onPendingMembershipsClick` to `CrdLayout` and renders the dialog at layout level (modified in T014). The `pendingInvitationsCount` prop is already wired via `usePendingInvitationsCount`. Verify the header trigger opens the CRD dialog on a non-dashboard CRD page. No new code expected — this is a verification task.

**Checkpoint**: Header trigger and badge count work on all CRD pages

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Responsive, accessibility, regression verification

- [ ] T019 [P] Verify mobile responsiveness — resize to 375px width: dialog fills viewport, cards are tappable (min 44px targets), footer buttons stack vertically, detail view stacks vertically. Fix any overflow or layout issues.
- [ ] T020 [P] Verify keyboard accessibility — Tab through all interactive elements in both list and detail dialogs. Focus trap works (Tab stays in dialog). Escape closes dialog. Focus returns to trigger element on close. Focus ring visible on all interactive elements.
- [ ] T021 [P] Verify screen reader accessibility — dialog is announced on open, list lengths are conveyed (`role="list"`), button labels include space names (`aria-label`), loading state announced (`role="status"`), back button has accessible name.
- [ ] T022 Run `pnpm lint` and fix any linting/type errors across all new files
- [ ] T023 Run `pnpm vitest run` and verify no test regressions
- [ ] T024 Verify CRD toggle OFF — disable CRD via `localStorage.removeItem('alkemio-crd-enabled')`, reload. Confirm MUI `PendingMembershipsDialog` still renders and functions correctly.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — start immediately
- **Foundational (Phase 2)**: Depends on T002 (i18n keys) — card components use `useTranslation`
- **US1 (Phase 3)**: Depends on Phase 2 completion (cards + section helper)
- **US2 (Phase 4)**: Depends on T013 (integration wrapper from US1) — extends it with detail view
- **US3 (Phase 5)**: Depends on T014 (dialog wired in CrdLayoutWrapper) — verification only
- **US4 (Phase 6)**: Depends on T014 (dialog wired in CrdLayoutWrapper) — verification only
- **Polish (Phase 7)**: Depends on US1 + US2 completion

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational. Delivers list view MVP.
- **US2 (P1)**: Depends on US1 (T013). Extends integration wrapper with detail view.
- **US3 (P2)**: Depends on US1 wiring (T014). Verification only — likely zero code.
- **US4 (P2)**: Depends on US1 wiring (T014). Verification only — likely zero code.

### Within Each User Story

- CRD components before integration wrapper
- Data mappers before integration wrapper
- Integration wrapper before route wiring

### Parallel Opportunities

- T002–T007 (all i18n files) can run in parallel
- T008, T009, T010 (card + section components) can run in parallel
- T019, T020, T021 (responsive, keyboard, screen reader verification) can run in parallel
- US3 and US4 can run in parallel after US1 wiring

---

## Parallel Example: Setup Phase

```
# All i18n translations can run in parallel:
T002: dashboard.en.json (English source)
T003: dashboard.nl.json
T004: dashboard.es.json
T005: dashboard.bg.json
T006: dashboard.de.json
T007: dashboard.fr.json
```

## Parallel Example: Foundational Phase

```
# All card/section components can run in parallel (different files, no deps):
T008: PendingInvitationCard.tsx
T009: PendingApplicationCard.tsx
T010: PendingMembershipsSection.tsx
```

---

## Implementation Strategy

### MVP First (User Story 1 + 2)

1. Complete Phase 1: Setup (primitive + i18n)
2. Complete Phase 2: Foundational (cards + section)
3. Complete Phase 3: US1 (list dialog + integration + wiring)
4. Complete Phase 4: US2 (detail dialog + accept/decline)
5. **STOP and VALIDATE**: Full dialog flow works end-to-end
6. US3 + US4 are verification tasks — likely pass with zero additional code

### Incremental Delivery

1. Setup + Foundational → Building blocks ready
2. US1 → List view works, cards render, empty/loading states → **Testable milestone**
3. US2 → Detail view, accept/decline, slots → **Feature complete**
4. US3 + US4 → URL param + header trigger verified → **Integration complete**
5. Polish → Mobile, a11y, regressions → **Ship-ready**

---

## Notes

- No test tasks included — spec does not request TDD approach
- US3 and US4 are verification tasks (existing wiring should work with the new CRD dialog)
- The MUI `PendingMembershipsDialog` in `src/domain/` remains unchanged (used by non-CRD layout)
- All CRD components must pass: zero MUI imports, plain TS props, Tailwind-only styling, event handlers as props
- Commit after each task or logical group for clean git history
