# Research: CRD Authentication Pages

**Branch**: `101-crd-auth-pages`
**Date**: 2026-05-20

## Purpose

Resolve every plan-level unknown before task generation. Each decision below is recorded as **Decision / Rationale / Alternatives** per the speckit convention.

---

## R-1: MUI Auth Surface — what we are migrating from

**Decision**: Treat the live MUI implementation as the behavioural source of truth and migrate every `/identity/*` route that today renders an MUI screen, except `/identity/required` (already on CRD via `CrdAuthRequiredRoute`).

**Routes in scope**:

| Path | MUI page component | What it does |
|------|--------------------|--------------|
| `/identity/login` (+ `/login/success`) | `LoginPage.tsx` → `LoginRoute.tsx` | Sign-in via Kratos login flow. Captures `returnUrl` to sessionStorage. Renders the full `KratosUI` against the login flow. |
| `/identity/registration` (+ `/registration/success`) | `RegistrationPage.tsx` → `RegistrationRoute.tsx` | Full Kratos registration flow. Includes the `acceptedTerms` sessionStorage workaround (Kratos resets the checkbox on validation error). |
| `/identity/sign_up` | `SignUp.tsx` (wrapped in `<NotAuthenticatedRoute>`) | Curated quick-registration page — only renders CSRF, email, firstName, lastName, terms checkbox, OIDC, submit (no password field shown). |
| `/identity/recovery` | `RecoveryPage.tsx` → `RecoveryRoute.tsx` | Two-stage password recovery: email → code. 30-second client-side cooldown on email resubmission, stored in sessionStorage. |
| `/identity/verify` (+ `/verify/reminder`) | `VerificationPage.tsx` + `EmailVerificationRequiredPage.tsx` → `VerifyRoute.tsx` | Email-verification flow + the "please verify" reminder. |
| `/identity/error` | `ErrorRoute.tsx` | Auth-error fallback — fetches the error object from Kratos by `?id=`. |
| `/identity/required` | **already on CRD** (`CrdAuthRequiredRoute`) | **Out of scope** per spec clarification — not touched. |
| `/identity/settings` | `SettingsRoute.tsx` | **Out of scope** — protected identity-settings flow, covered by separate migration. |

**Rationale**: This is the precise enumeration the spec's `FR-001` lists. Every URL must keep its path because Kratos-issued emails contain these URLs.

**Alternatives considered**: Migrate only the highest-traffic screens (sign-in + sign-up) and defer recovery/verification. Rejected — leaves CRD users dropping into MUI mid-flow when they follow an email link, which is the most jarring break and explicitly called out in the spec's success criteria.

---

## R-2: Kratos data layer — what we reuse vs. what we touch

**Decision**: Reuse the existing data layer wholesale. The integration layer under `src/main/crdPages/auth/` imports:

- `useKratosFlow(FlowTypeName, flowId)` from `src/core/auth/authentication/hooks/useKratosFlow.ts`
- `useReturnUrl`, `useGetReturnUrl`, `useSignUpReturnUrl` for return-URL handling
- `useGuestSessionReturn` from the existing guest-session flow
- `usePageTitle`, `useQueryParams`, `useTranslation` from their existing locations
- The hard-coded `socialCustomizations` map currently in `KratosSocialButton.tsx` (extracted to a shared file so both MUI and CRD use the same map)

**No new hooks are introduced for data fetching, return-URL handling, or session management.**

**Rationale**: Behaviour parity (FR-009, FR-014, FR-015) is impossible to guarantee if the CRD layer reimplements any of this. Reusing the hooks also keeps the cooldown logic, the accepted-terms workaround, and any cross-tab session handling in exactly one place.

**Alternatives considered**: Copy the hooks into `src/main/crdPages/auth/`. Rejected — duplication risk; the MUI screens would drift if any of the hooks needs a fix.

---

## R-3: Flow-descriptor adapter — bridging Kratos types into the CRD layer

**Decision**: Build `src/main/crdPages/auth/flowDescriptorAdapter.ts` that maps a Kratos `LoginFlow | RegistrationFlow | RecoveryFlow | VerificationFlow` into a plain TS `KratosFlowDescriptor` (defined in `contracts/flow-descriptor.ts`). The CRD layer never imports `@ory/kratos-client`.

**Adapter responsibilities**:

1. Read `flow.ui.nodes`, `flow.ui.action`, `flow.ui.method`, `flow.ui.messages`.
2. Categorise each node into one of the same buckets `KratosUI` uses today: `hidden`, `default`, `password`, `passkey`, `passkeyCredentials`, `oidc`, `submit`, `rest`.
3. Normalise into plain TS shapes: each node becomes `{ name, type, value, label, required, disabled, group, kind, attributes, messages }` — no `UiNode` types leak.
4. Resolve passkey trigger flavour (`oryPasskeyLogin` / `oryPasskeyRegistration` / etc.) up-front so the CRD component does not need to know about Ory globals.
5. Apply the same `socialCustomizations` lookup for OIDC nodes (icon + sortOrder + display label).

**Output shape** lives in `contracts/flow-descriptor.ts`.

**Passkey invocation (companion to step 4)**: The adapter only *resolves* the passkey trigger flavour — it does not *invoke* it. A passkey button is not a plain form submit; it starts a browser WebAuthn ceremony via Ory-injected globals (`window.__oryPasskeyLogin` / `__oryPasskeyRegistration` / etc.). Invocation is a separate integration-layer concern: `src/main/crdPages/auth/passkeyTrigger.ts` maps a resolved `KratosPasskeyTrigger` to the matching global, mirroring the MUI `KratosPasskeyButton` logic (script-loaded check, browser-support check, error states). The CRD `CrdKratosFlow` component exposes an `onPasskeyTrigger(trigger)` callback prop; the integration route binds it to `passkeyTrigger.ts`. This keeps the CRD layer free of `window.__oryPasskey*` while still delivering passkey parity (`FR-012`).

**Rationale**: Honours the CRD hard restriction "no business logic in `src/crd/`, no GraphQL/Kratos types in props". The adapter is the single boundary; if Kratos changes its shape in a future version, the adapter is the only file that breaks.

**Alternatives considered**:

- (a) Let the CRD `CrdKratosFlow` consume `UiNode[]` directly via a generic-typed prop. Rejected — violates the `src/crd/CLAUDE.md` golden rule "props are plain TypeScript, no GraphQL/library types".
- (b) Recategorise nodes inside the CRD layer. Rejected — same violation.
- (c) Build a custom hook `useKratosFlowDescriptor()` that wraps `useKratosFlow` and returns the descriptor directly. Considered, will likely happen as a small helper inside the integration layer, but kept as a private function inside each `*CrdRoute.tsx` rather than a separately exported hook to avoid premature abstraction across screens that have slightly different needs (e.g., recovery's cooldown).

---

## R-4: `CrdKratosFlow` — the centrepiece component

**Decision**: Build `src/crd/components/auth/CrdKratosFlow.tsx` as a pure presenter of a `KratosFlowDescriptor`. It owns:

- The same group-by-node-type rendering order MUI's `KratosUI` uses (see the inventory from clarification: hidden → messages → beforeInputs → default → password → resetPassword link → rest → children → submit → "or" divider → passkey credentials → passkey buttons → OIDC).
- The `flowType` prop (`'login' | 'registration' | 'recovery' | 'verification'`) that switches between the login icon-row layout and the registration full-width-row layout for OIDC/passkey.
- Slot props for `beforeInputs`, `resetPasswordElement`, `children`, `acceptTermsComponent`, `submitDisabled`, `submitLabelOverride`, `disableInputs` — exactly matching the MUI `KratosUI` extension points so every quirk (sign-up's curated row, recovery's cooldown label override, the accepted-terms slot) can be reproduced.
- Form rendering as a native `<form action={descriptor.action} method={descriptor.method}>` — same submission mechanism MUI uses (Kratos handles the POST).

**No new React state inside `CrdKratosFlow`** beyond visual toggles (`isPasswordVisible` for any nested `PasswordField`; the field itself owns that).

**Rationale**: Matches FR-008 ("must match the screenshots") and FR-011 ("provider order matches MUI") by construction. Reuses the exact contract MUI consumers already know.

**Alternatives considered**: Split into one component per flow type (`SignInForm`, `RegistrationForm`, etc.). Rejected — leads to four near-identical files and re-encodes the node-grouping logic four times. The single `CrdKratosFlow` with a `flowType` discriminator is closer to the MUI structure (one `KratosUI` for all flows) and prevents drift.

---

## R-5: AuthShell layout

**Decision**: Build `src/crd/layouts/AuthShell.tsx`. Props:

```ts
type AuthShellProps = {
  children: ReactNode;                                  // the auth card content
  languages: { code: string; label: string }[];
  currentLanguage: string;
  onLanguageChange: (code: string) => void;
  footerLinks: CrdFooterLinks;                          // terms/privacy/security/support/about
  helpButton?: ReactNode;                               // optional floating help button slot
  backgroundImageSrc?: string;                          // defaults to /alkemio-banner/global-banner.svg
};
```

**Layout**:
- Outer: `flex flex-col min-h-screen relative`.
- Background: absolutely positioned `<img>` (or CSS background) at the top of the viewport, behind the card. Reuses `public/alkemio-banner/global-banner.svg`.
- Main: flex row, right-aligned card slot at desktop, centered/stacked at mobile.
- Footer: the existing CRD `Footer` component **only if its props allow operation without a signed-in user** — otherwise extract a footer subset compatible with anonymous use.
- Optional floating help button slot positioned bottom-right.

**Rationale**: One shell, every auth screen. Visual parity by construction (FR-005, FR-006).

**Alternatives considered**:

- (a) Reuse `CrdLayoutWrapper`. Rejected — it expects an authenticated `user` and renders the full app header, which the auth screens don't have.
- (b) Have each screen render its own outer chrome. Rejected — guaranteed drift.

**Footer reuse risk**: The current CRD `Footer.tsx` may presume an authenticated context (language switcher driven by `i18n.changeLanguage` wired up by `CrdLayoutWrapper`). During task work, verify the `Footer` props contract supports a pure-presentational use (passing `languages`, `currentLanguage`, `onLanguageChange` directly). If not, extract a `MinimalFooter` that is.

---

## R-6: Form-field wrappers

**Decision**: Build under `src/crd/forms/`:

| File | Wraps | Notes |
|------|-------|-------|
| `EmailField.tsx` | `<Input type="email">` | Persistent visible label, error rendering below, `aria-describedby` wired. |
| `PasswordField.tsx` | `<Input type={visible ? 'text' : 'password'}>` | Visual `useState` for visibility. Eye icon (`lucide-react`) inside the input, button-typed for keyboard access. Accessible label switches between "Show password" / "Hide password". |
| `TextInputField.tsx` | `<Input type="text">` | Used for First Name / Last Name. |
| `AcceptTermsCheckbox.tsx` | `<Checkbox>` + `<label>` | Label slot accepts `ReactNode` so the consumer can inject `<a href>` Terms / Privacy links. |

**Rationale**: All four are forms-layer concerns (label + error + input composition). None of them is a primitive; none owns submission. PasswordField's show/hide state is the only one of these with state, and that state is visual-only per `src/crd/CLAUDE.md`.

**Alternatives considered**: Place `PasswordField` in `primitives/`. Rejected — primitives are unstyled atomic controls; this one has a label and an error slot, which is forms-layer.

---

## R-7: Per-route CRD dispatch in `IdentityRoute.tsx`

**Decision**: Extend `IdentityRoute.tsx` in place. The file already does:

```tsx
<Route path={IdentityRoutes.Required} element={
  crdEnabled ? <CrdAuthRequiredRoute /> : <AuthRequiredPage />
} />
```

Repeat exactly this pattern for every route this spec covers:

```tsx
<Route path={IdentityRoutes.Login + '/*'} element={
  crdEnabled ? <SignInCrdRoute /> : <LoginRoute />
} />
<Route path={IdentityRoutes.Registration + '/*'} element={
  crdEnabled ? <RegistrationCrdRoute /> : <RegistrationRoute />
} />
<Route path={IdentityRoutes.SignUp} element={
  crdEnabled
    ? <NotAuthenticatedRoute><SignUpCrdRoute /></NotAuthenticatedRoute>
    : <NotAuthenticatedRoute><SignUp /></NotAuthenticatedRoute>
} />
{ /* …and so on for Verify, Recovery, Error */ }
```

**Rationale**: Same pattern, one file, both versions visible side by side. The existing convention already established by `/identity/required` is the convention this spec follows.

**Alternatives considered**:

- (a) Add a `CrdIdentityRoute()` mounted in `TopLevelRoutes.tsx` next to `IdentityRoute()`. Rejected — splits the auth routing across two files and risks the two trees drifting apart.
- (b) Mount the CRD routes under a different URL prefix (e.g. `/crd-identity/login`). Rejected — violates `FR-002` (URL paths must stay identical) and breaks Kratos-issued email links.

---

## R-8: `crd-auth` i18n namespace

**Decision**: Create `src/crd/i18n/auth/` with `auth.{en,nl,es,bg,de,fr}.json`. Register `crd-auth` in `crdNamespaceImports` in `src/core/i18n/config.ts` (lazy-loaded for non-English; eager-load English to avoid a flash on the first auth visit, matching what `crd-layout` already does — confirm during task work whether eager-load is justified or lazy is enough).

**Key prefixes** (proposed, finalised during task work):

```text
auth.signIn.title                  "Sign in"
auth.signIn.submit                 "Sign in"
auth.signIn.forgotPassword         "Forgot password?"
auth.signIn.noAccount              "No account?"
auth.signIn.signUp                 "Sign up"

auth.signUp.title                  "Sign up"
auth.signUp.intro                  "Alkemio is designed to benefit society..."
auth.signUp.acceptTerms            "I accept the <terms>Terms of Use</terms> and <privacy>Privacy Policy</privacy>."
auth.signUp.haveAccount            "Have an account?"
auth.signUp.signIn                 "Sign in"
auth.signUp.next                   "Next"

auth.fields.email                  "E-Mail"
auth.fields.password               "Password"
auth.fields.firstName              "First Name"
auth.fields.lastName               "Last Name"
auth.fields.showPassword           "Show password"
auth.fields.hidePassword           "Hide password"

auth.recovery.title                "Password recovery"
auth.recovery.intro                "Please enter your email address below..."
auth.recovery.continue             "Continue"
auth.recovery.codeStage.title      …
auth.recovery.cooldown             "Resend in {{seconds}}s"

auth.verification.title            …
auth.verificationReminder.title    …

auth.continueWith                  "or continue with"

auth.error.title                   …
auth.error.backToSignIn            …

auth.tagline                       "Safe Spaces for Collaboration"
```

**Rationale**: Per spec FR-018, CRD strings live in their own namespace and don't pollute the main `translation` namespace; per `src/crd/CLAUDE.md`, all six languages are populated in the same PR (AI-assisted, not Crowdin).

**Alternatives considered**: Put auth keys into `crd-common`. Rejected — `crd-common` is shared chrome strings; per-feature namespaces enable lazy-loading and prevent the shared namespace from ballooning.

---

## R-9: Loading state during Kratos flow fetch

**Decision**: Render a minimal centred skeleton card while `useKratosFlow` is loading — same auth-shell chrome, but the card body is replaced by a skeleton matching the height/width of the eventual form. No spinner; no blank screen.

**Rationale**: Matches the perceived weight of the MUI `<Loading>` component currently used by `LoginRoute`. Empty/blank flashes are jarring; spinners feel slower than they are; skeleton parity is the modern default.

**Alternatives considered**:

- (a) Render the form immediately with disabled controls and hydrate. Rejected — Kratos owns CSRF token + ui.action URL; submitting before those arrive would fail.
- (b) Show a Suspense fallback. Rejected — `useKratosFlow` is not Suspense-compatible today; introducing it would be a separate refactor.

---

## R-10: Analytics + APM parity

**Decision**: Audit each MUI auth page during task work and instrument the CRD equivalents to emit:

- The same `WithApmTransaction` wrapper (e.g., `<WithApmTransaction path="/identity/login">`) — same `path` string per route so existing APM dashboards continue to attribute traffic correctly.
- The same analytics events the MUI page emits today (page views, submission attempts, success/failure, provider clicks). Replicate at exactly one emission site per CRD page to prevent double-counting.

**Rationale**: FR-021 and FR-022.

**Investigation note**: Several events fire from inside `KratosUI` and friends (e.g., provider clicks). The CRD `CrdKratosFlow` must either re-emit those at the same point OR receive them as callback props from the integration layer. Decide during the `CrdKratosFlow` task — leaning toward callback props (`onProviderClick`, `onSubmitAttempt`, `onSubmitSuccess`, `onSubmitFailure`) so the analytics surface stays in the integration layer and the design-system component remains pure.

**Alternatives considered**: Skip analytics for the first iteration. Rejected — fails the spec's clarified observability parity requirement.

---

## R-11: Testing approach

**Decision**: Per `FR-023` and Q3 clarification, match the existing CRD-migration test pattern:

- **Unit tests** (Vitest + Testing Library) for each new CRD presentational component:
  - `SignInCard` renders email + password + submit; calls `onSubmit` when the form submits.
  - `PasswordField` toggles visibility on icon click; toggle is keyboard-operable.
  - `CrdKratosFlow` renders the correct node groups for each `flowType`.
  - `AuthShell` renders the background, the card slot, the footer.
  - `SocialProviderButton` is reachable + has accessible name.
- **Integration tests** for the integration-layer dispatcher and adapter:
  - `flowDescriptorAdapter` correctly buckets a representative LoginFlow / RegistrationFlow / RecoveryFlow.
  - `IdentityRoute` extension: with `useCrdEnabled = true`, the CRD route component mounts; with `false`, the MUI one mounts.
  - The acceptedTerms sessionStorage workaround survives a simulated validation error in the registration flow.
  - The recovery cooldown surfaces `submitDisabled=true` and renders the cooldown label while active.

**No new end-to-end Kratos round-trip tests are introduced.** Live-backend verification stays manual / out-of-band, as for peer migrations.

**Rationale**: Q3 clarification.

---

## R-12: Risks captured during research

(See risk table in `plan.md`. Highlights:)

- **Footer-in-anonymous-context risk**: the existing `CrdLayout`'s Footer may not be usable directly without an authenticated user. Investigate during task work; extract a minimal anonymous-safe variant if needed.
- **Analytics double-emission risk**: events that fire today from both the page wrapper and the inner `KratosUI`. Audit each site and emit from exactly one place in the CRD path.
- **Unknown future Kratos node types**: handled by the adapter's "default text input" fallback bucket.

---

## R-13: Out-of-scope reaffirmed

- `/identity/required` (already CRD).
- `/identity/settings` (separate migration).
- `/identity/logout` (no UI to migrate — just clears the session and redirects).
- Removal of the MUI auth pages.
- Any backend / Kratos config change.
- Crowdin pipeline integration for these strings (CRD strings are manually maintained per project convention).

---

## Summary

All plan-level unknowns are resolved. No `NEEDS CLARIFICATION` markers remain in the Technical Context. Constitution check passes both pre- and post-design (re-verified after Phase 1 — see `plan.md`). Ready for `/speckit.tasks`.
