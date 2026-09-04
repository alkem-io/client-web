# Quickstart: Verifying the Permission-Aware Authorization Admin UI

**Feature**: 085-authz-admin-guard
**Date**: 2026-09-02

How to verify the feature end-to-end once implemented.

## Prerequisites

- Alkemio backend running locally. `pnpm start` runs Vite on `localhost:3001`, but open the application at `http://localhost:3000` — Traefik proxies it and serves the GraphQL endpoint at `http://localhost:3000/graphql`.
- Two accounts per surface under test:
  - **Privileged** — holds the required token on the target role set.
  - **Unprivileged** — can read the page but lacks that token. On surface 1 this is a platform admin who lacks the role-set token: `/admin` gates on `PLATFORM_ADMIN` on the *platform*, while the action is authorized against the *role set*, so this combination is reachable.
- No design-system toggle is needed. The `designVersion` / `alkemio-crd-enabled` machinery was removed with the legacy MUI app; every route renders its CRD page unconditionally.

## Step 0 — Reproduce the bug first

Before changing anything, confirm the defect on surface 1 as the **Unprivileged** user: click "Add user", observe the roster does not change and **no** error appears. This is the baseline the fix must eliminate; per constitution Workflow #5, do not proceed on assumption.

## Step 1 — Resolve Open Risk R1 (do this before implementing)

For each of surfaces 1, 2 and 3, determine the privilege the backend actually enforces. Either read the resolver's authorization policy, or empirically: as the **Unprivileged** user, open DevTools → Network, attempt the action, and inspect the `FORBIDDEN` error payload for the privilege it names. Record the token per surface — it is one argument at one call site, but getting it wrong disables the control for users who are in fact permitted.

Surface 4's tokens are already established in `useCommunityAdmin.ts:198-207` and need no investigation.

## Step 2 — Privileged path (no regression)

For each surface, as **Privileged**:

1. Confirm the add control is enabled with no tooltip.
2. Add a contributor → roster updates, no error toast.
3. Remove a contributor → confirmation dialog → roster updates, no error toast.

**Pass**: FR-009.

## Step 3 — Unprivileged path (the primary fix)

For each surface, as **Unprivileged**:

1. The add control renders gated; each per-member remove control renders gated too.
2. Hover → tooltip explains in plain language that permission is missing, naming **no** privilege token.
3. `Tab` to the control → it **receives focus** (it must remain in the tab order) and the tooltip appears on focus.
4. `Enter` / `Space` → nothing happens; no dialog, no network request (check the Network panel).
5. With a screen reader (VoiceOver / NVDA), the control announces as disabled and the reason is announced.

**Pass**: FR-002, FR-003, FR-004, FR-005, SC-005, SC-007.

## Step 4 — Error safety net

Simulates privileges revoked mid-session, where the UI still believes the action is permitted.

1. Force a genuine backend rejection — editing the DOM will **not** work here, because `GatedAction` still holds a `disabledReason` and suppresses the handler regardless of the rendered attribute. Use one of:
   - **Revoke mid-session**: load the surface as **Privileged**, then remove that privilege in another session, then act on the still-loaded page; or
   - **Force the response**: intercept the mutation at the network boundary (DevTools request override, or a proxy) and return a `FORBIDDEN` GraphQL error.
2. Complete the flow and submit.
3. A visible, dismissible error toast appears, worded as a permission problem and distinct from a generic network error.
4. The roster is unchanged.
5. **Exactly one** toast appears — not two. A double toast means the call-site handler is not filtered to `FORBIDDEN`/`FORBIDDEN_POLICY` and is racing the global handler.
6. The control is **not** silently corrected and nothing refetches (FR-016). Reload to see it return to its gated state.

**Pass**: FR-006, FR-007, FR-016, SC-001.

## Step 5 — Non-permission failures still notify

Go offline (DevTools → Network → Offline) and attempt an add as **Privileged**. A toast must still appear — from the global handler, unchanged. This confirms the call-site filter did not suppress anything it should not.

**Pass**: FR-006 across all failure classes.

## Step 6 — Loading state

Throttle to "Slow 3G", load a covered surface as **Privileged**, and watch the control during the initial query.

**Pass**: it is gated with "checking permissions" copy throughout and transitions straight to enabled — never enabled first (FR-008, SC-006).

## Step 7 — Inventory completeness

Repeat step 3 on all four surfaces from `research.md`. None may still show an ungated control. Surface 4 needs particular attention: `canAddUsers` was previously computed but never forwarded (Risk R2), so its add path was entirely ungated.

## Automated checks

```bash
pnpm lint
pnpm vitest run
```

Expected coverage:

- `useActionPermission` — one test per row of the derivation table in `data-model.md`.
- `GatedAction` — gated vs. ungated rendering; focusability under `aria-disabled`; tooltip on hover and on focus; suppressed activation.
- Per surface — an integration test asserting the control is gated without the privilege and enabled with it.
- Error path — a permission rejection produces exactly one notification; a network rejection produces none from the call site.
- i18n — the existing `common.parity.test.ts` must pass with the new keys across all six locales.

## Rollback

Revert the single PR. The footprint is one hook, one CRD component, edits to three presentational components and four glue sites, plus six locale files. No schema change, no migration, no feature flag.
