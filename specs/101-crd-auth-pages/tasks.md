# Tasks: CRD Authentication Pages

**Input**: Design documents from `/specs/101-crd-auth-pages/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Test tasks ARE included — per spec clarification `FR-023`, this migration matches the existing CRD-migration test pattern (unit tests on new CRD presentational components, integration tests on the new integration-layer route components / adapters). No end-to-end Kratos round-trip tests.

**Routing note**: `IdentityRoute.tsx` points each `/identity/*` auth route directly at its CRD route component — the auth routes are not conditional (authentication screens are shown before any user context exists; see spec Clarification 2026-05-21). The old MUI auth page components become orphaned dead code.

**Organization**: Tasks are grouped by user story (US1–US5) so each story is an independently testable, independently shippable increment.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on an incomplete task)
- **[Story]**: US1–US5; Setup / Foundational / Polish phases carry no story label
- Every task names an exact file path

## Path Conventions

- Design system (pure UI): `src/crd/`
- Integration / glue layer (MUI-free): `src/main/crdPages/auth/`
- Route wiring: `src/core/auth/authentication/routing/IdentityRoute.tsx`
- i18n registration: `src/core/i18n/config.ts`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Establish the i18n namespace and shared provider-customisation data every screen depends on.

- [X] T001 Create `src/crd/i18n/auth/auth.en.json` with the `crd-auth` namespace file structure and the **shared** English keys only — `fields.*` (email, password, firstName, lastName, showPassword, hidePassword), `continueWith`, `tagline`, `providers.*` (linkedin, microsoft, github, apple, cleverbase, plus a generic fallback label). Per-screen keys are added by their owning user-story task.
- [X] T002 Create `src/crd/i18n/auth/auth.{nl,es,bg,de,fr}.json` mirroring the English file's key structure (values translated in Phase 8).
- [X] T003 Register the `crd-auth` namespace in the `crdNamespaceImports` registry in `src/core/i18n/config.ts` (all six languages; decide eager vs lazy English load — match `crd-layout` if a first-paint flash is observed).
- [X] T004 [P] Add the `crd-auth` namespace + key types to the i18next type declarations in `@types/i18next.d.ts` so `t()` calls are type-checked.
- [X] T005 [P] Create the MUI-free shared map of `SocialProviderCustomization` (providerKey, iconSrc, sortOrder) for linkedin / microsoft / github / apple / cleverbase, lifted from `KratosSocialButton.tsx`. **Placed in `src/core/auth/authentication/socialProviderCustomizations.ts`** (not `src/main/crdPages/auth/` as the plan stated) so the MUI `KratosSocialButton` can import it without a `core → main` layering inversion.
- [X] T006 Refactor `src/core/auth/authentication/components/Kratos/KratosSocialButton.tsx` to source provider `sortOrder` from `src/core/auth/authentication/socialProviderCustomizations.ts` (single source of truth for provider ordering; MUI icon rendering unchanged).

**Checkpoint**: i18n namespace registered, provider customisation data shared. No screens yet.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Build every shared building block — layout shell, form-field wrappers, the flow renderer, the descriptor adapter, the passkey-trigger utility. **Every user story depends on this phase.**

**⚠️ CRITICAL**: No user-story work can begin until this phase is complete.

### Contracts, adapter & integration utilities

- [X] T007 [P] Create `src/main/crdPages/auth/flowDescriptor.ts` with the `KratosFlowDescriptor` type and all sub-types (including `KratosPasskeyTrigger`), copied verbatim from `specs/101-crd-auth-pages/contracts/flow-descriptor.ts`.
- [X] T008 Implement `src/main/crdPages/auth/flowDescriptorAdapter.ts` — converts a Kratos `LoginFlow | RegistrationFlow | RecoveryFlow | VerificationFlow` into a `KratosFlowDescriptor`: bucket every `flow.ui.nodes` entry (hidden / default / password / rest / submit / oidc / passkey / passkeyCredentials), pre-sort OIDC by `sortOrder`, pre-resolve passkey trigger flavour, attach `SocialProviderCustomisation`. Unknown groups fall back to `rest`. (Depends on T005, T007.)
- [X] T009 [P] Implement `src/main/crdPages/auth/passkeyTrigger.ts` — given a `KratosPasskeyTrigger`, invoke the matching browser/Kratos passkey routine (`window.__oryPasskeyLogin` / `__oryPasskeyRegistration` / etc.), mirroring the MUI `KratosPasskeyButton` logic: script-loaded check, browser-support check, and the not-supported / script-not-loaded / ceremony-failed error states (returned/thrown so the route can surface them). (Depends on T007.)
- [X] T010 Audit complete — the MUI auth pages emit **no** auth-specific analytics events; their only observability is `useTransactionScope({ type: 'authentication' })` for APM. No `useAuthAnalytics.ts` is needed; the APM transaction scope is called directly in each CRD route component (`SignInCrdRoute`). Parity holds — same events as MUI = none.

### CRD form-field wrappers (`src/crd/forms/`)

- [X] T011 [P] Create `src/crd/forms/EmailField.tsx` — labelled email input with error rendering and `aria-describedby` wiring, props per `EmailFieldProps` in `contracts/crd-auth-components.ts`.
- [X] T012 [P] Create `src/crd/forms/PasswordField.tsx` — labelled password input with a keyboard-operable `lucide-react` eye-icon show/hide toggle (visual-only `useState`), accessible toggle label, error rendering, props per `PasswordFieldProps`.
- [X] T013 [P] Create `src/crd/forms/TextInputField.tsx` — labelled text input (First/Last Name), props per `TextInputFieldProps`.
- [X] T014 [P] Create `src/crd/forms/AcceptTermsCheckbox.tsx` — checkbox with a `ReactNode` rich-content label slot (consumer injects Terms/Privacy links), error rendering, props per `AcceptTermsCheckboxProps`.

### CRD shared auth components (`src/crd/components/auth/`)

- [X] T015 [P] Create `src/crd/components/auth/AuthCardHeader.tsx` — Alkemio logo + "Safe Spaces for Collaboration" tagline + contextual cross-link, props per `AuthCardHeaderProps`.
- [X] T016 [P] Create `src/crd/components/auth/SocialProviderButton.tsx` — circular icon-only button (tooltip + `aria-label` + focus ring); renders the `Globe` lucide-react icon as the fallback when no provider customisation is supplied; props per `SocialProviderButtonProps`.
- [X] T017 [P] Create `src/crd/components/auth/OrContinueWithDivider.tsx` — horizontal rule with a centred translated label, props per `OrContinueWithDividerProps`.

### CRD layout shell (`src/crd/layouts/`)

- [X] T018 Create `src/crd/layouts/AuthShell.tsx` — full-bleed background (`/alkemio-banner/global-banner.svg`), right-aligned card slot, footer (Terms/Privacy/Security/Support/About + language switcher), optional floating help-button slot, responsive single-column collapse at small viewports, props per `AuthShellProps`. Verify the existing CRD `Footer` works without an authenticated user; extract a minimal anonymous-safe footer if it does not.

### CRD flow renderer (`src/crd/components/auth/`)

- [X] T019 Create `src/crd/components/auth/CrdKratosFlow.tsx` — renders a `KratosFlowDescriptor` reproducing the MUI `KratosUI` node-grouping & ordering (hidden → messages → beforeInputs → default → password → resetPassword link → rest → children → submit → "or" divider → passkey credentials → passkey/OIDC row), with the `flowType`-dependent login-icon-row vs. registration-full-width-row split. Uses the form-field wrappers, `SocialProviderButton`, `OrContinueWithDivider`. Wires each passkey button's activation to the `onPasskeyTrigger` prop (the component never touches `window.__oryPasskey*`). Props per `CrdKratosFlowProps`; analytics surfaced as callback props. (Depends on T007, T011–T014, T016, T017.)

### Integration shell wrapper

- [X] T020 Create `src/main/crdPages/auth/AuthShellWrapper.tsx` — mounts `AuthShell`, derives `languages` from `supportedLngs`, wires `onLanguageChange` to `i18n.changeLanguage`, supplies footer link hrefs and the floating help button. (Depends on T018.)

### Foundational tests

- [ ] T021 [P] Unit test `src/crd/forms/PasswordField.test.tsx` — show/hide toggle flips input type, toggle is keyboard-operable, accessible label updates.
- [ ] T022 [P] Unit test `src/crd/forms/AcceptTermsCheckbox.test.tsx` — checked state, `onChange`, rich-label render, error render.
- [ ] T023 [P] Unit test `src/crd/components/auth/CrdKratosFlow.test.tsx` — correct node groups render per `flowType`; login renders OIDC/passkey as an icon row, registration as full-width buttons; activating a passkey button invokes `onPasskeyTrigger` with the node's resolved trigger; `submitDisabled` / `submitLabelOverride` honoured.
- [ ] T024 [P] Unit test `src/crd/layouts/AuthShell.test.tsx` — background, card slot, footer, language switcher all render; responsive collapse class applied.
- [ ] T025 [P] Integration test `src/main/crdPages/auth/__tests__/flowDescriptorAdapter.test.ts` — a representative LoginFlow, RegistrationFlow, RecoveryFlow each bucket correctly; OIDC pre-sorted; passkey trigger resolved; unknown group falls back to `rest`.
- [ ] T026 [P] Integration test `src/main/crdPages/auth/__tests__/passkeyTrigger.test.ts` — each `KratosPasskeyTrigger` dispatches to the correct `window.__oryPasskey*` global (mocked); the not-supported and script-not-loaded paths surface the expected error.

**Checkpoint**: Shell, form fields, flow renderer, adapter, passkey-trigger utility, analytics, and their tests all exist. User-story implementation can now begin.

---

## Phase 3: User Story 1 - Sign in with email and password (Priority: P1) 🎯 MVP

**Goal**: Any visitor can sign in (email/password, social, or passkey) inside the CRD shell, with parity to the old MUI flow including `returnUrl` redirect and the account-lockout message.

**Independent Test**: Sign out, visit `/identity/login`, sign in with valid credentials → redirected to the home / `?returnUrl=` target. Invalid credentials → inline error. Visual parity with the sign-in screenshot.

### Implementation for User Story 1

- [X] T027 [P] [US1] Create `src/crd/components/auth/SignInCard.tsx` — composes `AuthCardHeader` (title "Sign in", "No account? Sign up" link) + `CrdKratosFlow` (flowType `login`) + "Forgot password?" link; props per `SignInCardProps`; loading skeleton when `isLoading`.
- [X] T028 [US1] Create `src/main/crdPages/auth/SignInCrdRoute.tsx` — calls `useKratosFlow(FlowTypeName.Login)`, runs `flowDescriptorAdapter`, resolves `returnUrl` and `signUpHref` / `forgotPasswordHref`, wires `useAuthAnalytics`, binds `onPasskeyTrigger` to `passkeyTrigger.ts` and surfaces passkey errors in the card, ports the account-lockout message special-case (Kratos message id `9000429`) from `LoginPage.tsx`, wraps `SignInCard` in `AuthShellWrapper` and in the same `WithApmTransaction path="/identity/login"` the MUI route uses. (Depends on T008, T009, T010, T019, T020, T027.)
- [X] T029 [US1] Modify `src/core/auth/authentication/routing/IdentityRoute.tsx` — point the `login` route (`/login/*`, preserving sub-path matching and existing route wrappers) directly at `<SignInCrdRoute />`. The route is not conditional. `LoginRoute` / `LoginPage` become orphaned dead code.
- [X] T030 [P] [US1] Add the English `signIn.*` keys (title, submit, forgotPassword, noAccount, signUp link) to `src/crd/i18n/auth/auth.en.json`.
- [ ] T031 [P] [US1] Unit test `src/crd/components/auth/SignInCard.test.tsx` — renders email + password + submit + forgot-password link; loading skeleton; invokes analytics callbacks.
- [ ] T032 [US1] Integration test `src/main/crdPages/auth/__tests__/SignInCrdRoute.test.tsx` — the route component mounts and maps the adapted descriptor into `SignInCard`; flow-error messages render; the lockout message id `9000429` produces the special-case copy.

**Checkpoint**: Sign-in works end-to-end in the CRD shell. This is the MVP.

---

## Phase 4: User Story 2 - Create a new account (Priority: P2)

**Goal**: Any visitor can register via both `/identity/sign_up` (curated quick path) and `/identity/registration` (full Kratos flow), with the Terms-of-Use gate and the accepted-terms persistence working.

**Independent Test**: Visit `/identity/sign_up`, the "Next" button stays disabled until the checkbox is checked + fields valid; complete it → email-verification screen. Trigger a validation error → the accepted-terms checkbox stays checked. Visual parity with the sign-up screenshot.

### Implementation for User Story 2

- [X] T033 [P] [US2] Create `src/crd/components/auth/SignUpCard.tsx` — `AuthCardHeader` (title "Sign up", "Have an account? Sign in"), intro paragraph with Terms/Privacy links, `AcceptTermsCheckbox`, `CrdKratosFlow` (flowType `registration`, curated nodes), disabled "Next" until terms accepted + valid; props per `SignUpCardProps`.
- [X] T034 [P] [US2] Create `src/crd/components/auth/RegistrationCard.tsx` — same shell as `SignUpCard` but renders the full Kratos registration flow; supports the `mustAcceptTerms` gate-vs-form switch; props per `RegistrationCardProps`.
- [X] T035 [US2] Create `src/main/crdPages/auth/SignUpCrdRoute.tsx` — `useKratosFlow(FlowTypeName.Registration)`, curated-node filtering (CSRF + email + first/last name + OIDC + submit), the accepted-terms sessionStorage-by-flow-id workaround, `returnUrl` via `useSignUpReturnUrl`/`useGuestSessionReturn`, analytics, `onPasskeyTrigger` bound to `passkeyTrigger.ts`, `AuthShellWrapper`, `WithApmTransaction path="/identity/sign_up"`. (Depends on T008, T009, T010, T019, T020, T033.)
- [X] T036 [US2] Create `src/main/crdPages/auth/RegistrationCrdRoute.tsx` — `useKratosFlow(FlowTypeName.Registration)` full flow, the same accepted-terms workaround, analytics, `onPasskeyTrigger` bound to `passkeyTrigger.ts`, `AuthShellWrapper`, `WithApmTransaction path="/identity/registration"`. (Depends on T008, T009, T010, T019, T020, T034.)
- [X] T037 [US2] Modify `src/core/auth/authentication/routing/IdentityRoute.tsx` — point the `sign_up` route (keeping the `<NotAuthenticatedRoute>` wrapper) directly at `<SignUpCrdRoute />` and the `registration/*` route directly at `<RegistrationCrdRoute />`. No dispatch. `SignUp` / `RegistrationRoute` / `RegistrationPage` become orphaned. (Sequential after T029 — same file.)
- [X] T038 [US2] Add the `signUp.*` keys to all six `crd-auth` files (title, intro + acceptTerms with `<terms>`/`<privacy>` tags, haveAccount, signIn). All six languages (en, nl, es, bg, de, fr) populated and key-parity verified.
- [ ] T039 [P] [US2] Unit test `src/crd/components/auth/SignUpCard.test.tsx` — "Next" disabled until checkbox + fields valid; Terms/Privacy links present; analytics callbacks.
- [ ] T040 [US2] Integration test `src/main/crdPages/auth/__tests__/SignUpCrdRoute.test.tsx` — the accepted-terms checkbox survives a simulated validation-error re-render (sessionStorage workaround); the route component mounts and maps the descriptor into `SignUpCard`.

**Checkpoint**: Both registration entry points work end-to-end in the CRD shell.

---

## Phase 5: User Story 3 - Recover a forgotten password (Priority: P3)

**Goal**: Any visitor can request password recovery, follow the email link, and set a new password — inside the CRD shell, with the two-stage email→code flow and the 30-second cooldown preserved.

**Independent Test**: From CRD sign-in click "Forgot password?", submit an email → cooldown countdown appears on the button; receive the email, follow the link → CRD set-new-password screen; submit a valid password → signed in. Visual parity with the password-recovery screenshot.

### Implementation for User Story 3

- [X] T041 [P] [US3] Create `src/crd/components/auth/PasswordRecoveryCard.tsx` — `AuthCardHeader` (title "Password recovery", "No account? Sign up"), intro copy, email field, "Continue" button honouring `isInCooldown` + `cooldownSecondsRemaining`; props per `PasswordRecoveryCardProps`.
- [X] T042 [P] [US3] Create `src/crd/components/auth/PasswordRecoveryCodeCard.tsx` — second-stage code-input screen; props per `PasswordRecoveryCodeCardProps`.
- [X] T043 [P] [US3] Create `src/crd/components/auth/SetNewPasswordCard.tsx` — post-recovery password-reset screen using `PasswordField`; props per `SetNewPasswordCardProps`.
- [X] T044 [US3] Create `src/main/crdPages/auth/PasswordRecoveryCrdRoute.tsx` — `useKratosFlow(FlowTypeName.Recovery)`, detect email-vs-code stage, port the 30-second sessionStorage cooldown logic from `RecoveryPage.tsx`, render `PasswordRecoveryCard` / `PasswordRecoveryCodeCard` / `SetNewPasswordCard` accordingly, analytics, `AuthShellWrapper`, `WithApmTransaction path="/identity/recovery"`. (Depends on T008, T010, T019, T020, T041, T042, T043.)
- [X] T045 [US3] Modify `src/core/auth/authentication/routing/IdentityRoute.tsx` — point the `recovery` route directly at `<PasswordRecoveryCrdRoute />`. No dispatch. `RecoveryRoute` / `RecoveryPage` become orphaned. (Sequential after T037 — same file.)
- [X] T046 [P] [US3] Add the English `recovery.*` keys (recovery.title, recovery.intro, recovery.continue, recovery.codeStage.*, recovery.cooldown) to `src/crd/i18n/auth/auth.en.json`.
- [ ] T047 [P] [US3] Unit test `src/crd/components/auth/PasswordRecoveryCard.test.tsx` — button disabled + cooldown label rendered while `isInCooldown`; email field + submit render.
- [ ] T048 [US3] Integration test `src/main/crdPages/auth/__tests__/PasswordRecoveryCrdRoute.test.tsx` — cooldown surfaces `submitDisabled=true`; email-stage vs code-stage selection driven by the descriptor.

**Checkpoint**: Full recovery + reset round-trip works in the CRD shell.

---

## Phase 6: User Story 4 - Verify a new email address (Priority: P3)

**Goal**: Any visitor sees CRD-styled email-verification and verification-reminder screens and can complete verification inside the CRD shell.

**Independent Test**: Complete a fresh CRD sign-up → CRD "verify your email" screen; follow the verification link → verification completes in the CRD shell. Revisit unverified → CRD reminder screen.

### Implementation for User Story 4

- [X] T049 [P] [US4] Create `src/crd/components/auth/EmailVerificationCard.tsx` — verification screen rendering the verification flow (`CrdKratosFlow` flowType `verification`) plus the resolved `continueHref`; props per `EmailVerificationCardProps`.
- [X] T050 [P] [US4] Create `src/crd/components/auth/EmailVerificationRequiredCard.tsx` — the "please verify your email" reminder (logo + title + notice, optional `returnUrl`); props per `EmailVerificationRequiredCardProps`.
- [X] T051 [US4] Create `src/main/crdPages/auth/EmailVerificationCrdRoute.tsx` — `useKratosFlow(FlowTypeName.Verification)`, resolve `continueHref` from `flow.ui.action` / stored returnUrl, analytics, `AuthShellWrapper`, `WithApmTransaction path="/identity/verify"`. (Depends on T008, T010, T019, T020, T049.)
- [X] T052 [US4] Create `src/main/crdPages/auth/EmailVerificationRequiredCrdRoute.tsx` — reads the stored returnUrl, wraps `EmailVerificationRequiredCard` in `AuthShellWrapper`. (Depends on T020, T050.)
- [X] T053 [US4] Modify `src/core/auth/authentication/routing/IdentityRoute.tsx` — point the `verify/*` route (verification + `/verify/reminder`) directly at the CRD verification route components. No dispatch. `VerifyRoute` / `VerificationPage` / `EmailVerificationRequiredPage` become orphaned. (Sequential after T045 — same file.)
- [X] T054 [P] [US4] Add the English `verification.*` and `verificationReminder.*` keys to `src/crd/i18n/auth/auth.en.json`.
- [ ] T055 [P] [US4] Unit test `src/crd/components/auth/EmailVerificationRequiredCard.test.tsx` — renders title + notice; shows returnUrl when present, omits it when absent.
- [ ] T056 [US4] Integration test `src/main/crdPages/auth/__tests__/EmailVerificationCrdRoute.test.tsx` — the route component mounts; `continueHref` resolved from the flow.

**Checkpoint**: Verification + reminder work in the CRD shell.

---

## Phase 7: User Story 5 - Encounter an auth-flow error (Priority: P4)

**Goal**: Any visitor reaching `/identity/error` sees a CRD-styled error card with the same message and recovery action as the old MUI version.

**Independent Test**: Force an auth error (stale recovery link, OIDC cancel) → arrive at `/identity/error?id=...` → CRD error card renders inside the auth shell with a "back to sign in" action.

### Implementation for User Story 5

- [X] T057 [P] [US5] Create `src/crd/components/auth/AuthErrorCard.tsx` — error card showing `errorCode` / `errorMessage` / `errorReason` + a "back to sign in" link; loading skeleton; props per `AuthErrorCardProps`.
- [X] T058 [US5] Create `src/main/crdPages/auth/AuthErrorCrdRoute.tsx` — reads `?id=` query param, fetches the Kratos error object the same way `ErrorRoute.tsx` does, wraps `AuthErrorCard` in `AuthShellWrapper`, `WithApmTransaction path="/identity/error"`. (Depends on T020, T057.)
- [X] T059 [US5] Modify `src/core/auth/authentication/routing/IdentityRoute.tsx` — point the `error` route directly at `<AuthErrorCrdRoute />`. No dispatch. The MUI `ErrorRoute` becomes orphaned. (Sequential after T053 — same file.)
- [X] T060 [P] [US5] Add the English `error.*` keys (error.title, error.backToSignIn) to `src/crd/i18n/auth/auth.en.json`.
- [ ] T061 [P] [US5] Unit test `src/crd/components/auth/AuthErrorCard.test.tsx` — renders error fields + back-to-sign-in link; loading skeleton.

**Checkpoint**: All five user stories are functional in the CRD shell.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Translations, observability parity verification, accessibility audit, and regression smoke checks.

- [X] T062 [P] Translate every `crd-auth` key into Dutch — `src/crd/i18n/auth/auth.nl.json`.
- [X] T063 [P] Translate every `crd-auth` key into Spanish — `src/crd/i18n/auth/auth.es.json`.
- [X] T064 [P] Translate every `crd-auth` key into Bulgarian — `src/crd/i18n/auth/auth.bg.json`.
- [X] T065 [P] Translate every `crd-auth` key into German — `src/crd/i18n/auth/auth.de.json`.
- [X] T066 [P] Translate every `crd-auth` key into French — `src/crd/i18n/auth/auth.fr.json`.
- [X] T067 Verify no `crd-auth` key is missing or empty in any of the six language files (key-parity check across `src/crd/i18n/auth/*.json`).
- [X] T068 Observability parity audit: confirm each CRD route emits the same APM transaction name and the same analytics events as its MUI counterpart (compare `src/main/crdPages/auth/*` against the MUI pages side by side); fix any drift.
- [X] T069 Accessibility audit across all CRD auth screens — keyboard-only walkthrough, visible focus rings, `aria-describedby` on every field error, accessible names on icon-only social/passkey buttons, `aria-busy` on submitting buttons, contrast against the constellation background; fix WCAG 2.1 AA gaps.
- [X] T070 Verify CRD-layer hard restrictions across `src/crd/components/auth/`, `src/crd/forms/`, `src/crd/layouts/AuthShell.tsx` — zero `@mui/*` / `@emotion/*` / `@apollo/*` / `@/core/auth/*` / `react-router-dom` / `formik` imports, zero GraphQL/Kratos types in props.
- [X] T071 Run `pnpm lint` and `pnpm vitest run`; fix any type, Biome, ESLint, or test failures.
- [ ] T072 Manual verification per `quickstart.md` — walk every CRD auth screen (every visitor gets them); then sign in and confirm the post-login application still loads correctly. This feature does not touch the authenticated app shell, so this is just a regression smoke check.

---

## Dependencies & Execution Order

### Phase dependencies

- **Setup (Phase 1)**: no dependencies — start immediately.
- **Foundational (Phase 2)**: depends on Setup. **Blocks every user story.**
- **US1 (Phase 3)**: depends on Foundational. This is the MVP.
- **US2 (Phase 4)**: depends on Foundational. Independent of US1 except the shared `IdentityRoute.tsx` edit (T037 after T029).
- **US3 (Phase 5)**: depends on Foundational. `IdentityRoute.tsx` edit (T045 after T037).
- **US4 (Phase 6)**: depends on Foundational. `IdentityRoute.tsx` edit (T053 after T045).
- **US5 (Phase 7)**: depends on Foundational. `IdentityRoute.tsx` edit (T059 after T053).
- **Polish (Phase 8)**: depends on all user stories whose strings/screens it covers.

### Critical-path note

`src/core/auth/authentication/routing/IdentityRoute.tsx` is edited by T029, T037, T045, T053, T059 — these five tasks touch the **same file** and must run **sequentially in that order**, even though their respective user stories are otherwise independent. Each points one or more `/identity/*` auth routes directly at their CRD route component (the auth routes are not conditional).

### Within-story dependencies

- US1: T027 → T028 → T029; T030/T031 parallel; T032 after T028.
- US2: T033/T034 parallel → T035/T036 → T037; T038/T039 parallel; T040 after T035.
- US3: T041/T042/T043 parallel → T044 → T045; T046/T047 parallel; T048 after T044.
- US4: T049/T050 parallel → T051/T052 → T053; T054/T055 parallel; T056 after T051.
- US5: T057 → T058 → T059; T060/T061 parallel.

## Parallel Execution Examples

**Phase 2 form fields + shared components** (after T007–T010):
```
T011 EmailField · T012 PasswordField · T013 TextInputField · T014 AcceptTermsCheckbox
T015 AuthCardHeader · T016 SocialProviderButton · T017 OrContinueWithDivider
```
all run in parallel — distinct files, no inter-dependencies.

**Phase 2 tests** (after their subjects exist):
```
T021 · T022 · T023 · T024 · T025 · T026
```

**Phase 8 translations**:
```
T062 nl · T063 es · T064 bg · T065 de · T066 fr
```
all run in parallel — distinct files.

## Implementation Strategy

### MVP (minimum shippable)

Setup + Foundational + **US1 only** (T001–T032). At this point any visitor can sign in (password, social, or passkey) through the CRD shell. Demo-able and independently valuable.

### Incremental delivery

1. Setup + Foundational → shared building blocks proven.
2. + US1 → **MVP**: CRD sign-in. Ship / demo.
3. + US2 → CRD registration (both routes).
4. + US3 → CRD password recovery + reset.
5. + US4 → CRD email verification.
6. + US5 → CRD auth-error fallback.
7. + Polish → all six languages, observability + a11y verified, regression smoke check.

Each story checkpoint is a coherent increment that leaves the auth surface in a working state (CRD for migrated routes, MUI for the rest).

### Task summary

- **Total tasks**: 72
- **Setup**: 6 (T001–T006)
- **Foundational**: 20 (T007–T026)
- **US1 (P1, MVP)**: 6 (T027–T032)
- **US2 (P2)**: 8 (T033–T040)
- **US3 (P3)**: 8 (T041–T048)
- **US4 (P3)**: 8 (T049–T056)
- **US5 (P4)**: 5 (T057–T061)
- **Polish**: 11 (T062–T072)
- **Parallelizable tasks** (`[P]`): 39
