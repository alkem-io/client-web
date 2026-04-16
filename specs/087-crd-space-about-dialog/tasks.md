---

description: "Task list for CRD Space About Dialog"
---

# Tasks: CRD Space About Dialog

**Input**: Design documents from `/specs/087-crd-space-about-dialog/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/crd-components.md, quickstart.md

**Tests**: No automated tests requested in the spec. Manual test matrix lives in `quickstart.md`. The existing `pnpm vitest run` suite must continue to pass — see Polish phase.

**Organization**: Tasks are grouped by user story so each can be implemented and validated independently.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

Paths are absolute, rooted at the repository: `/Users/borislavkolev/WebstormProjects/client-web/`. References to `src/...` below are relative to that root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Pre-flight verification. Branch and spec docs are already in place from `/speckit.specify` and `/speckit.plan`.

- [ ] T001 Verify branch and dev environment: confirm current branch is `087-crd-space-about-dialog`, run `pnpm install`, start `pnpm start`, navigate to `http://localhost:3001/<spaceUrlName>/about` with `localStorage.setItem('alkemio-crd-enabled', 'true'); location.reload()` and confirm the existing partial CRD About view renders.
- [ ] T002 [P] Verify legacy MUI About still renders unchanged at `http://localhost:3001/<spaceUrlName>/about` after `localStorage.removeItem('alkemio-crd-enabled'); location.reload()`. This is the regression baseline.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Seed the new translation keys under the `crd-space` namespace so every CRD component built in subsequent phases can call `useTranslation('crd-space')` without missing-key errors. English only at this phase; mirror to other locales in Polish.

**⚠️ CRITICAL**: No user story work can begin until T003 is complete (components reference these keys).

- [ ] T003 Extend `src/crd/i18n/space/space.en.json` with the full new key set under `about.*` and `apply.*` blocks (see [data-model.md § Translation keys](./data-model.md#translation-keys-new-additions-to-crd-space-namespace) for the exact JSON to merge into the existing `about` block and add as a new sibling `apply` block).

**Checkpoint**: Foundational keys present in English. User-story phases may now begin in parallel.

---

## Phase 3: User Story 1 — Visitor explores a Space they may want to join (Priority: P1) 🎯 MVP

**Goal**: Bring up the CRD dialog chrome, render the existing About view inside it, and ensure close behavior + level-aware section titles + lock icon presentation work. The apply slot, guidelines slot, contact-host slot, and edit pencils are visually wired but receive no callbacks yet (those land in US2 / US3 / US4 / US5).

**Independent Test**: Open `/<spaceUrlName>/about` with the CRD toggle on. Confirm the dialog opens overlaying the space layout, displays name + tagline + description + metrics + leads + host + why + who + references, and closes via X / Esc / backdrop, navigating back to the previous page (or stepping history back two entries when the user lacks read privilege). Spec acceptance scenarios 1.1, 1.2, 1.3, 1.4.

### Implementation for User Story 1

- [ ] T004 [US1] Modify `src/crd/components/space/SpaceAboutView.tsx`: extend props with `joinSlot?`, `guidelinesSlot?`, `contactHostSlot?`, `whyTitle?`, `whoTitle?`, `hasEditPrivilege?`, `onEditDescription?`, `onEditWhy?`, `onEditWho?`, `onEditReferences?`. Add lucide section-title icons (`Flag` for Why, `Users` for Who, `Shield` for Guidelines, existing `ExternalLink` for References). Implement dual host position: when `data.leadUsers.length > 0 || data.leadOrganizations.length > 0`, render leads in the dedicated leads area and `data.provider` (with `contactHostSlot`) below references; otherwise render `data.provider` (with `contactHostSlot`) in the leads slot. Render edit pencil (lucide `Pencil`, ghost `Button`, `aria-label={t('about.edit')}`) next to each section title only when `hasEditPrivilege && onEdit*`. Use `whyTitle` / `whoTitle` overrides when provided. See [contracts/crd-components.md § 2](./contracts/crd-components.md#2-spaceaboutview-modified) for invariants.
- [ ] T005 [P] [US1] Create `src/crd/components/space/SpaceAboutDialog.tsx`: shadcn `Dialog` wrapper around `SpaceAboutView`. `DialogContent` classes `w-full sm:max-w-4xl h-[95vh] p-0 gap-0 overflow-hidden flex flex-col`. Sticky header (`border-b p-4 flex flex-row items-center justify-between gap-3`) with `lockTooltipSlot` + `DialogTitle` (`data.name`) + `DialogDescription` (`data.tagline`) on the left and `DialogClose` (lucide `X`, `aria-label={t('about.close')}`) on the right. Body: `flex-1 overflow-y-auto` containing `<SpaceAboutView ... className="px-6 py-6" />`. Pass through every slot, callback, and `whyTitle`/`whoTitle` to the view. Props per [data-model.md § 1](./data-model.md#1-spaceaboutdialog--new-srccrdcomponentsspacespaceaboutdialogtsx).
- [ ] T006 [US1] Rewrite `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` as the integration container (US1 baseline only — apply / contact / edit / guidelines slots are passed `undefined` here and wired in later phases). Steps:
  1. Call `useSpace()` for `space` + `permissions`.
  2. Call `useSpaceAboutDetailsQuery({ variables: { spaceId: space.id }, skip: !space.id })`; bail with `<LoadingSpinner />` while loading and `null` when `about` is missing.
  3. Build `aboutData: SpaceAboutData` from `data.lookup.space.about` (reuse the existing mapping logic from the current 75-line page — extend it to match the data-model `SpaceAboutData` shape; remove the previous `guidelines` text field).
  4. Compute `backToParentPage = useBackWithDefaultUrl(permissions.canRead ? space.about.profile.url : undefined, permissions.canRead ? undefined : 2)`.
  5. Resolve level-aware titles: `whyTitle = t(\`context.${space.level}.why.title\`)`, `whoTitle = t(\`context.${space.level}.who.title\`)` from the default `translation` namespace.
  6. Render `<StorageConfigContextProvider locationType="space" spaceId={space.id}>` wrapping `<SpaceAboutDialog open onOpenChange={(open) => !open && backToParentPage()} data={aboutData} hasReadPrivilege={permissions.canRead} hasEditPrivilege={permissions.canUpdate} whyTitle={whyTitle} whoTitle={whoTitle} />`.
  7. Inside the dialog only — do not render flow dialogs, contact-host link, guidelines block, or pass edit callbacks yet (those come in US2 / US3 / US4 / US5).
- [ ] T007 [US1] Lock icon presentation: in `CrdSpaceAboutPage.tsx`, pass `lockTooltipSlot` to `SpaceAboutDialog` when `!permissions.canRead`. The slot renders a lucide `Lock` icon wrapped in a shadcn `Tooltip` (`TooltipProvider` → `TooltipTrigger` → `TooltipContent`); content body uses `<Trans i18nKey="components.spaceUnauthorizedDialog.message" components={{ apply: <a href="#" className="underline" onClick={e => e.preventDefault()} /> }} />` for now. The "Learn how to apply" anchor's `onClick` will be rebound to `applyButtonRef.current?.click()` in US2 (T015) — leave it as a no-op `e.preventDefault()` here. `Lock` icon has `aria-label={t('about.lockTooltip')}` and is keyboard-focusable via the tooltip trigger.

**Checkpoint**: Open `/<space>/about` with CRD toggle on. Dialog renders with the full About content, level-aware section titles, lock icon when unauthorized, and closes correctly. Apply, contact-host, edit, guidelines features are inert at this checkpoint — they will light up in US2 / US3 / US4 / US5.

---

## Phase 4: User Story 2 — Non-member applies to or joins a Space (Priority: P1)

**Goal**: Wire the full apply / join state machine from `useApplicationButton`. Build the four CRD flow dialogs (Apply form, Submitted, PreApplication, PreJoinParent) and the apply button composite. Reuse the existing CRD `InvitationDetailDialog` for invitation acceptance via a new connector. Bind the lock-tooltip "Learn how to apply" link to programmatically click the apply button.

**Independent Test**: For each of the membership states listed in spec.md acceptance scenarios 2.1–2.7, confirm the correct button label appears, clicking opens the right surface, and (where applicable) the success / failure paths behave per spec FR-008 / FR-009 / FR-010 / FR-011 / FR-012 / FR-025.

### Implementation for User Story 2

- [ ] T008 [P] [US2] Create `src/crd/components/space/SpaceAboutApplyButton.tsx`: forwardRef'd shadcn `Button` (full width). Implement the state-machine table from [data-model.md § 3](./data-model.md#3-spaceaboutapplybutton--new-srccrdcomponentsspacespaceaboutapplybuttontsx) verbatim from `src/domain/community/applicationButton/ApplicationButton.tsx:107-244`. Use lucide `Plus` / `User` icons for state cues; `Loader2` (animated spin) when `loading`. Below the button render `<p className="text-xs text-muted-foreground mt-2">{t('about.signInHelper')}</p>` only when `!isAuthenticated`. Disabled branches set `aria-disabled` and `disabled`; loading sets `aria-busy`.
- [ ] T009 [P] [US2] Create `src/crd/components/community/ApplicationFormDialog.tsx`: shadcn `Dialog` (`sm:max-w-2xl max-h-[85vh] flex flex-col`). Header title from `mode` (`apply` → `t('apply.applyTitle', { name })`, `join` → `t('apply.joinTitle', { name })`). Body (scrollable) renders subheader (markdown `formDescription` for apply, otherwise `t('apply.subheader')` / `t('apply.subheaderJoin')`), one `<textarea>` per `questions[i]` with persistent `<label htmlFor>`, plus optional guidelines block at the bottom. Use `yup` for per-question validation (`required().max(maxLength)` or `max(maxLength)`). Track per-question answer string, `touched` flag, and `submitAttempted` flag in `useState`. Submit button label is `t('apply.apply')` or `t('apply.join')`; disabled while `submitting || !isValid`; `aria-busy` and label switches to `t('apply.processing')` when `submitting`. Field error text appears only after `submitAttempted` OR after the field is blurred with invalid content. On submit, build `ApplicationAnswer[]` (sortOrder defaults 0) and call `onSubmit(answers)`. Do not self-close — the consumer closes via `onOpenChange(false)` after the mutation resolves. Props per [data-model.md § 5](./data-model.md#5-applicationformdialog--new-srccrdcomponentscommunityapplicationformdialogtsx).
- [ ] T010 [P] [US2] Create `src/crd/components/community/ApplicationSubmittedDialog.tsx`: compact shadcn `Dialog` (`sm:max-w-md`). Title `t('apply.submitted.title')`, body `t('apply.submitted.body', { communityName })`, single primary `Button` with label `t('about.close')` whose `onClick` calls `onOpenChange(false)`. ≤40 lines.
- [ ] T011 [P] [US2] Create `src/crd/components/community/PreApplicationDialog.tsx`: compact shadcn `Dialog` (`sm:max-w-md`). Title via `<Trans i18nKey={\`components.application-button.${dialogVariant}.title\`} values={{ parentCommunityName }} components={{ strong: <strong /> }} />`, body via the matching `.body` key with `values={{ spaceName: parentCommunityName, subspaceName }}`. Footer: single CTA `<a>` styled as primary `Button` whose `href` is `applyUrl` if `isApplicationPending(parentApplicationState)` else `parentApplyUrl`; label `t('buttons.apply')` if pending, else `t(\`components.application-button.goTo${parentCommunitySpaceLevel === 'L0' ? 'Space' : 'Subspace'}\`)`. Reuse existing `translation` namespace keys (no new keys). Props per [data-model.md § 7](./data-model.md#7-preapplicationdialog--new-srccrdcomponentscommunitypreapplicationdialogtsx).
- [ ] T012 [P] [US2] Create `src/crd/components/community/PreJoinParentDialog.tsx`: same shape as `PreApplicationDialog` but uses `components.application-button.dialog-join-parent.title|body` keys; CTA href is `parentApplyUrl`; label is `t(\`components.application-button.goTo${parentCommunitySpaceLevel === 'L0' ? 'Space' : 'Subspace'}\`)`. Props per [data-model.md § 8](./data-model.md#8-prejoinparentdialog--new-srccrdcomponentscommunityprejoinparentdialogtsx).
- [ ] T013 [P] [US2] Create `src/main/crdPages/space/about/ApplyDialogConnector.tsx` (~80 lines): props `{ open, onOpenChange, spaceId, canJoinCommunity, onJoin, onApplied }`. Inside, call `useApplicationDialogQuery({ variables: { spaceId }, skip: !open || canJoinCommunity })` to fetch `applicationForm.questions`, `formDescription`, `roleSetID`, `communityName` (= `spaceAbout.profile.displayName`), and `guidelines`. Call `useApplyForEntryRoleOnRoleSetMutation`. Resolve `mode` from `canJoinCommunity` (`'join'` if true, `'apply'` if false). Map GraphQL output to `ApplicationFormDialog` props. On submit success: call `onApplied()` and `onOpenChange(false)`. **Failure UX ownership** (per spec FR-025): the connector OWNS apply-mutation failure surfacing — call `useNotification` from `@/core/ui/notifications/useNotification` to show the error toast; do NOT close the dialog (the user can retry without re-entering data). The CRD `ApplicationFormDialog` itself MUST NOT render its own error UI for mutation failures.
- [ ] T014 [P] [US2] Create `src/main/crdPages/space/about/InvitationDetailConnector.tsx` (~100 lines): props `{ open, onOpenChange, invitation }`. Inside, call `useInvitationHydrator(invitation, { withCommunityGuidelines: true })` and `useInvitationActions({ onAccept: () => onOpenChange(false), onReject: () => onOpenChange(false), spaceId: invitation?.spacePendingMembershipInfo.id })`. Map outputs to `InvitationDetailDialog` props following the existing pattern at `src/main/crdPages/dashboard/CrdPendingMembershipsDialog.tsx:89-187`. Render `<InvitationDetailDialog open={open} onClose={() => onOpenChange(false)} ... />`.
- [ ] T015 [US2] Wire the apply flow into `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` (extends T006). Steps:
  1. Add `applyButtonRef = useRef<HTMLButtonElement>(null)`.
  2. Derive `parentSpaceId`: from `useSpace()`, this Space's `level` indicates whether it is L0 (top-level — `parentSpaceId = undefined`) or a subspace. Since this iteration is L0-only (FR-024), `parentSpaceId = undefined` is the correct value here. For future subspace migration, follow the pattern in legacy `src/domain/space/about/SpaceAboutDialog.tsx` which receives `parentSpaceId` as a prop from `SubspaceAboutPage` (currently passed via `useSubspace().subspace.parentSpaceId` — confirm at integration time).
  3. Add `useApplicationButton({ spaceId: space.id, parentSpaceId, onJoin: () => navigate(about.profile.url) })` and destructure `applicationButtonProps` + `loading: applyLoading`.
  4. Add `useState` flags: `isApplyDialogOpen`, `isInvitationDialogOpen`, `isPreAppDialogOpen`, `isPreJoinDialogOpen`, `isSubmittedDialogOpen`, all default `false`.
  5. Build `joinSlot` (passed to `SpaceAboutDialog`):
     - Only render when `!applicationButtonProps.isMember && !applyLoading`.
     - `<SpaceAboutApplyButton ref={applyButtonRef} {...applicationButtonProps} onLoginClick={() => navigate(buildLoginUrl(applicationButtonProps.applyUrl))} onApplyClick={() => setIsApplyDialogOpen(true)} onJoinClick={() => setIsApplyDialogOpen(true)} onAcceptInvitationClick={() => setIsInvitationDialogOpen(true)} onApplyParentClick={() => setIsPreAppDialogOpen(true)} onJoinParentClick={() => setIsPreJoinDialogOpen(true)} />`.
  6. Rebind the lock-tooltip "Learn how to apply" anchor's `onClick` (from T007) to `(e) => { e.preventDefault(); applyButtonRef.current?.click(); }`.
  7. Below `<SpaceAboutDialog>`, render the four flow dialogs:
     - `<ApplyDialogConnector open={isApplyDialogOpen} onOpenChange={setIsApplyDialogOpen} spaceId={space.id} canJoinCommunity={applicationButtonProps.canJoinCommunity} onJoin={applicationButtonProps.onJoin} onApplied={() => setIsSubmittedDialogOpen(true)} />`
     - `<ApplicationSubmittedDialog open={isSubmittedDialogOpen} onOpenChange={setIsSubmittedDialogOpen} communityName={aboutData.name} />`
     - `<InvitationDetailConnector open={isInvitationDialogOpen} onOpenChange={setIsInvitationDialogOpen} invitation={applicationButtonProps.userInvitation} />`
     - `<PreApplicationDialog open={isPreAppDialogOpen} onOpenChange={setIsPreAppDialogOpen} dialogVariant={isApplicationPending(applicationButtonProps.parentApplicationState) ? 'dialog-parent-app-pending' : 'dialog-apply-parent'} {...preAppPropsFromButtonProps(applicationButtonProps)} />`
     - `<PreJoinParentDialog open={isPreJoinDialogOpen} onOpenChange={setIsPreJoinDialogOpen} {...preJoinPropsFromButtonProps(applicationButtonProps)} />`
  8. Define `preAppPropsFromButtonProps` and `preJoinPropsFromButtonProps` as small in-file helpers per [data-model.md § Integration-layer types](./data-model.md#integration-layer-non-crd-types).
  9. Import `isApplicationPending` from `@/domain/community/applicationButton/isApplicationPending`, `buildLoginUrl` from `@/main/routing/urlBuilders`.

**Checkpoint**: All eight states from spec acceptance scenarios 2.1–2.7 work end-to-end. Apply submission failure surfaces a toast and keeps the form open. Lock-tooltip "Learn how to apply" link triggers the apply button.

---

## Phase 5: User Story 3 — Member or visitor contacts the Space host (Priority: P2)

**Goal**: Add the "Contact host" affordance under the host card. Authenticated users get a pre-addressed direct-message dialog (the legacy MUI `DirectMessageDialog`, rendered in a portal). Unauthenticated users navigate to sign-up with the current location preserved.

**Independent Test**: Spec acceptance scenarios 3.1–3.4. On a Space whose host is shown, click "Contact host" while authenticated → MUI `DirectMessageDialog` opens with host pre-addressed. Click while unauthenticated → navigates to sign-up. Verify dual host position: Spaces with leads → host below references; Spaces without leads → host in leads area.

### Implementation for User Story 3

- [ ] T016 [US3] Wire contact-host into `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` (extends T006/T015). **Failure UX ownership**: the reused MUI `DirectMessageDialog` (returned by `useDirectMessageDialog`) handles its own send-failure UX internally. Do NOT add an additional `useNotification` toast at this layer for direct-message send failures — let the MUI dialog's existing error handling run. The integration container only handles the unauthenticated → sign-up redirect. Steps:
  1. Add `useDirectMessageDialog({ dialogTitle: t('send-message-dialog.direct-message-title') })` and destructure `{ sendMessage, directMessageDialog }`.
  2. Add `useCurrentUserContext()` and read `isAuthenticated`.
  3. Compute `contactHostSlot` only when `aboutData.provider` exists. The slot renders a CRD link/button (small `Button` variant `link` or styled `<a>`) with label `t('about.contactHost')` and lucide `Mail` icon prefix. `onClick`:
     - If `!isAuthenticated`: `navigate(buildSignUpUrl(window.location.pathname, window.location.search))`.
     - Else: import `getMessageType` from `@/domain/community/community/EntityDashboardLeadsSection/EntityDashboardLeadsSection` and the raw `provider` shape; build a `MessageReceiverChipData` (`{ id, displayName, avatarUri, country, city }`) from the GraphQL `about.provider` (not from the mapped `aboutData.provider`, which has lost the GraphQL fields needed for messaging) and call `sendMessage(getMessageType(provider.profile.type), receiver)`.
  4. Pass `contactHostSlot` into `<SpaceAboutDialog>`.
  5. Render `{directMessageDialog}` as a sibling of `<SpaceAboutDialog>` inside the `<StorageConfigContextProvider>`. This is the **single permitted MUI element** in the integration layer (per Constitution Arch 2 violation in plan.md). Add a `// eslint-disable` or inline comment if needed to mark it explicitly.
  6. Send-failure UX is owned by the MUI `DirectMessageDialog` itself; no integration-layer error handling needed for the messaging path.

**Checkpoint**: Contact host works end-to-end for both authenticated and unauthenticated users. Dual host position visually correct on Spaces with and without leads.

---

## Phase 6: User Story 4 — Privileged user edits a Space section in place (Priority: P2)

**Goal**: For users with `permissions.canUpdate`, wire the per-section edit pencils (already rendering from US1's `SpaceAboutView` modifications) to navigate to the Space settings anchored to the right section.

**Independent Test**: Spec acceptance scenarios 4.1–4.3. As a user with edit privileges, open the dialog and click each pencil; confirm correct `buildSettingsUrl(...) + '/about#<section>'` (or `/community` for guidelines) navigation. As a user without edit privileges, confirm pencils are absent.

### Implementation for User Story 4

- [ ] T017 [US4] Pass per-section edit callbacks to `<SpaceAboutDialog>` from `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` (extends T006/T015/T016): `onEditDescription={() => navigate(buildSettingsUrl(about.profile.url) + '/about#description')}`, `onEditWhy={() => navigate(buildSettingsUrl(about.profile.url) + '/about#why')}`, `onEditWho={() => navigate(buildSettingsUrl(about.profile.url) + '/about#who')}`, `onEditReferences={() => navigate(buildSettingsUrl(about.profile.url) + '/about')}`. The `hasEditPrivilege` prop was already passed in T006. Import `buildSettingsUrl` from `@/main/routing/urlBuilders`.

**Checkpoint**: Edit pencils render and navigate correctly for privileged users; absent for non-privileged users.

---

## Phase 7: User Story 5 — User reads the full Community Guidelines (Priority: P3)

**Goal**: Build the CRD `CommunityGuidelinesBlock` composite (with nested "Read more" dialog) and inject it as the `guidelinesSlot` from the integration container, hydrating data via `useCommunityGuidelinesQuery`.

**Independent Test**: Spec acceptance scenarios 5.1–5.4. On a Space with guidelines, the truncated preview renders with a "Read more" button; clicking opens a nested dialog with full description + references; Esc closes only the inner dialog. On a Space with no guidelines and no edit privilege, the section is omitted; with edit privilege, an "admins only" caption + edit pencil shows.

### Implementation for User Story 5

- [ ] T018 [P] [US5] Add three additional translation keys to `src/crd/i18n/space/space.en.json` under the `about` block: `"guidelines": "Community Guidelines"` (already present from current file — keep), `"guidelinesAdminsOnly": "Only admins can see this section. Add community guidelines so members know what to expect."`, and `"readMore": "Read more"` (already added in T003 — confirm present). This task is just an audit/sweep over the file.
- [ ] T019 [P] [US5] Create `src/crd/components/space/CommunityGuidelinesBlock.tsx`. Header: lucide `Shield` icon (`aria-hidden="true"`) + display name (`displayName ?? t('about.guidelines')`) + edit pencil (lucide `Pencil`, ghost `Button`, `aria-label={t('about.edit')}`) when `canEdit && onEditClick`. When `description` is non-empty: render `<MarkdownContent content={description} className="[mask-image:linear-gradient(to_bottom,black_60%,transparent)] max-h-32 overflow-hidden" />` followed by a `<Button variant="link" onClick={() => setReadMoreOpen(true)}>{t('about.readMore')}</Button>`. The "Read more" button opens a nested shadcn `Dialog` whose `DialogContent` renders `DialogTitle` (display name), full `MarkdownContent`, and a list of `references` (each as `<a target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 ...">` with lucide `ExternalLink` icon). When `description` is empty AND `canEdit === true`: render the header + an `<p className="text-sm text-muted-foreground">{t('about.guidelinesAdminsOnly')}</p>`. When `description` is empty AND `canEdit === false`: return `null`. Props per [data-model.md § 4](./data-model.md#4-communityguidelinesblock--new-srccrdcomponentsspacecommunityguidelinesblocktsx).
- [ ] T020 [US5] Wire guidelines into `src/main/crdPages/space/about/CrdSpaceAboutPage.tsx` (extends T006/T015/T016/T017). Steps:
  1. Call `useCommunityGuidelinesQuery({ variables: { communityGuidelinesId: about.guidelines.id }, skip: !about.guidelines.id })` and destructure `data: guidelinesData, loading: guidelinesLoading`.
  2. Compute `guidelinesSlot` only when `about.guidelines.id` is present:
     - `<CommunityGuidelinesBlock displayName={guidelinesData?.lookup.communityGuidelines?.profile.displayName} description={guidelinesData?.lookup.communityGuidelines?.profile.description} references={guidelinesData?.lookup.communityGuidelines?.profile.references} loading={guidelinesLoading} canEdit={permissions.canUpdate} onEditClick={() => navigate(buildSettingsUrl(about.profile.url) + '/community')} />`.
  3. Pass `guidelinesSlot` into `<SpaceAboutDialog>`.

**Checkpoint**: Guidelines block renders with proper truncation and "Read more" nested dialog; admins-only state renders correctly when description is empty + canEdit; section is omitted otherwise.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Mirror translations to all locales, run static checks, complete the manual test matrix, and verify regression behavior.

- [ ] T021 [P] Mirror new keys from `src/crd/i18n/space/space.en.json` into `src/crd/i18n/space/space.nl.json`. Copy English values where Dutch translations don't yet exist (consistent with current `about.*` block convention).
- [ ] T022 [P] Mirror new keys into `src/crd/i18n/space/space.es.json`.
- [ ] T023 [P] Mirror new keys into `src/crd/i18n/space/space.bg.json`.
- [ ] T024 [P] Mirror new keys into `src/crd/i18n/space/space.de.json`.
- [ ] T025 [P] Mirror new keys into `src/crd/i18n/space/space.fr.json`.
- [ ] T026 Run `pnpm lint` from repo root and resolve any TypeScript / Biome / ESLint findings introduced by this branch.
- [ ] T027 Run `pnpm vitest run` from repo root and confirm the existing test suite still passes (no new tests required by this feature; existing 595-test baseline must not regress).
- [ ] T028 [P] CRD MUI-cleanliness audit: from repo root, run `grep -rn "@mui\|@emotion" src/crd/components/space/SpaceAbout* src/crd/components/space/CommunityGuidelinesBlock.tsx src/crd/components/community/` — confirm output is empty.
- [ ] T029 [P] Integration-layer MUI-cleanliness audit: from repo root, run `grep -rn "@mui\|@emotion" src/main/crdPages/space/about/` — confirm only acceptable matches are the inline comment marking the reused `directMessageDialog` from `useDirectMessageDialog` (no direct `@mui/*` imports).
- [ ] T030 Execute the manual test matrix in [quickstart.md § 6](./quickstart.md#6-manual-test-matrix) for each of the five user stories. Capture observations or screenshots for the PR description.
- [ ] T031 Execute the accessibility checklist in [quickstart.md § 8](./quickstart.md#8-accessibility-checklist-fr-020--fr-021--sc-006) using keyboard-only navigation and a screen reader (VoiceOver or NVDA). Document any findings in the PR description.
- [ ] T032 Regression verification per spec FR-002 / FR-023 / FR-024 / SC-002:
  1. With `localStorage.removeItem('alkemio-crd-enabled'); location.reload()`, navigate to `/<space>/about` and confirm the legacy MUI `SpaceAboutDialog` from `src/domain/space/about/` renders unchanged (no behavior change attributable to this branch).
  2. With `localStorage.setItem('alkemio-crd-enabled', 'true'); location.reload()`, navigate to `/<space>/about` and confirm the new CRD dialog renders.
  3. **Subspace path with CRD on (FR-024)**: with the CRD toggle still on, navigate to `/<space>/challenges/<sub>/about` and confirm the legacy MUI subspace About dialog renders (CRD About is L0-exclusive in this iteration; subspace routing still delegates to legacy `SubspaceRoutes`).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: T001 must complete before any other work; T002 can run in parallel with T001 (different verification paths).
- **Foundational (Phase 2)**: Depends on Setup. T003 BLOCKS all user story phases.
- **User Stories (Phase 3+)**: All depend on Foundational (T003) being complete. They are sequenced below by priority but US1 must complete before US2/US3/US4/US5 can wire integration callbacks (because US1 owns the `CrdSpaceAboutPage` rewrite and the `SpaceAboutDialog` chrome).
- **Polish (Phase 8)**: Depends on all desired user stories being complete.

### User Story Dependencies

- **US1 (P1)**: Can start immediately after T003. Owns the foundational page rewrite + dialog chrome + view enhancements. **All other user stories layer onto US1's `CrdSpaceAboutPage`.**
- **US2 (P1)**: Depends on US1 (T006) being in place. Within US2, the four flow dialogs (T009–T012) and two connectors (T013–T014) and the apply button (T008) are all parallel; T015 (page wiring) depends on all of them.
- **US3 (P2)**: Depends on US1. Single page-wiring task (T016) is independent of US2 work.
- **US4 (P2)**: Depends on US1 (presentation pencils already render from T004). Single page-wiring task (T017) is independent of US2/US3.
- **US5 (P3)**: Depends on US1. T018 / T019 are parallel; T020 depends on T019.

### Within Each User Story

- For US1: T004 and T005 can run in parallel (different files). T006 depends on both. T007 depends on T006.
- For US2: T008–T014 can all run in parallel. T015 depends on T008–T014.
- For US3: T016 depends only on US1's T006.
- For US4: T017 depends only on US1's T006 (and on T004 which already added pencil rendering).
- For US5: T019 can start before T020. T018 is a translation audit and is parallel with T019.

### Parallel Opportunities

- **Phase 1**: T001, T002 in parallel.
- **Phase 3 (US1)**: T004, T005 in parallel; then T006 (sequential); then T007.
- **Phase 4 (US2)**: T008, T009, T010, T011, T012, T013, T014 all in parallel; then T015.
- **Phase 7 (US5)**: T018, T019 in parallel; then T020.
- **Phase 8 (Polish)**: T021–T025 (locale mirrors) all in parallel; T028, T029 (greps) in parallel.
- **Cross-story**: Once US1 (T007) completes, US2 / US3 / US4 / US5 can be picked up by separate developers in parallel — they each write to different parts of `CrdSpaceAboutPage.tsx` plus their own new files.

---

## Parallel Example: User Story 2

```bash
# After US1 lands, the entire US2 component layer can be built concurrently:
Task: "Create src/crd/components/space/SpaceAboutApplyButton.tsx"
Task: "Create src/crd/components/community/ApplicationFormDialog.tsx"
Task: "Create src/crd/components/community/ApplicationSubmittedDialog.tsx"
Task: "Create src/crd/components/community/PreApplicationDialog.tsx"
Task: "Create src/crd/components/community/PreJoinParentDialog.tsx"
Task: "Create src/main/crdPages/space/about/ApplyDialogConnector.tsx"
Task: "Create src/main/crdPages/space/about/InvitationDetailConnector.tsx"

# Once all seven complete, sequentially wire them in:
Task: "Wire apply flow into src/main/crdPages/space/about/CrdSpaceAboutPage.tsx (T015)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001, T002).
2. Complete Phase 2: Foundational (T003).
3. Complete Phase 3: User Story 1 (T004 → T007).
4. **STOP and VALIDATE**: With CRD toggle on, the dialog renders, displays content, closes correctly, and shows the lock icon when unauthorized. Apply / contact / edit / guidelines features are intentionally inert at this checkpoint.
5. Open a draft PR for review of the dialog chrome and view enhancements.

### Incremental Delivery

1. Setup + Foundational + US1 → MVP demo.
2. Add US2 → Apply flow demo; verify all 8 membership state branches.
3. Add US3 → Contact host demo.
4. Add US4 → Edit affordances demo.
5. Add US5 → Community guidelines + nested "Read more" demo.
6. Polish → translations to all locales, lints, tests, MUI-cleanliness audits, manual test matrix, accessibility audit, regression verification.

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational + US1 together (US1 owns the foundational page rewrite).
2. Once US1 lands:
   - Developer A: US2 (largest, ~7 parallel files + 1 wiring task).
   - Developer B: US3 + US4 (small wiring tasks; could also handle US5).
   - Developer C: Begin Polish translation mirrors (T021–T025) in parallel with story work.
3. All converge for the manual test matrix and accessibility audit.

---

## Notes

- [P] tasks = different files, no dependencies on incomplete tasks.
- [Story] label maps task to specific user story for traceability.
- Each user story is independently completable and testable per the spec's "Independent Test" criteria.
- US1 is the foundational MVP — every other story layers onto its `CrdSpaceAboutPage` rewrite.
- Commit after each task or logical group.
- Stop at any checkpoint to validate the corresponding story independently.
- Avoid: vague tasks, same-file conflicts within a single phase (US2 page wiring T015 is intentionally serialized after T008–T014).
