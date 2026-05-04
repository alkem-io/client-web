# Quickstart: CRD — Unauthorized / Forbidden Error Page

**Feature**: 095-crd-auth-error-page
**Date**: 2026-04-28
**Audience**: Developers / QA verifying the feature end-to-end during implementation and review.

This file walks through the manual test recipes for both user stories, the toggle-off regression check, and the unit-test runs. It assumes the dev server (`pnpm start`) is running against a local backend (`localhost:3000`).

---

## Pre-flight

```bash
# From the repo root:
pnpm install        # if dependencies changed
pnpm codegen        # not needed for this feature, but cheap; backend at localhost:4000
pnpm lint           # type-check + Biome + ESLint
pnpm vitest run src/main/crdPages/error --reporter=basic
pnpm start          # opens http://localhost:3001
```

The four test files added by this feature should all pass:
- `src/main/crdPages/error/isCrdRoute.test.ts`
- `src/main/crdPages/error/CrdAwareErrorComponent.test.tsx`
- `src/main/crdPages/error/CrdRestrictedRoute.test.tsx`
- (Optional) `src/crd/components/error/CrdForbiddenPage.test.tsx` — visual snapshot of the page in both `showGoBack` states.

---

## Toggle the CRD feature flag

CRD pages are hidden behind a localStorage toggle. In the browser console at any Alkemio page:

```js
// Enable
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();

// Disable
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

The two manual stories below assume CRD is **on** unless stated otherwise.

---

## Story 1 — Authenticated user hits a forbidden CRD page (P1)

**Setup**:
1. Sign in as a user that has **no** access to a known-private Space. (Use a test account or a Space configured as private with the test user excluded.)
2. CRD toggle on (see above).

**Steps**:
1. Navigate directly to the private Space's URL — `http://localhost:3001/<private-space-nameId>`.
2. Wait for the URL resolver and data hooks to fire and throw `NotAuthorizedError` (the upstream throw — `useRestrictedRedirect` for an authenticated-but-forbidden user).

**Expected** (FR-001 / FR-003 / FR-004 / FR-007 / FR-010 / FR-026):
- The page body is replaced by the **CRD-styled** forbidden card: shadcn/ui surface, Tailwind tokens, a `lucide-react` `ShieldAlert` icon, an `<h1>` reading "Access Restricted", a description sentence, a primary button "Go to Home", and a secondary button "Go back" (since you arrived via in-app navigation, history is non-empty).
- The CRD layout chrome (CRD header / footer) remains in place. There is no MUI `TopLevelLayout` mounted (verify in React DevTools: search for `TopLevelLayout` — not found).
- The browser tab title reads "Access Restricted | Alkemio".
- Tab focus is on "Go to Home". Pressing Enter takes you to `/home` with the CRD chrome intact.
- Tab → focuses "Go back". Pressing Enter takes you back one step in browser history.

**Negative checks**:
- No console errors, no React warnings, no missing-i18n-key fallbacks.
- React DevTools shows `<CrdLayoutWrapper>` → `<CrdForbiddenPage>` and **not** `<TopLevelLayout>` → `<Error403>`.

---

## Story 1b — Same flow but with no in-app history (deep link / new tab)

**Steps**:
1. Open a **new tab**, paste the same private Space URL, navigate.

**Expected** (FR-010 / Edge case "No history to go back to"):
- The CRD page renders identically, but the secondary "Go back" button is **hidden**. Only "Go to Home" is shown.

---

## Story 2 — Direct visit to `/restricted` (P2)

**Setup**: CRD toggle on; signed in (any user).

**Steps**:
1. Navigate directly to `http://localhost:3001/restricted` (or `http://localhost:3001/restricted?origin=/some/page`).

**Expected** (FR-016 / FR-023):
- The CRD forbidden page is rendered inside CRD chrome, with the same recovery actions as Story 1.
- Open the browser DevTools → Network tab → Sentry envelope (or check Sentry directly). A breadcrumb event with the message `Attempted access to: /some/page` (or `null` if `origin` was omitted) is emitted exactly once. Format and field shape match the existing MUI emission (compare with the toggle-off run below).
- Tab title: "Access Restricted | Alkemio".

---

## Story 2b — Anonymous user navigates directly to `/restricted` (Clarification Q4)

**Setup**: CRD toggle on; **signed out**.

**Steps**:
1. Sign out of Alkemio.
2. Navigate directly to `http://localhost:3001/restricted`.

**Expected**:
- The CRD page is rendered (matching MUI's existing auth-agnostic behavior on `/restricted`). No redirect to sign-in is triggered by the route handler. The same Sentry breadcrumb is emitted.
- Verify by toggling CRD off and revisiting `/restricted` while signed out — you'll see the MUI `Error403` rendered (no redirect either). Both behaviors match.

---

## Story 3 — Anonymous user lands on `/required` after a deep-link redirect (P2)

**Setup**: CRD toggle on; **signed out**.

**Steps**:

1. Sign out of Alkemio.
2. Navigate directly to a private Space's URL — `http://localhost:3001/<private-space-nameId>`.
3. Watch the URL bar — the upstream `useRestrictedRedirect` should trigger a silent redirect, landing the browser on `http://localhost:3001/required?returnUrl=http%3A%2F%2Flocalhost%3A3001%2F<private-space-nameId>` (or equivalent encoded form).

**Expected** (FR-040 / FR-041 / FR-042 / FR-043 / FR-044 / SC-010):

- The page body shows the **CRD-styled** auth-required card: shadcn/ui surface, Tailwind tokens, `lucide-react` `ShieldAlert` icon, an `<h1>` reading "Access Restricted", two stacked paragraphs (the second one explicitly invites sign-in), a primary button "Sign in / Sign up", an "Or" separator, and a secondary outlined button "Return to dashboard as guest".
- The CRD layout chrome (header / footer) is in place. React DevTools shows `<CrdLayoutWrapper>` → `<CrdAuthRequiredPage>` and **not** `<TopLevelLayout>` → `<AuthRequiredPage>`.
- The browser tab title reads "Access Restricted | Alkemio".
- Inspect the primary button's anchor (`<a href>` inside `<Button>`) — its `href` is the existing login URL (`_AUTH_LOGIN_PATH` + `returnUrl=...`) with the `returnUrl` query parameter preserved byte-for-byte from the URL bar.
- Inspect the secondary button's anchor — its `href` is `https://<config-domain>/home` (or just `/home` if no domain is configured), matching the MUI behavior in `AuthRequiredPage.tsx:24-25`.
- Click "Sign in / Sign up" — complete the login flow. After successful authentication you land back on the originally-requested private Space URL (because the `returnUrl` round-trip is preserved). If you happen to log in with credentials that *still* don't grant access, you land on the CRD forbidden page (Story 1 path).

**Negative checks**:

- No console errors, no React warnings, no missing-i18n-key fallbacks.
- React DevTools confirms no `<TopLevelLayout>` mount and no `<AuthRequiredPage>` mount.
- Disable JS history navigation (open in a new tab from Story 1's setup) — the page renders identically (the `/required` page is auth-redirect destination, history doesn't influence its render).

---

## Story 3b — Direct visit to `/required` (no upstream redirect)

**Setup**: CRD toggle on; signed in OR signed out.

**Steps**:

1. Type `http://localhost:3001/required` directly into the URL bar.

**Expected** (FR-044):

- The CRD page renders with no `returnUrl` parameter — `buildLoginUrl(undefined)` produces the bare login URL with no return preserved. The page itself doesn't show an error or empty state.
- The route handler does not branch on auth state; an authenticated user navigating here directly sees the same content (matching MUI's existing behavior on this route).

---

## Toggle-off regression — Story 1 / 2 / 3 with CRD disabled

**Setup**: CRD toggle **off** (remove the localStorage entry and reload).

**Steps**:
1. Repeat Story 1 (private Space deep link as authenticated user).
2. Repeat Story 2 (direct visit to `/restricted`).
3. Repeat Story 3 (anonymous user on private Space deep link → `/required`).

**Expected** (FR-030 / SC-003 / SC-010):
- Stories 1 / 2 render the **MUI** `Error403` inside `TopLevelLayout`, exactly as on production `develop`.
- Story 3 renders the **MUI** `AuthRequiredPage` inside `TopLevelLayout`, exactly as on production `develop`. Verify by comparing the React tree to a fresh checkout of `develop`.
- Tab title is still "Access Restricted | Alkemio" (it always was — this just confirms parity).
- Sentry breadcrumb on `/restricted` still emits with the same `origin` field. The CRD path's breadcrumb is byte-for-byte identical to the MUI path's (SC-008).
- No CRD CSS / shadcn primitives are loaded for the forbidden / auth-required render (verify via the Network tab — no fetch for any CRD-only chunk if it's lazy-loaded).

---

## a11y manual pass (FR-026 / FR-027 / FR-028 / FR-029 / SC-005)

On the CRD forbidden page (any of the above stories):

1. Use **only the keyboard** to recover. With the page focused, Tab through the controls. Confirm focus order is: primary button → secondary button (when shown) → header chrome controls.
2. Press Enter on the primary button — confirm it navigates to `/home`.
3. Open the page with a screen reader (VoiceOver on macOS — `Cmd+F5`). Navigate by heading (VO + Cmd + H). The screen reader MUST announce "Access Restricted, heading level 1".
4. Confirm the icon is **not** announced (it has `aria-hidden="true"`).
5. Inspect the buttons in DevTools — both have visible focus rings (`outline` or `ring`-class on focus), and the contrast ratio of label vs. background passes WCAG AA (verify with a contrast checker if needed).

---

## i18n manual pass (FR-024 / SC-006)

For each of `nl`, `es`, `bg`, `de`, `fr`:

1. In the browser, open the language switcher (CRD header) and select the language.
2. Navigate to `/restricted` (or trigger the throw-path).
3. Verify the headline, description, and both action labels render in the chosen language — **no `forbidden.title` raw key fallbacks** appear.
4. Confirm the document tab title is also localized.

---

## Bundle / lazy-load check (SC-004)

After implementation:

```bash
pnpm analyze
# Open build/stats.html in the browser
```

In the visualization:
- Confirm `CrdForbiddenPage`, `CrdAwareErrorComponent`, and `CrdRestrictedRoute` land in a CRD-related chunk (likely the same chunk as `CrdLayoutWrapper` and other CRD-page integration code).
- Confirm `Error403`, `Error40X`, and `TopLevelLayout` are still in the existing MUI chunks unchanged. The MUI fallback path is preserved at the bundle level.

---

## What "done" looks like

This feature is shippable when:

- [ ] All four Vitest test files pass: `isCrdRoute`, `CrdAwareErrorComponent`, `CrdRestrictedRoute`, and (optional) `CrdForbiddenPage`.
- [ ] `pnpm lint` passes.
- [ ] `pnpm build` produces no new warnings beyond the existing chunk-size advisories.
- [ ] All five manual stories above (1, 1b, 2, 2b, toggle-off) pass.
- [ ] a11y manual pass passes.
- [ ] i18n pass passes for all six languages.
- [ ] Bundle analysis confirms no MUI chrome leaks into CRD chunks (and vice versa).
- [ ] Sentry shows the same `Attempted access to: ${origin}` breadcrumb on `/restricted` regardless of CRD toggle state.
