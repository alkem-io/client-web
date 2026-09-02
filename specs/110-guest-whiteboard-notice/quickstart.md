# Quickstart: Guest whiteboard return notification (CRD)

## What this feature does

When a guest who has been editing a public whiteboard lands on the CRD sign-up page, a card titled **"You've left your whiteboard"** appears above the sign-up form, offering **Back to whiteboard** and **Go to our website**, plus a nudge to create an account. It currently never appears because it lived only on the now-orphaned MUI sign-up page.

## Implementation steps

1. **Create the CRD component** `src/crd/components/auth/GuestReturnNotice.tsx`
   - Props: `{ onBackToWhiteboard, onGoToWebsite, className? }` (see `contracts/GuestReturnNotice.contract.ts`).
   - Build with `Button` from `@/crd/primitives/button`, `cn()` from `@/crd/lib/utils`, icons `ArrowLeft` / `ArrowRight` from `lucide-react`.
   - Use `useTranslation('crd-auth')` and the `guestReturn.*` keys.
   - Card shell: `rounded-lg bg-card px-9 py-8 shadow-[0_8px_32px_rgba(0,0,0,0.12)]` (match `AuthCard`).
   - Primary button = default variant with `ArrowLeft`; secondary = `outline` variant; "contribute" block in a muted/highlight box with `ArrowRight`.
   - Accessibility: real `<button>`s, accessible names from `t()`, decorative icons `aria-hidden`, visible `focus-visible:ring`.

2. **Add i18n keys** under `guestReturn` in all six `src/crd/i18n/auth/auth.<lang>.json` files (en, nl, es, bg, de, fr). Port EN/NL/ES/BG from the legacy `pages.public.whiteboard.guestSessionNotification.*` values (inline the word "whiteboard", drop "on the right"). Write fresh DE/FR (legacy left them in English). Keep key parity.

3. **Wire the integration** in `src/main/crdPages/auth/SignUpCrdRoute.tsx` (`CrdSignUpPage`):
   - Call the existing `useGuestSessionReturn()` hook.
   - Wrap the existing `<SignUpCard />` and the new notice in `<div className="flex flex-col gap-6">` inside `AuthShellWrapper`.
   - Render `<GuestReturnNotice onBackToWhiteboard={handleBackToWhiteboard} onGoToWebsite={handleGoToWebsite} />` above the card, gated on `shouldShowNotification`.

4. **Do NOT delete** the legacy MUI `SignUp.tsx` or `GuestSessionNotification.tsx` (FR-013 — deferred to a separate MUI auth-cleanup pass covering Login + SignUp together).

## Manual verification

```js
// In the browser console on any page, seed a guest session:
sessionStorage.setItem('alkemio_guest_name', 'Ada L.');
sessionStorage.setItem('alkemio_guest_whiteboard_url', '/public/whiteboard/test-wb-id');
// then navigate to /sign_up — the notice should appear above the sign-up form.

// Clear it and reload /sign_up — the notice should be gone, form unchanged:
sessionStorage.removeItem('alkemio_guest_name');
sessionStorage.removeItem('alkemio_guest_whiteboard_url');
```

- Click **Back to whiteboard** → lands on the stored whiteboard URL, guest name still in effect.
- Click **Go to our website** → goes to the Alkemio public site.
- Switch language in the footer → notice copy translates (check all six).
- Tab through the card → both buttons reachable with visible focus rings.

## Tests to add

- `src/crd/components/auth/GuestReturnNotice.test.tsx` — renders title/description/buttons; clicking each button calls the matching callback exactly once; decorative icons are `aria-hidden`.
- Integration coverage (in or alongside an existing `SignUpCrdRoute` test): notice renders when both session keys are set; absent when either/both missing; the sign-up form renders unchanged in the absent case.

## Commands

```bash
pnpm lint                 # TypeScript + Biome + ESLint (react-compiler rule)
pnpm vitest run src/crd/components/auth/GuestReturnNotice.test.tsx --reporter=basic
```

No `pnpm codegen` needed — this feature touches no GraphQL.
