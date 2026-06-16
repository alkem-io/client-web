---
description: "Task list for Guest whiteboard return notification (CRD)"
---

# Tasks: Guest whiteboard return notification (CRD)

**Input**: Design documents from `/specs/110-guest-whiteboard-notice/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/GuestReturnNotice.contract.ts, quickstart.md

**Tests**: INCLUDED — the plan and quickstart explicitly request unit + integration tests for the component and its conditional rendering.

**Organization**: Tasks are grouped by user story. The bulk of new code lands in User Story 1 (the component + i18n + integration); the remaining stories are primarily action-wiring confirmation + focused tests, because the navigation side effects are already provided by the existing `useGuestSessionReturn` hook (research D1).

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1–US4 maps to the user stories in spec.md

## Path Conventions

CRD presentational layer: `src/crd/`. Integration glue: `src/main/crdPages/auth/`. Reused domain logic: `src/domain/collaboration/whiteboard/guestAccess/`. Tests are co-located `*.test.tsx` (Vitest + jsdom).

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Orientation; confirm conventions before editing.

- [X] T001 Review target files and CRD conventions before editing: peer components `src/crd/components/auth/SignUpCard.tsx` and `LoginCard.tsx` (card shell + props style), `src/crd/components/auth/AuthCard.tsx` (shadow/padding tokens), the six locale files in `src/crd/i18n/auth/`, the integration point `CrdSignUpPage` in `src/main/crdPages/auth/SignUpCrdRoute.tsx`, and the existing hook `src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn.ts`. Confirm `crd-auth` is registered in `src/core/i18n/config.ts`.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Add the `crd-auth` `guestReturn.*` translation keys. The component renders no text without these, so every story depends on this phase.

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

Keys to add under a new `guestReturn` group: `title`, `description`, `backButton`, `websiteButton`, `contributeTitle`, `contributeDescription`. Inline the word "whiteboard" (no `$t(common.whiteboard)` — `crd-auth` is self-contained). Rewrite the contribute copy direction-neutral (drop "on the right" → e.g. "create an account below"). Source text: legacy `pages.public.whiteboard.guestSessionNotification.*`.

- [X] T002 [P] Add the `guestReturn` key group to `src/crd/i18n/auth/auth.en.json` (English source copy).
- [X] T003 [P] Add the `guestReturn` key group to `src/crd/i18n/auth/auth.nl.json` (port existing Dutch from the legacy `translation.nl.json` values).
- [X] T004 [P] Add the `guestReturn` key group to `src/crd/i18n/auth/auth.es.json` (port existing Spanish from the legacy `translation.es.json` values).
- [X] T005 [P] Add the `guestReturn` key group to `src/crd/i18n/auth/auth.bg.json` (port existing Bulgarian from the legacy `translation.bg.json` values).
- [X] T006 [P] Add the `guestReturn` key group to `src/crd/i18n/auth/auth.de.json` (write fresh German — legacy `translation.de.json` left these in English).
- [X] T007 [P] Add the `guestReturn` key group to `src/crd/i18n/auth/auth.fr.json` (write fresh French — legacy `translation.fr.json` left these in English).
- [X] T008 Verify key parity: all six `src/crd/i18n/auth/auth.<lang>.json` files contain exactly the same `guestReturn.*` keys, no missing/extra keys (depends on T002–T007).

**Checkpoint**: Translation keys exist in all six languages — component work can begin.

---

## Phase 3: User Story 1 - Guest sees the return notification (Priority: P1) 🎯 MVP

**Goal**: A guest with an active session sees the "You've left your whiteboard" card (title, reassurance description, both action buttons, and the "Want to contribute more?" hint) above the sign-up form; no session → no card, form unchanged.

**Independent Test**: Seed `sessionStorage` (`alkemio_guest_name` + `alkemio_guest_whiteboard_url`), open `/sign_up`, confirm the card renders with all elements; clear the keys, reload, confirm it's absent and the form is unchanged.

### Tests for User Story 1 ⚠️ (write first, ensure they FAIL before implementation)

- [X] T009 [P] [US1] Create `src/crd/components/auth/GuestReturnNotice.test.tsx`: rendering the component (with stub `onBackToWhiteboard`/`onGoToWebsite`) shows the title, description, both buttons (Back to whiteboard, Go to our website), and the contribute title + description from the `crd-auth` `guestReturn.*` keys; decorative icons carry `aria-hidden`.

### Implementation for User Story 1

- [X] T010 [US1] Create `src/crd/components/auth/GuestReturnNotice.tsx` implementing `GuestReturnNoticeProps` from `contracts/GuestReturnNotice.contract.ts`: card shell (`rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]`), `useTranslation('crd-auth')`, semantic typography tokens, primary `Button` (default variant, `ArrowLeft` from `lucide-react`) calling `onBackToWhiteboard`, secondary `Button` (`outline` variant) calling `onGoToWebsite`, and a highlighted contribute block with `ArrowRight`. Accessible names from `t()`, decorative icons `aria-hidden`, visible `focus-visible:ring`. No `@mui/*`, no business-logic imports.
- [X] T011 [US1] Wire the notice into `CrdSignUpPage` in `src/main/crdPages/auth/SignUpCrdRoute.tsx`: call `useGuestSessionReturn()`, wrap the existing `<SignUpCard …/>` and the new notice in `<div className="flex flex-col gap-6">` inside `AuthShellWrapper`, and render `<GuestReturnNotice onBackToWhiteboard={handleBackToWhiteboard} onGoToWebsite={handleGoToWebsite} />` above the card, gated on `shouldShowNotification`. (This wires BOTH handlers — consumed/verified by US2 and US3.)
- [X] T012 [US1] Add an integration test alongside `src/main/crdPages/auth/SignUpCrdRoute` (e.g. `SignUpCrdRoute.test.tsx`): with both guest session keys set the notice renders above the form; with either/both keys missing the notice is absent and the sign-up form renders unchanged (FR-001, FR-008, partial-session edge case).

**Checkpoint**: The notice appears for guests and is invisible otherwise — MVP complete and independently testable.

---

## Phase 4: User Story 2 - Guest returns to their whiteboard (Priority: P1)

**Goal**: Activating "Back to whiteboard" returns the guest to the stored whiteboard URL with the guest session intact.

**Independent Test**: With a session seeded for a known whiteboard URL, render the page/component, click "Back to whiteboard", confirm navigation targets that URL and the session keys are NOT cleared.

- [X] T013 [P] [US2] Add a test to `src/crd/components/auth/GuestReturnNotice.test.tsx`: clicking the "Back to whiteboard" button invokes `onBackToWhiteboard` exactly once and does not invoke `onGoToWebsite`.
- [X] T014 [US2] Verify the back action end-to-end in the `SignUpCrdRoute` integration test: clicking "Back to whiteboard" routes to the stored `alkemio_guest_whiteboard_url`, and the session keys remain set afterward (FR-003, FR-006). Confirm `handleBackToWhiteboard` from `useGuestSessionReturn` is the wired handler (no new navigation code in the CRD component).

**Checkpoint**: Return path works and preserves the guest identity.

---

## Phase 5: User Story 3 - Guest leaves for the public website (Priority: P2)

**Goal**: Activating "Go to our website" sends the guest to Alkemio's public site.

**Independent Test**: Render the component/page, trigger "Go to our website", confirm it calls the website handler (which navigates to the public site).

- [X] T015 [P] [US3] Add a test to `src/crd/components/auth/GuestReturnNotice.test.tsx`: clicking the "Go to our website" button invokes `onGoToWebsite` exactly once and does not invoke `onBackToWhiteboard`.
- [X] T016 [US3] Confirm `CrdSignUpPage` passes `handleGoToWebsite` from `useGuestSessionReturn` to the notice (wired in T011) and that the session is not cleared by this action (FR-004, FR-006). No new website-URL constant is introduced (research D5).

**Checkpoint**: Website exit path works.

---

## Phase 6: User Story 4 - Guest signs up and the notice is dismissed (Priority: P2)

**Goal**: After successful authentication the guest session is cleared, so the notice no longer appears on a later visit to the sign-up page.

**Independent Test**: With session keys cleared (simulating post-auth `clearAllGuestSessionData`), open `/sign_up`, confirm the notice does not render.

- [X] T017 [US4] Confirm FR-007 is satisfied by the existing cleanup with NO new clearing code: verify `clearAllGuestSessionData` (in `src/domain/collaboration/whiteboard/guestAccess/utils/sessionStorage.ts`) already runs on successful login/registration, and add/extend an assertion (in the `SignUpCrdRoute` integration test) that an empty/cleared session yields no notice. Ensure neither the CRD component nor T011's wiring calls `clearSession` (must not pre-empt FR-006).

**Checkpoint**: All four stories independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

> Polish covers cross-cutting concerns: linting, the full test run, CRD-purity + FR-013 guards, manual quickstart, and responsive (FR-011) verification.

- [X] T018 [P] Run `pnpm lint` (TypeScript + Biome + ESLint react-compiler rule) and fix any issues in the new/edited files.
- [X] T019 [P] Run `pnpm vitest run src/crd/components/auth/GuestReturnNotice.test.tsx src/main/crdPages/auth/SignUpCrdRoute.test.tsx --reporter=basic` and confirm green.
- [X] T020 Guard FR-013 + CRD purity: confirm `src/crd/components/auth/GuestReturnNotice.tsx` has zero `@mui/*`/`@emotion/*` and zero business-logic imports, and confirm the legacy MUI `src/core/auth/authentication/pages/SignUp.tsx` and `src/domain/collaboration/whiteboard/guestAccess/components/GuestSessionNotification.tsx` were NOT modified or deleted (deferred to the separate MUI auth-cleanup pass).
- [ ] T021 Run the `quickstart.md` manual verification (seed session → see notice; clear → gone; click both actions; switch all six languages; keyboard-tab focus rings).
- [ ] T022 Verify responsive usability (FR-011): with a guest session seeded, confirm at a narrow/mobile viewport (≤375px wide) and at desktop width that the stacked `GuestReturnNotice` + `SignUpCard` both remain fully readable and usable inside the `AuthShell` single-column slot — no clipping, horizontal scroll, button-label truncation, or overlap. Check both buttons remain tappable and text wraps cleanly in the longest-copy language (e.g. German/Bulgarian).

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies.
- **Foundational (Phase 2 — i18n keys)**: Depends on Setup. BLOCKS all user stories (the component renders no copy without keys). T008 depends on T002–T007.
- **User Story 1 (Phase 3)**: Depends on Phase 2. Delivers the component, integration, and the MVP. T010 → T009 (test written first to fail); T011 depends on T010; T012 depends on T011.
- **User Stories 2–4 (Phases 4–6)**: Depend on Phase 3 (the component + integration must exist). Each is independently testable but builds on the US1 wiring (which already passes both handlers).
- **Polish (Phase 7)**: Depends on all targeted stories being complete.

### User Story Dependencies

- **US1 (P1)**: After Foundational. The only story that creates new component/integration code.
- **US2 (P1)**: After US1 (needs the rendered button + wired handler). Independently testable via the back-action.
- **US3 (P2)**: After US1. Independently testable via the website-action. Independent of US2.
- **US4 (P2)**: After US1. Verification-only (reuses existing cleanup). Independent of US2/US3.

### Within Each User Story

- Tests written before implementation where new code is produced (US1).
- US2/US3/US4 are confirmation + focused tests over code that already exists (the `useGuestSessionReturn` hook + the US1 component/wiring).

### Parallel Opportunities

- **Phase 2**: T002–T007 (six locale files) all run in parallel; T008 after.
- **Phase 3**: T009 (test) authored in parallel with reading, but T010/T011/T012 are sequential (same files / dependency chain).
- **Cross-story tests**: T013 [P] and T015 [P] touch the same `GuestReturnNotice.test.tsx` as T009 — treat them as appends to one file (run after T009 lands; not parallel with each other if editing the same file simultaneously).
- **Phase 7**: T018 [P] and T019 [P] can run together. T020–T022 are manual/verification checks run after the implementation tasks land.

---

## Parallel Example: Phase 2 (i18n keys)

```bash
# Six locale files, no inter-dependencies — edit together:
Task: "Add guestReturn keys to src/crd/i18n/auth/auth.en.json"
Task: "Add guestReturn keys to src/crd/i18n/auth/auth.nl.json"
Task: "Add guestReturn keys to src/crd/i18n/auth/auth.es.json"
Task: "Add guestReturn keys to src/crd/i18n/auth/auth.bg.json"
Task: "Add guestReturn keys to src/crd/i18n/auth/auth.de.json"
Task: "Add guestReturn keys to src/crd/i18n/auth/auth.fr.json"
# then:
Task: "Verify key parity across all six auth.<lang>.json files"
```

---

## Implementation Strategy

### MVP First (User Story 1)

1. Phase 1: Setup (orientation).
2. Phase 2: Foundational i18n keys (all six languages) — CRITICAL, blocks everything.
3. Phase 3: User Story 1 — build `GuestReturnNotice`, wire into `CrdSignUpPage`, integration test.
4. **STOP and VALIDATE**: seed a guest session, confirm the notice appears on `/sign_up` and is absent otherwise.
5. This is a shippable increment — it already restores the visible notification with working actions (handlers come from the existing hook).

### Incremental Delivery

1. Setup + Foundational → keys ready.
2. US1 → notice visible + actions wired → **MVP / demo**.
3. US2 → back-to-whiteboard verified + tested.
4. US3 → go-to-website verified + tested.
5. US4 → post-auth dismissal verified.
6. Polish → lint, tests green, CRD-purity + FR-013 guard, quickstart pass, responsive (FR-011) verification.

---

## Notes

- The heavy lifting is US1; US2–US4 are deliberately thin because the navigation/session side effects pre-exist in `useGuestSessionReturn` (research D1) and the post-auth cleanup pre-exists in `sessionStorage.ts` (research D6). This is honest scope, not under-specification.
- Do NOT add new strings to the frozen legacy `translation` namespace (Constitution Arch #3).
- Do NOT delete or edit the dead MUI auth files in this feature (FR-013 → separate MUI auth-cleanup pass for Login + SignUp together).
- No `pnpm codegen` — this feature touches no GraphQL.
- Commit after each task or logical group; all commits signed.
