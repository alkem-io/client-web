# Feature Specification: CRD Invite Members Dialog

**Feature Branch**: `097-crd-invite-members-dialog`
**Created**: 2026-05-08
**Status**: Draft
**Input**: User description: "Migrate the 'Invite Member' dialog from MUI to the CRD design system. The dialog is opened from the Community tab sidebar (Invite button) and from the Space settings Community tab in CRD. From it, a Space admin invites users by selecting them from an autocomplete-style search, or by typing one or more email addresses for users who do not yet have an Alkemio account. The admin writes a welcome/invitation message (pre-filled with a default that mentions the space name) and picks the role(s) the invitees will be granted on accepting (Member is fixed; optional Lead and Admin). After sending, the dialog shows a per-invitee result list (success / already-member / error) with a Back button to send another batch and a Close button to dismiss. Defer the Virtual Contributor invite flow — out of scope here."

## Context

In the legacy MUI Space, the "Invite Member" dialog is opened from the Community tab and from the Space settings Community tab via an Invite button. It dispatches by contributor type to either the User invite flow or the Virtual Contributor invite flow; this spec covers only the **User** flow.

The User dialog lets a Space admin:

1. Select existing Alkemio users via an autocomplete that searches by display name and email.
2. Add **non-Alkemio** invitees by typing one or more email addresses (comma-separated; pasted lists supported). These produce email-only chips.
3. Mix selected users and email-only invitees in a single batch.
4. Edit the welcome message (pre-filled with a default that mentions the space name).
5. Pick the role(s) the invitees should receive on accepting. **Member** is always included and not removable; **Lead** and **Admin** are optional extras the admin can toggle on.
6. Send the invitations, then see a per-invitee result list (success / already-member / error) with a Back button to send another batch and a Close button to dismiss.

In the CRD migration, the legacy MUI `InviteContributorsDialog` (specifically `InviteUsersDialog`) is currently mounted from the new CRD pages (`CrdSpaceCommunityPage`, `CrdSpaceSettingsPage`). This breaks the CRD presentational rule that pages under `src/main/crdPages/` must not import from `@mui/*`. The dialog's visual language also clashes with the surrounding CRD chrome (different typography, different Send button shape, different chip style, etc.).

This spec brings the User invite flow to the CRD design system: a new presentational dialog under `src/crd/components/community/`, an integration connector under `src/main/crdPages/space/dialogs/` that reuses the existing Apollo hooks, and translations under `src/crd/i18n/community/` in all six supported languages. The legacy MUI dialog stays in place for any non-CRD callsites (e.g., `VirtualContributorsBlock`).

## Clarifications

### Session 2026-05-08

- Q: When the admin types one or more email addresses, how are multiple emails parsed in a single keystroke flow? → A: Same parser as the legacy dialog — `emailParser` accepts comma, semicolon, whitespace, and newline separators; pasted lists produce one chip per valid address; invalid addresses are rejected with a per-chip validation error indicator. (Confirmed against `src/domain/community/inviteContributors/components/FormikContributorsSelectorField/emailParser.ts`.)
- Q: Are the Lead and Admin role toggles independent, or does Admin imply Lead? → A: Independent — the admin can pick any subset of {Lead, Admin} on top of the always-fixed Member role. The backend mutation accepts an array of role names; this dialog merely surfaces the same selector. (Confirmed against `INVITE_USERS_TO_ROLES` in `src/domain/community/inviteContributors/users/InviteUsersDialog.tsx`.)
- Q: After Send, does the dialog stay open showing results, or close and surface a toast? → A: Stays open showing the per-invitee result list (matching the legacy UX). The result view has a Back button (clears selected contributors, returns to the form, retains welcome message and role selection) and a Close button (dismisses the dialog).

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Space admin invites existing Alkemio users to the community (Priority: P1)

A Space admin opens the Community tab of a CRD-enabled space and clicks **Invite** in the sidebar. The CRD Invite Members dialog opens, pre-filled with a default welcome message that names the space. The admin types a couple of letters of a user's display name into the search field, picks the user from the autocomplete results, repeats for one or two more users, optionally edits the welcome message, leaves the role at the default (Member only), and clicks Send. Each invitee appears in the result list with a green "sent" indicator. The admin clicks Close.

**Why this priority**: Inviting existing Alkemio users is the most common use case for this dialog and the path the admin will follow on a healthy, growing community. Without it, communities cannot grow beyond their initial seed under the CRD design system, blocking the rollout.

**Independent Test**: As a Space admin, on a CRD-enabled space, open the Community tab. Click the Invite button in the sidebar. Confirm the dialog opens with a default message that mentions the space name. Type the first few letters of an existing community member's name; confirm the autocomplete dropdown shows matching users with their avatar, display name, and city/country. Pick one. Confirm a chip appears for that user. Click Send. Confirm the result list shows the user with a success indicator. Click Close. Confirm the dialog dismisses and (in a refreshed view) the user has a pending invitation visible in the community settings.

**Acceptance Scenarios**:

1. **Given** a Space admin has opened the Invite Members dialog, **When** they type into the search field, **Then** the autocomplete dropdown shows up to 20 matching users by display name OR email, with avatar, display name, and city/country, and excludes both already-selected users and the admin themselves.
2. **Given** a search returns more than 20 matches, **When** the admin scrolls to the bottom of the dropdown, **Then** additional pages load automatically until exhausted, with a loading indicator while fetching.
3. **Given** the admin has selected one or more users, **When** they remove a chip, **Then** the user re-appears in the autocomplete results on the next matching search.
4. **Given** the admin has selected at least one user and the welcome message is non-empty, **When** they click Send, **Then** an invitation is created for each invitee with the chosen role(s) and welcome message, the form is replaced by the result list, and the Send button is disabled while the request is in flight.
5. **Given** a successful send, **When** the result list is shown, **Then** each invitee row shows the invitee identifier (display name for known users; email address for email-only invitees) and a per-row result indicator (sent / already a member / error with reason).
6. **Given** the result list is shown, **When** the admin clicks Back, **Then** the form view is restored, the selected-contributors chips are cleared, and the welcome message and role selection are retained.

---

### User Story 2 - Space admin invites people who don't yet have an Alkemio account (Priority: P1)

A Space admin wants to invite three external collaborators who have not yet joined Alkemio. They paste a comma-separated list of three email addresses into the invite field. Each address is validated and turned into an email chip. The admin sends, and each invitee receives an email with a link to join Alkemio and accept the space invitation.

**Why this priority**: Onboarding net-new users is the primary growth path for spaces. Without it, communities can only invite users who already exist on the platform — a major regression vs. the MUI dialog.

**Independent Test**: As a Space admin, open the Invite Members dialog. Paste `a@example.com, b@example.com c@example.com` into the search field and press Enter (or click an "Add" affordance, if surfaced). Confirm three email chips appear, each labelled with the email. Confirm an invalid email (e.g. `not-an-email`) is rejected with a per-chip error indicator. Click Send and confirm each external invitee appears on the result list.

**Acceptance Scenarios**:

1. **Given** the admin types text that contains one or more valid email addresses separated by commas, semicolons, whitespace, or newlines, **When** they press Enter (or trigger the explicit Add affordance), **Then** one chip is created per valid address and the input clears.
2. **Given** the admin types an invalid email, **When** they press Enter, **Then** the address is added as a chip with a visible validation-error indicator and is excluded from the Send batch (Send remains disabled until the invalid chips are removed or fixed).
3. **Given** the admin enters a duplicate email already present as a chip, **When** they press Enter, **Then** the duplicate is rejected with a duplicate-email error indicator and not added a second time.
4. **Given** the dialog is configured to invite only existing users (`onlyFromParentCommunity` mode used by sub-flows), **When** the admin types text, **Then** the email-paste path is unavailable and the admin can only pick existing platform users from the autocomplete.

---

### User Story 3 - Space admin grants Lead and/or Admin roles on invitation (Priority: P2)

A Space admin is inviting a co-host who should immediately become both a Lead and an Admin on accepting. They pick the user from autocomplete, then in the role selector toggle Lead and Admin on (Member is always selected and cannot be removed). They send and confirm both roles are applied on the invitation.

**Why this priority**: This is the only way the admin can promote on invite without a follow-up edit step. Without it, communities have to do a second manual edit per invitee, which is a friction regression.

**Independent Test**: Open the dialog, pick a user, toggle Lead and Admin on. Confirm Member remains fixed. Send. After acceptance (out of scope for the dialog itself), confirm the invitee holds Member + Lead + Admin roles in the space.

**Acceptance Scenarios**:

1. **Given** the role selector is showing Member as a fixed chip plus toggles for Lead and Admin, **When** the admin opens the selector, **Then** Member is checked and disabled (cannot be removed), and Lead and Admin are unchecked by default.
2. **Given** the admin toggles Lead on, **When** they close the selector, **Then** the selector summary line shows "Member, Lead" (or the equivalent localized order).
3. **Given** the admin toggles both Lead and Admin on, **When** they click Send, **Then** the invitation is created with all three roles in its `extraRoles` payload.

---

### User Story 4 - Per-invitee result feedback after send (Priority: P2)

After a Send batch, the admin sees a result list with one row per invitee, each showing whether the invitation succeeded, was rejected because the invitee is already a community member, or failed for another reason (with a brief error message). The admin can scroll the list, click Back to start a new batch, or click Close to dismiss the dialog.

**Why this priority**: Without explicit per-invitee feedback the admin cannot tell which of a 10-person batch failed silently — an accountability requirement for community managers.

**Independent Test**: Send a batch that mixes a never-invited user (success), a current community member (already-member), and an email that the backend rejects (error). Confirm the result list shows three rows with three distinct per-row indicators and that the error row carries a human-readable error message.

**Acceptance Scenarios**:

1. **Given** the Send call has resolved, **When** the result list renders, **Then** there is exactly one row per invitee in the original batch (no rows are silently dropped).
2. **Given** the Send call has not yet resolved, **When** the form is in flight, **Then** the Send button shows a busy state with `aria-busy={true}`, is disabled, and no result list is shown.
3. **Given** the Send call fails entirely (network error etc.) before per-invitee results are returned, **When** the failure surfaces, **Then** an error toast is shown and the form view is preserved with all chips intact (no result view is rendered).
4. **Given** the result list is shown, **When** the admin clicks Close, **Then** the dialog dismisses and the next time it is reopened it starts fresh on the form view (no stale results, default welcome message, no chips).

---

### Edge Cases

- A user types text that contains no `@` symbol and presses Enter — the text is treated as a free-text "intent to add an email" and produces a chip with an invalid-email indicator (caught by the same parser).
- The admin pastes a 50-email list — each valid address becomes a chip; the dialog scrolls if the chip list overflows the form area; invalid addresses are individually flagged.
- The admin invites a user who has already received an invitation that is still pending — the result row shows the platform's existing dedup behavior (typically "already invited"); this dialog surfaces the result without inventing a new state.
- The admin opens the dialog while the space is still loading — the dialog renders with a loading state and the Send button is disabled until `roleSetId` and `spaceName` are resolved.
- The admin clears the welcome message field — Send is disabled (welcome message is required, matching the legacy validation).
- The admin closes the dialog mid-flight (Send already submitted) — the closing happens after the response resolves; we do not abort an in-flight invitation batch (matching legacy behavior).
- The dialog opens for a non-L0 (subspace) space — the `parentSpaceId` is plumbed so the autocomplete can prefer parent-community members; the email-paste path is hidden when `onlyFromParentCommunity` is true.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The CRD Invite Members dialog MUST be opened from the same two entry points as the legacy MUI dialog when in CRD mode: the **Invite** button on the Space sidebar's community variant, and the equivalent Invite affordance on the Space settings Community tab.
- **FR-002**: The dialog MUST contain — in this order, top-to-bottom — a header with the space name, a description sentence, a contributor selector (autocomplete + email paste), a chip row for selected/typed contributors, a welcome-message textarea pre-filled with a default that mentions the space name, a footer note about email visibility, a role selector defaulting to Member, and a Send button.
- **FR-003**: The contributor selector MUST search the platform user directory by display name AND email, return up to 20 results per page, and lazy-load further pages as the admin scrolls. Selected users and the admin themselves MUST be filtered out of the results.
- **FR-004**: The contributor selector MUST accept free-text email entry, parse comma/semicolon/whitespace/newline-separated lists into one chip per address, and surface per-chip validation errors for invalid or duplicate addresses.
- **FR-005**: The dialog MUST disable Send while any of the following are true: zero contributors selected, any selected contributor has a validation error, the welcome message is empty, no role is selected, the Apollo data layer reports `loading`, or a Send batch is already in flight.
- **FR-006**: The role selector MUST always include Member as a fixed (non-removable) selection and offer Lead and Admin as optional toggles. The Send mutation MUST receive the union of selected roles.
- **FR-007**: After Send resolves, the dialog MUST replace the form view with a result list showing one row per invitee. Each row MUST show the invitee's identifier (display name for known users, email for email-only) and a per-row outcome indicator (sent / already member / error with reason).
- **FR-008**: The result list MUST offer two actions: **Back** (clears the chip list, restores the form view, retains the welcome message and role selection) and **Close** (dismisses the dialog).
- **FR-009**: When the dialog is dismissed and reopened, it MUST restart on the form view with an empty chip list, the default welcome message, and the default role (Member only).
- **FR-010**: The dialog MUST receive its open / close state and the `roleSetId` / `spaceName` it operates on as props from the integration layer; the CRD presentational component MUST NOT call any Apollo hook, GraphQL document, or routing utility directly.
- **FR-011**: All user-visible text MUST come from the `crd-community` translation namespace (or a passed-in label prop). Translations MUST exist in all six supported languages (en, nl, es, bg, de, fr) before merge.
- **FR-012**: The dialog MUST meet WCAG 2.1 AA: dialog `role="dialog"` with `aria-modal="true"`, focus trapped while open, Esc dismisses, the search field has a persistent `aria-label`, the Send button toggles `aria-busy` while in flight, the role selector exposes its expanded state via `aria-expanded`, and the result list rows expose their per-row outcome via accessible text (not color alone).
- **FR-013**: The legacy MUI `InviteContributorsDialog` MUST remain importable from `src/domain/` and continue working for any non-CRD callsite (e.g., `VirtualContributorsBlock`). This spec MUST NOT delete it.

### Key Entities

- **Invitee**: A row in the contributor list. Either `{ kind: 'user', userId, displayName, avatarUrl }` (existing Alkemio user picked from autocomplete) or `{ kind: 'email', email, validationError? }` (free-text email-only invitee). The dialog renders a chip per invitee.
- **InvitationBatch**: The form's working state. `{ contributors: Invitee[], welcomeMessage: string, extraRoles: Role[] }`. Submitted as one Apollo mutation that produces an array of per-invitee `InvitationResult`s.
- **InvitationResult**: A row on the post-send result view. `{ invitee: Invitee, outcome: 'sent' | 'alreadyMember' | 'error', errorMessage?: string }`.
- **Role**: One of `Member`, `Lead`, `Admin`. The dialog forces `Member` to always be present in the selection.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Space admin can open the dialog, select 3 existing users via autocomplete, accept the default welcome message and role, send, and see the result list — all within 30 seconds, without any MUI components rendering inside `src/main/crdPages/`.
- **SC-002**: A Space admin can paste a comma-separated list of up to 20 email addresses, see one chip per valid address with invalid addresses individually flagged, and send all valid addresses in a single batch.
- **SC-003**: 100% of user-visible strings in the new dialog are loaded via `t('crd-community:...')` and present in all six supported languages — verified by the existing CRD parity test pattern.
- **SC-004**: A keyboard-only user can open the dialog, navigate through Search → chip list → Welcome message → Role selector → Send, and trigger Send via Enter without using a mouse.
- **SC-005**: When the dialog opens on a slow network and the underlying space query is still loading, the admin sees a clear loading state and Send is disabled until the data resolves — no silent "Send" against an undefined `roleSetId`.
- **SC-006**: Removing the legacy MUI dialog import from `CrdSpaceCommunityPage.tsx` and `CrdSpaceSettingsPage.tsx` causes zero pixels of MUI typography or chrome to leak into the CRD community surface.

## Assumptions

- The existing Apollo hooks and mutations (`useInviteUsersDialogQuery`, `useRoleSetApplicationsAndInvitations.inviteContributorsOnRoleSet`) are stable and do not need changes for this migration. The dialog migration is UI-only.
- The existing `emailParser` (`src/domain/community/inviteContributors/components/FormikContributorsSelectorField/emailParser.ts`) is reusable from the integration layer. The CRD presentational layer does not parse emails directly; it receives validated chip data via props.
- The `useContributors` hook and its filter/pagination semantics are reusable from the integration layer. The CRD presentational layer does not query the user directory directly.
- The Virtual Contributor invite flow is intentionally out of scope. `InviteContributorsDialog` continues to dispatch by `ActorType` and routes VC invites to the legacy `InviteVCsDialog`.
- The CRD `Dialog` primitive (Radix-based) is sufficient for focus-trap, Esc dismiss, and backdrop click. No new primitive is required.

## Out of Scope

- Migrating the Virtual Contributor invite dialog (`InviteVCsDialog`) — separate spec.
- Migrating `InviteContributorsWizard` — that is an L0/L1 multi-step flow used in other contexts; out of scope.
- Replacing the underlying mutation, payload shape, or backend role enum.
- Auto-deletion of the legacy MUI dialog — it stays in place for non-CRD callsites until those are migrated.

## Dependencies

- CRD primitives: `Dialog`, `Input`, `Textarea`, `Avatar`, `Button`, `Badge`, `Popover`, `Checkbox` (or equivalent role-toggle UI).
- CRD form: `UserSelector` (`src/crd/forms/UserSelector.tsx`) — extended with email-paste support if it proves cheaper than building a sibling `ContributorSelector`. Decision deferred to plan.md.
- Reusable from domain layer: `emailParser`, `useContributors`, `useRoleSetApplicationsAndInvitations`, `useInviteUsersDialogQuery`, `INVITE_USERS_TO_ROLES`.
- Translation files: a new `src/crd/i18n/community/community.<lang>.json` registered in `crdNamespaceImports` (`src/core/i18n/config.ts`).
