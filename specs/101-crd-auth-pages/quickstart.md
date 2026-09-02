# Quickstart: CRD Authentication Pages

**Branch**: `101-crd-auth-pages`

This document is for developers verifying the migrated CRD authentication screens locally — both during implementation and at PR review.

## Prerequisites

- Local dev environment per repo root README (Node 24.14.0 via Volta, pnpm 10.17+).
- The Alkemio backend running at `localhost:3000` (auth requests fail without it).
- A working sign-in account on that backend (or use sign-up to create one).

## No setup needed

The CRD auth screens render for **every** visitor — just open an auth URL (e.g. `/identity/login`) and you get the CRD screen. There is nothing to enable or toggle: authentication screens are shown before a user is authenticated, so no per-user setting is involved.

## Run the app

```bash
pnpm install        # if not done already
pnpm start          # dev server on http://localhost:3001
```

## Verification checklist

For each screen below, verify:

1. The CRD shell renders — full-bleed constellation background, right-aligned card, CRD footer (Terms / Privacy / Security / Alkemio mark / Support / About / language switcher), floating help button.
2. No MUI styling visible anywhere on the page (open dev tools, search the DOM tree for `MuiBox`, `MuiCard`, `Mui-` class prefixes; should find none on the auth pages).
3. All visible strings are translated — flip the language switcher to Dutch / Spanish / Bulgarian / German / French and confirm every string changes; nothing falls back to English.
4. Keyboard-only operation works — Tab through every control, confirm focus is visible at every step, submit with Enter, toggle the password show/hide with Space.
5. Submitting with valid input succeeds; submitting with invalid input shows the same error the pre-migration MUI screens showed (compare against a deployed environment that predates this feature, or the git history of the MUI auth pages).
6. The same APM transaction name appears in network/dev tooling as the MUI screen would produce. The same analytics events fire (check with your analytics-stub of choice).

### `/identity/login` — Sign in

- Card header: Alkemio logo + "Safe Spaces for Collaboration" tagline on the left, "No account? Sign up" on the right.
- Fields: E-Mail, Password (with show/hide eye toggle).
- "Forgot password?" link.
- Primary "SIGN IN" button (full width, dark).
- "or continue with" divider.
- Social/passkey provider icon row (passkey + LinkedIn + Microsoft + GitHub + others, matching whatever the backend advertises).
- Sign in with valid creds → redirected to the home (or `?returnUrl=` target) inside the CRD shell.
- Submit with invalid creds → inline error.
- Click "No account? Sign up" → `/identity/sign_up`.
- Click "Forgot password?" → `/identity/recovery`.

### `/identity/sign_up` — Quick registration

- Card header: logo + tagline, "Have an account? Sign in" link on the right.
- Intro paragraph mentioning Terms of Use + Privacy Policy.
- Checkbox "I accept the Terms of Use and Privacy Policy" — required.
- Fields: E-Mail, First Name, Last Name.
- Primary "NEXT" button — disabled until the checkbox is checked AND all fields are filled.
- Social provider icon row beneath the form.
- Submit with a new email → email-verification screen.
- Submit with an existing email → inline error.
- Submit with a validation error → the accepted-terms checkbox STAYS checked (sessionStorage workaround working).

### `/identity/registration` — Full Kratos registration

- Same shell, same header as the quick registration but renders the full Kratos flow (includes password field, etc.).
- Same Terms-of-Use gate behaviour.

### `/identity/recovery` — Password recovery

- Card header: logo + tagline, "No account? Sign up" link.
- Title: "Password recovery".
- Intro: "Please enter your email address below to receive a recovery link…"
- Field: E-Mail.
- Primary "CONTINUE" button.
- After submitting once → button shows the cooldown countdown (~30s) and is disabled.
- After receiving the recovery email → click the link → land on the set-new-password CRD screen (still in CRD shell).

### `/identity/verify` — Email verification

- Renders during the verification flow (after sign-up, or on a verification email link).
- Shows the appropriate stage (waiting / verified / error) inside the CRD shell.

### `/identity/verify/reminder` (or equivalent) — Verification reminder

- Shown when a user revisits the platform without having verified their email.
- Same shell, instructional copy + (if present) a "resend verification email" action.

### `/identity/error` — Auth error

- Reached when Kratos redirects with `?id=<error-code>`.
- Shows the resolved error code + message + reason in a CRD card with a "back to sign in" action.

### `/identity/settings?flow=…` — Password-reset completion

- Reached when a user clicks the link in the password-recovery email; Kratos issues a settings flow and redirects here.
- The CRD card shows a single password field + Save button (with the same OIDC/passkey row as the other auth screens). The Kratos profile method (email + first + last + accept-terms + a second Save) is filtered out — only the password change is exposed.
- Visiting `/identity/settings` without a `?flow=` query param redirects to `/` (mirrors the MUI guard); no new settings flow is auto-created.

## What to verify is NOT touched

- `/identity/required` — keeps its existing `CrdAuthRequiredPage` rendering. This spec must NOT have changed it.
- `/identity/logout` — out of scope.
- Every other already-migrated CRD page (dashboard, spaces, forum, etc.) — should look and behave identically to before this change.

## Smoke check the MUI path

The old MUI auth screens are no longer routed to — there is no "MUI auth path" to smoke-test. After signing in, just confirm the post-login application still loads correctly; that surface is unaffected by this feature and must not have regressed.

## Tests

```bash
# All unit + integration tests
pnpm vitest run

# Just the new feature's tests
pnpm vitest run src/crd/components/auth --reporter=basic
pnpm vitest run src/main/crdPages/auth --reporter=basic
```

## Common pitfalls

- **Card renders blank on first load** — the Kratos flow fetch failed (no backend running, expired session). Open Network tab and look for the `/self-service/login/browser` (or similar) call.
- **Footer language switcher does nothing** — `onLanguageChange` not wired up by the integration layer's `AuthShellWrapper`. Verify it calls `i18n.changeLanguage(code)`.
- **Provider icon appears but click does nothing** — `formFieldName` / `formFieldValue` not set on `SocialProviderButton`; the form submit lacks the provider identifier. Wire from the descriptor's `oidc[].name` / `oidc[].value`.
- **Accepted-terms checkbox unticks on validation error** — the sessionStorage workaround was not ported into `SignUpCrdRoute.tsx`. See `RegistrationPage.tsx` for the MUI implementation that needs mirroring.
- **Tailwind preflight not applied to a screen** — verify the CRD shell wraps the card in a `.crd-root` parent (or its equivalent), so Tailwind resets are scoped correctly.
