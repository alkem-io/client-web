# Quickstart: Innovation Hub — Add Space by URL

**Phase**: 1 (Design)
**Date**: 2026-05-09

A short manual test plan that exercises every requirement and acceptance scenario from the spec. Use this to verify the implementation locally before opening a PR.

## Setup

1. `pnpm install`
2. Backend running at `http://localhost:3000` (Traefik → Alkemio API).
3. `pnpm codegen` — regenerate hooks after the `InnovationHubAvailableSpaces.graphql` file is deleted.
4. `pnpm start` → open `http://localhost:3001`.
5. Sign in as an account with platform admin or Innovation Hub admin permission.
6. Navigate to **Admin → Innovation Hubs → \<your hub> → Settings**.

## Pre-flight

- Have the URL of at least one **L0 Space** on the same instance (e.g. `http://localhost:3001/<space-name>`).
- Have the URL of at least one **subspace** (e.g. `http://localhost:3001/<space-name>/<subspace-name>`).
- Have a non-Alkemio URL (e.g. `https://example.com/foo`).
- Have a non-Space Alkemio URL (e.g. a user profile or organisation page).

## Test cases

### TC-1: Happy path — add a top-level Space (User Story 1, FR-006)

1. Click **Add**. The new dialog opens with one URL input.
2. Confirm the submit button is **disabled** while the input is empty.
3. Paste a valid L0 Space URL.
4. Confirm the submit button is **enabled**.
5. Click submit.
6. Observe: submit button disables, spinner appears, status text "URL is being validated…" shows.
7. Within ~1s the dialog closes, a "saved" notification appears, and the new Space appears at the bottom of the existing list.

### TC-2: Subspace URL → generic error (FR-007)

1. Click **Add**, paste a subspace URL, submit.
2. Observe: inline error "URL is not a valid top level space" below the input. Dialog stays open. Hub list unchanged.
3. Type one character into the input. Observe error clears.

### TC-3: Non-Alkemio URL → generic error (FR-007)

1. Open dialog, paste `https://example.com/foo`, submit.
2. Same generic error as TC-2.

### TC-4: Alkemio URL pointing to a non-Space → generic error (FR-007)

1. Open dialog, paste a user profile URL or an organisation URL, submit.
2. Same generic error as TC-2.

### TC-5: Unknown Alkemio URL (404) → generic error (FR-007)

1. Open dialog, paste a same-host URL with a fake nameID (e.g. `http://localhost:3001/this-space-does-not-exist`), submit.
2. Same generic error.

### TC-6: Already-in-Hub → distinct duplicate error (User Story 3, FR-008)

1. Pick a Space that is already in this Hub's list.
2. Open dialog, paste its URL, submit.
3. Observe: distinct inline message indicating the Space is already added to this Hub. Dialog stays open. List unchanged (no duplicate).

### TC-7: Empty / non-URL input (FR-003)

1. Open dialog. Confirm submit is disabled.
2. Type `not a url`. Confirm submit stays disabled.
3. Type ` ` (just whitespace). Confirm submit stays disabled.
4. Type `https://localhost:3001/foo`. Confirm submit enables.

### TC-8: Network error → generic error (FR-007 — failure modes)

1. Stop the backend (or block the GraphQL endpoint via DevTools → Network → "Block request URL").
2. Open dialog, paste a valid L0 Space URL, submit.
3. Observe: same generic error as TC-2 (no network details leaked).
4. Restore the backend. Edit the input. Resubmit. Observe success.

### TC-9: Cancel resets state

1. Open dialog, paste any URL, click cancel (or close).
2. Reopen. Observe input is empty and no error is showing.

### TC-10: Keyboard-only operability (FR-011)

1. Tab to the **Add** button, press Enter — dialog opens, focus lands on the URL input.
2. Type a valid L0 Space URL, press Tab to submit, press Enter — flow proceeds.
3. With an error showing, Tab navigates to the error message (or it is announced via `aria-live`).
4. Esc closes the dialog.

### TC-11: i18n (FR-010)

1. Switch the browser to a non-English locale supported by the app (e.g. Spanish).
2. Repeat TC-1 and TC-2. Confirm dialog title, labels, status text, error message, and duplicate message are localised. *(Crowdin will fill in non-English keys after the English source is committed; locally during dev expect English fallback for any not-yet-translated keys.)*

## Definition of Done

- All 11 test cases pass.
- `pnpm lint` clean.
- `pnpm vitest run` green.
- `pnpm codegen` produces no diff after running once.
- No imports of the deleted `InnovationHubAvailableSpaces.graphql` remain.
