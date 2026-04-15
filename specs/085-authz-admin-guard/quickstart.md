# Quickstart: Verifying the Permission-Aware Authorization Admin UI

**Feature**: 085-authz-admin-guard
**Date**: 2026-04-15

This quickstart walks a developer or QA engineer through verifying the feature end-to-end once implemented.

## Prerequisites

- Alkemio backend running at `localhost:3000` (the client dev server expects it).
- Two test accounts on the backend:
  - **PrivilegedUser** — holds `GRANT` on the target role-set / entity.
  - **UnprivilegedUser** — can read/see the admin page for the entity but does **not** hold `GRANT` on it.
- Client dev server running: `pnpm start` (serves at `localhost:3001`).

## Verification Steps

### 1. Baseline: Privileged user path (no regression)

1. Log in as **PrivilegedUser**.
2. Navigate to one of the covered admin pages (see `plan.md` "Source Code" section for the inventoried list — e.g., `AdminAuthorizationPage`, `OrganizationAssociatesView`, community admin Users tab).
3. Observe: the "Add user" button is **enabled**, no blocking tooltip.
4. Click the button → dialog opens → add a user → confirm.
5. Observe: the roster updates and **no error toast** appears.

**Pass criterion**: existing happy path is unchanged (spec FR-009).

### 2. Primary: Unprivileged user sees disabled button + tooltip

1. Log in as **UnprivilegedUser**.
2. Navigate to the same admin page.
3. Observe: the "Add user" button is rendered **disabled** (greyed, non-interactive).
4. Hover the button with the mouse.
5. Observe: a tooltip appears stating that the user does not have the required privilege.
6. Tab to the button with the keyboard.
7. Observe: the tooltip appears on focus; the button is not activatable by `Enter` or `Space`.
8. Use a screen reader (VoiceOver on macOS, NVDA on Windows).
9. Observe: the screen reader announces both the button label and the privilege reason.

**Pass criterion**: spec FR-002, FR-003, FR-004, SC-005.

### 3. Safety net: Error toast on backend rejection

This simulates the race where the UI thinks the user is privileged but the backend rejects the action (e.g., privileges revoked mid-session).

1. Log in as **UnprivilegedUser**.
2. With DevTools open, locate the "Add user" button for one covered site.
3. In the Elements panel, manually remove the `disabled` attribute so the button becomes clickable (simulates UI/backend drift).
4. Click the button → complete the add-user flow → submit.
5. Observe: a **visible, dismissible error toast** appears identifying the failure as a permission issue (distinct wording from a generic network error).
6. Observe: the roster is **not** modified.
7. (Optional) Refresh the page — the button should return to its correctly-disabled state.

**Pass criterion**: spec FR-006, FR-007, SC-001.

### 4. Loading state: Default to disabled

1. Throttle the network in DevTools (e.g., "Slow 3G").
2. Log in as **PrivilegedUser**.
3. Navigate to a covered admin page.
4. During the brief window before the main query resolves, observe the "Add user" button.

**Pass criterion**: the button is disabled with a "Checking permissions…" tooltip while loading; it transitions to enabled once the privilege list arrives (spec FR-008, edge case "privileges not yet loaded").

### 5. Inventory completeness check

Walk through the inventoried sites listed under `plan.md` → "Source Code" → every `TOUCH` entry, and repeat step 2 for each. All must behave identically.

**Pass criterion**: no covered site still exhibits the silent-failure or always-enabled-button bug.

## Automated Checks

Before opening a PR:

```bash
pnpm lint
pnpm vitest run
```

- Unit test for `useHasPrivilege` covers the derivation rules in `data-model.md`.
- Component test for `DisabledWithTooltipButton` covers disabled → tooltip-on-hover/focus.
- At least one integration test covers mutation `onError` → notification.

## Rollback

If a regression surfaces post-merge, the feature is safely reversible by reverting the single PR: the shared hook + wrapper + per-site edits are the entire footprint. No DB migrations, no schema changes, no feature flag required.
