# Quickstart — CRD Space Apply/Join Button on Dashboard

**Feature**: 088-crd-space-apply-button
**Date**: 2026-04-17

This guide covers the developer setup to run the feature locally, the CRD design-system toggle, and a nine-scenario manual verification matrix derived from the spec's user stories and FRs.

## Prerequisites

- Node ≥ 22.0.0, pnpm ≥ 10.17.1 (Volta-pinned Node 24.14.0)
- Alkemio backend running at `localhost:3000`
- Frontend dev server at `localhost:3001`

## 1. Install and run

```bash
pnpm install
pnpm start
```

The dev server picks up the feature branch automatically.

## 2. Enable the CRD design system

CRD is gated behind a per-browser localStorage flag, default off. Pick either method:

**Admin UI (recommended)**: Administration → Platform Settings → Design System → "CRD (New Design)".

**Browser console**:
```js
localStorage.setItem('alkemio-crd-enabled', 'true');
location.reload();
```

To disable and revert to MUI:
```js
localStorage.removeItem('alkemio-crd-enabled');
location.reload();
```

## 3. Manual verification matrix

Run each scenario on the CRD Dashboard of a Space at `http://localhost:3001/<space-nameid>` (which defaults to the Dashboard tab). Fixtures below assume standard seed data; adjust to your local environment.

### Scenario 1 — Anonymous guest on a public Space (FR-008, US1 scenario 1)

1. Sign out.
2. Open a public Space's Dashboard URL.
3. **Expect**: a "Sign in to apply" button at the top of the Dashboard content column, with helper text "You'll be redirected to sign in to Alkemio first." below.
4. Click the button. **Expect**: navigation to the sign-in page with the Space URL preserved as the return destination.
5. Sign in. **Expect**: return to the same Space Dashboard, the button now reflects the signed-in state (Apply / Join / etc.).

### Scenario 2 — Authenticated non-member, apply-required Space (FR-004, US1 scenario 3)

1. Sign in as a user with no membership in the target Space.
2. Open a Space whose community requires an application with answers.
3. **Expect**: "Apply" button at the top of the Dashboard.
4. Click "Apply". **Expect**: the application form dialog opens with the Space's application questions, optional form description, and community guidelines.
5. Fill valid answers and submit.
6. **Expect**: the form dialog closes; the "Application submitted" confirmation dialog opens.
7. Close the confirmation dialog. **Expect**: the Dashboard button transitions to "Application pending" (disabled) without a manual page refresh.

### Scenario 3 — Authenticated non-member, can-join Space (FR-005, US1 scenario 2)

1. Sign in as a user with no membership in the target Space.
2. Open a Space whose community allows direct join (no application form).
3. **Expect**: "Join" button at the top of the Dashboard.
4. Click "Join". **Expect**: the join confirmation dialog opens (same surface as apply, in "join" mode — no questions).
5. Confirm. **Expect**: the join mutation succeeds; the user is navigated into the Space; on re-render the Dashboard CTA section is absent (the user is now a member — US2).

### Scenario 4 — Authenticated member on their own Space (FR-009, US2)

1. Sign in as a user who is already a member of the target Space.
2. Open the Dashboard.
3. **Expect**: no call-to-action section. The content feed ("Activity") appears directly below the Space navigation tabs.
4. Check layout: no blank space is reserved above the feed, no layout shift as membership state resolves.

### Scenario 5 — Pending invitation (FR-006, US1 scenario 4)

1. Have an admin send an invitation to your account to join the Space.
2. Sign in as the invited user; open the Space Dashboard.
3. **Expect**: "Accept invitation" button at the top of the Dashboard.
4. Click the button. **Expect**: the invitation detail dialog opens with the invitation metadata, welcome message (if any), and community guidelines.
5. **Accept path**: click Accept. **Expect**: the dialog closes; the user is navigated into the Space; Dashboard CTA is absent on next render (user is now a member).
6. **Reject path**: click Reject. **Expect**: the dialog closes; the Dashboard CTA re-evaluates on the next user interaction (may remain pending or switch to another state).

### Scenario 6 — Existing pending application (FR-003, US1 scenario 5)

1. Sign in as a user with a previously submitted application to the Space.
2. Open the Dashboard.
3. **Expect**: "Application pending" button at the top, disabled. Clicking it does nothing (no dialog opens).

### Scenario 7 — Tab scoping: CTA only on Dashboard (FR-011, US3)

1. As a non-member, open the Space Dashboard. Confirm the CTA is visible.
2. Switch to the Community tab. **Expect**: no CTA visible anywhere on this tab.
3. Switch to the Subspaces tab. **Expect**: no CTA visible anywhere on this tab.
4. Return to the Dashboard tab. **Expect**: the CTA reappears in its correct state.

### Scenario 8 — CRD toggle swap (FR-002, FR-019, SC-010)

1. With the CRD toggle ON and as a non-member, confirm the CRD "Apply" / "Join" / etc. button renders on the Dashboard.
2. Disable the CRD toggle and reload.
3. **Expect**: the legacy MUI apply/join button renders in the same position on the Dashboard (via `src/domain/space/layout/tabbedLayout/Tabs/SpaceDashboard/SpaceDashboardPage.tsx:79-92`). No CRD chrome, no duplicated CTA, no client-side errors.
4. Re-enable the CRD toggle and reload. **Expect**: CRD button renders again.

### Scenario 9 — Mutation failure (FR-013, SC-010)

1. As a non-member on an apply-required Space, open "Apply" to get the form dialog open.
2. Stop the backend (or throttle the network to force the mutation to fail).
3. Submit the form.
4. **Expect**: the platform's existing toast/notification surfaces the error; the apply form dialog remains open with user-entered text intact.
5. Restart the backend and resubmit. **Expect**: success path behaves as scenario 2.

## 4. Automated verification

```bash
# Type + lint (Biome + ESLint, covers the new connector's prop contract)
pnpm lint

# Full test suite (existing; no new tests are required by this feature)
pnpm vitest run
```

Both commands must pass with no regressions. The existing 087 component tests continue to cover `SpaceAboutApplyButton` and the four flow dialogs. No new unit tests are required for the connector itself — it is a composition of already-tested pieces.

## 5. Accessibility spot checks (WCAG 2.1 AA — FR-014, FR-015, SC-008)

- Tab into the Dashboard from the tab navigation. **Expect**: the CTA button receives focus with a visible ring.
- With focus on the button, press Enter. **Expect**: the flow surface opens; focus moves inside the dialog.
- Inside the dialog, press Esc. **Expect**: the dialog closes; focus returns to the CTA button.
- Use a screen reader (VoiceOver / NVDA). **Expect**: the button's label is announced ("Apply", "Join", etc.); the helper text (unauthenticated state) is also read; decorative icons are skipped.

## 6. Mobile check (FR-016)

1. Open the Space Dashboard at a 360px viewport (Chrome DevTools → Mobile).
2. **Expect**: the CTA fits within the content column; the label does not overflow; no horizontal scroll; helper text sits directly beneath the button.

## 7. Known non-goals

- Contact-host affordance (About-only).
- "Read more" community guidelines inline surface on Dashboard (About-only).
- Per-section edit pencils (About-only).
- Subspace (L1/L2) Dashboard — the CRD Dashboard is L0-only in this iteration; subspace Space pages continue to render the legacy MUI layout unchanged.
