# Phase 1 — Quickstart: Platform-Admin Change User Login Email (Web Client)

**Feature**: 101-change-user-email | **Date**: 2026-05-20

How to build, run, and manually verify the feature. Pairs with the acceptance
scenarios in `spec.md` and the success criteria SC-001…SC-009.

---

## Prerequisites

- Node ≥ 24, pnpm ≥ 10.17 (`pnpm install`).
- A local Alkemio backend with **server spec 097 deployed** (the
  `adminUserEmailChange` / drift-resolve mutations and the audit queries must exist).
- A platform-administrator account to sign in with.
- At least one non-admin test user whose email can be safely changed on the dev
  stack.

## Build & run

```bash
pnpm codegen      # against the 097 backend — regenerates hooks for the new operations
pnpm lint         # TypeScript + Biome + ESLint
pnpm vitest run   # unit tests (incl. this feature's tests)
pnpm start        # dev server on localhost:3001
```

`pnpm codegen` must run **before** `pnpm lint` — the feature imports generated hooks
that do not exist until codegen runs.

---

## Manual verification

### A. Entry point & authorization (US1, FR-001/002, SC-005)
1. Sign in as a platform admin, go to **Global administration → Users**.
2. Each user row shows three trailing actions, in order: **email** action,
   license-plan action, delete. The email action sits **before** the other two.
3. The email action is **enabled** (you are a platform admin). Confirm a tooltip /
   accessible label describes it.

### B. Change a login email — happy path (US1, FR-003…012, SC-001/002)
4. Activate the email action on a test user's row. A dialog opens showing the
   **current** login email read-only, an empty **new email** input, an empty
   **confirm new email** input, and a **Reason & approval** section (reason, approver
   name, approver role, optional approver organization).
5. The dialog states plainly that this ends the user's sessions and that they must
   sign in with the new email afterwards.
6. With incomplete/invalid/mismatched input, **Submit is disabled** (try: invalid
   format; the current address; a confirm value that differs; a blank reason; a blank
   approver name or role).
7. Enter a valid, different new email; re-type it identically into confirm; fill the
   reason, approver name and approver role. Submit enables.
8. Submit. A **pending indicator** shows and Submit stays disabled until the server
   responds (do not allow a double-submit).
9. On success: a success confirmation shows the **new email** plus a note that the
   user has been emailed. The users list reflects the new email **without a manual
   refresh**.
10. On a dev stack: confirm the **old email can no longer sign in** and the **new
    email can** (SC-002).

### C. Errors (US2, FR-013…017, SC-003/004)
Drive each failure and confirm a distinct, human-readable message with the dialog
**staying open and input preserved**:
- Invalid format / unchanged address → inline field errors, **no server call**.
- Address already in use → **"This email address is already in use."** — generic,
  reveals nothing about the holder (SC-004).
- Subject has no usable identity → explains the user cannot be changed.
- Identity service unavailable / write failed with nothing applied → explains the
  change could not be completed and **no changes were made**; retry is possible.
- Partial-apply (drift) → message **directs to the Resolve action**.

### D. History (US3, FR-018…023, SC-006)
11. In the change dialog, click **View change history** → a dedicated page at
    `/admin/users/<userId>/email-history` opens.
12. Entries are **newest-first**; each shows timestamp, outcome, initiator display
    name, old email, new email, the recorded **reason** and **approver**, and a
    failure reason when present.
13. Outcomes render as **readable labels** (e.g. "Committed", "Rejected — address in
    use", "Committed — space admin notification not sent"), classified visually as
    success / success-with-warning / failure.
14. With more entries than one page, **Load more** fetches the next page.
15. For a user with no history, an **empty state** shows (not an error).
16. Only display names appear — no internal IDs as primary content.

### E. Drift (US4, FR-025…028, SC-007)
17. Open the change dialog for a user whose latest audit entry is a drift state → a
    **drift warning** with a **Resolve** action is shown. The dialog queries the user's
    latest record on open; the users list shows **no per-row drift indicator**.
18. Open Resolve → exactly **two radio options** (old email, new email); no free-text
    entry.
19. Pick one and submit → success confirmation; the drift warning **clears**.
20. Resolve when the drift was already reconciled elsewhere → message "nothing to
    resolve". A failed resolution leaves the drift warning in place (retryable).
21. For a user with no drift, opening the change dialog shows no drift warning and no
    Resolve action.

### F. Platform-admin notification preference (FR-031)
22. As a platform admin, open your **notification settings** (the MUI admin
    notifications tab and the CRD user notification settings page).
23. Confirm a **"user email changed"** platform-admin notification row is present with
    in-app / email / push channels, alongside the other platform-admin notifications.
24. Toggle a channel and save → the preference persists through the existing
    user-settings update flow and survives a reload.

---

## Automated test focus

Unit tests (Vitest) cover the pure, non-trivial logic:
- `emailChangeErrorMapping` — every 097 code → a defined message; unmapped → generic;
  `EMAIL_CHANGE_CONFLICT` → the fixed generic string.
- `emailChangeOutcome` — every `UserEmailChangeAuditOutcome` value → correct label +
  class (success / success-with-warning / failure); unknown value → safe fallback.
- The change-dialog yup schema — invalid format, unchanged address (case-insensitive),
  confirmation mismatch, and missing required reason / approver fields each block
  submit; a complete, valid form passes.
- Drift derivation — `DRIFT_DETECTED` / `DRIFT_RESOLUTION_FAILED` ⇒ drifted; all other
  latest outcomes ⇒ not drifted.

## Done when

All US1–US4 acceptance scenarios pass manually, SC-001…SC-009 hold, `pnpm lint` and
`pnpm vitest run` pass, and generated GraphQL artifacts are committed.
