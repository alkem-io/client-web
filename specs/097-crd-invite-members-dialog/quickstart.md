# Quickstart: Verifying the CRD Invite Members Dialog

**Feature**: [spec.md](spec.md)
**Plan**: [plan.md](plan.md)
**Created**: 2026-05-08

This guide is for QA / reviewers verifying the dialog manually. Engineering can run `pnpm vitest run src/crd/components/community/InviteMembersDialog.test.tsx` for the unit suite.

## Prerequisites

1. Working backend at `localhost:3000` (the dev server expects this).
2. Run `pnpm start` to bring up the SPA at `http://localhost:3001`.
3. Sign in as a Space admin who can read and admin a Space (e.g. `alkemio-admin@alkem.io`).
4. Enable the CRD design system in the browser console:
   ```js
   localStorage.setItem('alkemio-design-version', '2');
   location.reload();
   ```

## US1 — Invite an existing Alkemio user (P1)

1. Navigate to a Space you administer. Click the **Community** tab.
2. In the right-hand sidebar, click **Invite**.
3. The CRD Invite Members dialog opens. Verify:
   - Title reads `Invite others to join '<space name>'`.
   - The default welcome message contains the space name.
   - The role chip shows `Member` (the popover trigger is collapsed).
4. Type the first few letters of an existing user's display name. Verify:
   - Autocomplete dropdown appears below the input within ~300 ms.
   - Each row shows avatar, display name, and city/country (if available).
   - Your own user does NOT appear in the results.
5. Pick a user. Verify:
   - A chip with the user's avatar + display name appears below the input.
   - The user no longer shows in the dropdown until removed.
6. Click **Send**. Verify:
   - Send button shows a busy spinner and is disabled.
   - Result list appears with one row per invitee, each with a green "sent" indicator.
7. Click **Close**. The dialog dismisses. Reopen and confirm a fresh form view (no stale state).

## US2 — Invite by email (P1)

1. Open the dialog (steps 1-2 above).
2. Paste `a@example.com, b@example.com c@example.com` into the search field. Press Enter.
3. Verify three email chips appear, no error indicators.
4. Type `not-an-email` and press Enter. Verify a chip appears with a red invalid-email indicator and a tooltip explaining the error.
5. Type `a@example.com` (the duplicate) and press Enter. Verify a chip with a duplicate-email indicator.
6. Remove the two error chips by clicking the × on each.
7. Click **Send**. Verify the result list shows the three valid invitees.

## US3 — Grant Lead and Admin on invitation (P2)

1. Open the dialog. Pick a user.
2. Click the **Invite to be a:** trigger. The popover opens.
3. Verify Member is checked AND disabled (cannot be unchecked). Lead and Admin are unchecked.
4. Toggle Lead and Admin on. Close the popover (click outside).
5. The summary now reads `Member, Lead, Admin` (or your locale's equivalent).
6. Click **Send**. After the user accepts the invitation (out of band), confirm in the Space settings → Community tab that they hold all three roles.

## US4 — Per-invitee result feedback (P2)

1. Open the dialog. Add three invitees:
   - One existing user who is **not** a community member.
   - One existing user who **is** already a community member.
   - One email that the backend rejects (e.g. via a known-bad domain in your test env).
2. Click **Send**.
3. Verify the result list shows three rows in the same order:
   - Row 1: green "sent" indicator.
   - Row 2: amber "already a member" indicator.
   - Row 3: red "error" indicator with a human-readable error message.
4. Click **Back**. The form view returns. The chip list is empty. The welcome message and role selection are preserved (not reset).
5. Click **Close** to dismiss.

## Accessibility spot-checks

- Tab through the dialog with the keyboard. Order: Close (×) → Search → Welcome Message → Role trigger → Send.
- Press Esc on each view. The dialog dismisses.
- With NVDA / VoiceOver, the role popover trigger announces its value: "Invite to be a: Member, Lead. button. expanded false."
- The Send button while in flight announces as "busy."

## Regression checks

- Open a Space's **Community** tab in **non-CRD** mode (clear the localStorage flag). The legacy MUI dialog still opens normally — no broken state.
- Open the **Virtual Contributors** invite flow (e.g. from the VC block on a Subspace community). The legacy MUI VC dialog still opens — this spec does not touch it.

## Rollback

If the new dialog causes issues, the safest rollback is to revert the two CRD page edits (`CrdSpaceCommunityPage.tsx`, `CrdSpaceSettingsPage.tsx`) so they import `InviteContributorsDialog` from `@/domain/community/inviteContributors/InviteContributorsDialog` again. The new CRD components and translation files can stay in place — they're dead code without consumers.
