# Phase 0 Research: Guest whiteboard return notification (CRD)

All Technical Context items were resolved during the spec investigation; there were no open `NEEDS CLARIFICATION` markers entering planning (FR-013 was resolved to Option B). This document records the design decisions and the alternatives weighed.

## D1 — Reuse the existing `useGuestSessionReturn` hook instead of writing new detection logic

- **Decision**: The integration layer (`CrdSignUpPage`) consumes the existing `useGuestSessionReturn` hook (`src/domain/collaboration/whiteboard/guestAccess/hooks/useGuestSessionReturn.ts`) to get `shouldShowNotification`, `whiteboardUrl`, `handleBackToWhiteboard`, and `handleGoToWebsite`. No new session-reading code is written.
- **Rationale**: The hook already encapsulates exactly the required behaviour — `shouldShowNotification = Boolean(guestName && whiteboardUrl)`, `handleBackToWhiteboard` navigates via `useNavigate`, `handleGoToWebsite` opens the public site. It was built for the MUI page and is presentation-agnostic. Reusing it satisfies DRY (Constitution Arch #6f) and keeps side effects in the domain/integration layer (Principle IV).
- **Alternatives considered**:
  - *Read `sessionStorage` directly in the CRD component* — rejected: violates the CRD "no business logic / side-effects" rule and duplicates logic.
  - *Write a new CRD-specific hook* — rejected: the existing hook is already correct and consumed by tests; duplicating it risks divergence.

## D2 — New presentational CRD component `GuestReturnNotice`, not a port of the MUI component

- **Decision**: Build a fresh `src/crd/components/auth/GuestReturnNotice.tsx` using CRD primitives (`Button`, semantic typography tokens, Tailwind). The legacy `GuestSessionNotification.tsx` (MUI `Box`/`Typography`/`useTheme`/`@mui/icons-material`) is not ported line-by-line.
- **Rationale**: The MUI component is built entirely from forbidden imports (`@mui/material`, `@mui/icons-material`, `sx`, `useTheme`). A CRD re-implementation is required by Arch #2. Icons come from `lucide-react` (`ArrowLeft`, `ArrowRight`) instead of `@mui/icons-material`.
- **Alternatives considered**: *Wrap the MUI component* — rejected: would pull MUI into a CRD route, defeating the migration.

## D3 — Layout: stack the notice ABOVE the `SignUpCard` within the single AuthShell column

- **Decision**: Render `GuestReturnNotice` directly above `SignUpCard`, both inside the existing `AuthShellWrapper`, wrapped in a `flex flex-col gap-6` container. `AuthShell` is left unchanged (its slot is a single centred `max-w-[420px]` column).
- **Rationale**: The CRD `AuthShell` is a single-column centred shell (unlike the MUI two-column row). Stacking matches the MUI page's own narrow/mobile behaviour (it stacked vertically below `md`), requires no change to the shared `AuthShell`, and keeps the change scoped. The "Want to contribute more?" hint copy is rewritten direction-neutral ("create an account below") since "on the right" no longer applies.
- **Alternatives considered**:
  - *Widen `AuthShell` to a two-column layout when a notice is present* — rejected: changes a shared layout used by login/recovery/verification for a single edge case; higher risk, more surface area.
  - *Render the notice below the card* — rejected: the acknowledgement should be seen first; above is more prominent and matches reading order.

## D4 — Copy lives in the `crd-auth` namespace under a new `guestReturn.*` group

- **Decision**: Add keys under `guestReturn` in `src/crd/i18n/auth/auth.<lang>.json` for all six languages: `title`, `description`, `backButton`, `websiteButton`, `contributeTitle`, `contributeDescription`.
- **Rationale**: `crd-auth` already hosts the sign-up page copy and is the namespace the sign-up route loads. Arch #3 forbids new keys in the frozen legacy `translation` namespace. The legacy keys at `pages.public.whiteboard.guestSessionNotification.*` are reused as the source text where translations already exist.
- **Translation reuse**: EN, NL, ES, BG translations already exist in the legacy locale files and are ported verbatim (adjusting only the "on the right" phrasing). DE and FR legacy values were left in English, so they get fresh DE/FR translations in this PR (AI-assisted, per CRD i18n policy).
- **Whiteboard term**: the legacy strings interpolate `$t(common.whiteboard)`. In `crd-auth` there is no `common.whiteboard` key, so the word "whiteboard" is inlined directly in each locale string (the CRD namespace is self-contained).
- **Alternatives considered**: *Create a dedicated `crd-whiteboard` namespace* — rejected for now: the notice is only shown on the auth route, so co-locating with `crd-auth` avoids a second lazy-loaded namespace on the sign-up page.

## D5 — Website destination

- **Decision**: Keep the existing `handleGoToWebsite` behaviour from `useGuestSessionReturn` (navigates to Alkemio's public site). No new config introduced.
- **Rationale**: Preserves legacy behaviour; the integration hook already owns this side effect (Principle IV). If a configurable landing URL is later desired, it belongs in the hook, not the CRD component.

## D6 — Session clearing on auth (FR-007)

- **Decision**: Rely on the existing post-authentication cleanup (`clearAllGuestSessionData` in `sessionStorage.ts`, already invoked on successful login/registration). No new clearing trigger is added.
- **Rationale**: The mechanism already exists and is tested; FR-007 is satisfied by it. Viewing or acting on the notice must NOT clear the session (FR-006), so the component/integration deliberately does not call `clearSession`.
