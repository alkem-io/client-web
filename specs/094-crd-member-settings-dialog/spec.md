# Feature Specification: CRD Member Settings Dialog

**Feature Branch**: `094-crd-member-settings-dialog`
**Created**: 2026-04-28
**Status**: Draft
**Input**: User description: "Migrate the 'Member settings' dialog from MUI to the CRD design system. The dialog allows a Space admin to toggle a community member's lead and admin roles, view a max-leads cap warning, and remove the member with confirmation. It opens from the same entry points as the MUI version: row-level affordances on the members and organizations tables in the Space community settings tab. Follow CRD CLAUDE.md presentational rules; integration glue lives in src/main/crdPages; translations go under src/crd/i18n in en/nl/es/bg/de/fr."

## Context

In the legacy MUI Space settings, every row of the community Members table and Organizations table exposes an "edit" affordance that opens a dedicated **Member settings** dialog. From this dialog, a Space admin can:

1. Toggle the member's **lead** role (with a helper text and a max-leads cap that disables the toggle for non-leads when the cap is reached).
2. Toggle the member's **admin** role (users only — organizations cannot be admins).
3. **Remove** the member from the community, with an explicit confirmation step.
4. **Save** lead/admin role changes together, or **Cancel** without persisting.

The dialog consolidates the three management actions into a single, consistent surface — admins find every way to change a member's standing in the same place, and the destructive action is co-located with the role toggles so it cannot be triggered accidentally.

In the new CRD Space settings (`src/main/crdPages/topLevelPages/spaceSettings/community/`), this dialog does not exist. The CRD Community tab today scatters partial functionality across per-row dropdown items: a "Promote / demote lead" item, a "View profile" item, and a destructive "Remove" item that fires immediately without confirmation. There is **no way** to set a member as admin in the CRD design system at all, the max-leads helper text is missing, and the destructive Remove action skips the confirmation step that the MUI version requires.

This spec brings the CRD community settings to feature-parity with the MUI version by introducing the **Member settings** dialog in the CRD design language and wiring it from the same entry points (the members and organizations tables) the MUI version uses, so that environments running with `alkemio-crd-enabled` can perform every member-management action that legacy MUI environments can.

## Clarifications

### Session 2026-04-28

- Q: How does a row in the Members / Organizations table open the Member settings dialog? → A: Per-row `⋮` (MoreHorizontal) dropdown menu with — in this order — **View Profile** (navigation), **Change Role** (opens the Member settings dialog), and **Remove from Space** (destructive, opens a confirmation prompt). The Remove from Space dropdown item and the in-dialog Remove affordance both converge on the same confirmation prompt and the same removal mutation. (Confirmed against prototype `SpaceSettingsCommunity.tsx:534-562`.)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Space admin promotes a community member to lead (Priority: P1)

A Space admin viewing the Community tab of Space settings wants to mark an existing community member as a lead so that the user is shown as one of the hosts of the community. The admin opens the row-level affordance on the member, sees the current lead state, toggles the lead checkbox on, saves, and the row reflects the new lead role.

**Why this priority**: Designating leads is the most common reason an admin opens this dialog. Without it, communities cannot reorganize their hosts under the CRD design system, blocking the rollout.

**Independent Test**: As a Space admin, on the CRD Space settings → Community tab, click the row-level affordance on a non-lead member. The Member settings dialog opens. Toggle the lead checkbox on, click Save. Confirm the dialog closes, the row's role label updates to "Lead," and reopening the dialog shows the lead checkbox as checked.

**Acceptance Scenarios**:

1. **Given** a community member who is not a lead and the lead cap has not been reached, **When** the admin opens the Member settings dialog and toggles the lead checkbox on, **Then** the lead checkbox is checked, the Save button becomes enabled, and the helper text about the max number of leads remains visible.
2. **Given** the admin has toggled the lead checkbox to a new value, **When** they click Save, **Then** the role change is persisted, the dialog closes, the member's role label in the table updates accordingly, and no further confirmation is required.
3. **Given** a community member who is currently a lead, **When** the admin opens the dialog, **Then** the lead checkbox is checked by default and the helper text remains visible regardless of the max-leads cap (so the admin can always demote an existing lead).
4. **Given** the lead cap has been reached for the community, **When** the admin opens the dialog for a non-lead member, **Then** the lead checkbox is disabled and the existing helper text explains that the maximum has been reached.
5. **Given** the admin opens the dialog and makes no changes, **When** they click Cancel or close the dialog, **Then** no mutations are sent and the member's role remains unchanged.

---

### User Story 2 - Space admin grants or revokes admin rights for a member (Priority: P1)

A Space admin needs to grant another user the right to administer the community (manage its content and contributors) — or to revoke that right when responsibilities change. The admin opens the Member settings dialog for the user, toggles the admin checkbox, and saves. This action is only available for individual users; it is not shown for organizations.

**Why this priority**: There is currently no way to grant or revoke admin rights from the CRD UI. Without this dialog, the only way to change admin status under CRD is to fall back to MUI, which makes a CRD-only deployment impossible.

**Independent Test**: As a Space admin, on the CRD Space settings → Community tab, open the Member settings dialog for a non-admin user. Toggle the admin checkbox on, click Save. Confirm the role label updates to reflect admin status. Reopen the dialog: the admin checkbox is checked. Toggle it off, save, and confirm the user is no longer an admin.

**Acceptance Scenarios**:

1. **Given** an individual community member, **When** the admin opens the dialog, **Then** an Authorization section is shown containing the admin checkbox alongside its descriptive label.
2. **Given** an organization community member, **When** the admin opens the dialog, **Then** the Authorization section and admin checkbox are not shown (organizations cannot hold the admin role).
3. **Given** the admin toggles the admin checkbox to a new value and clicks Save, **Then** the admin role change is persisted alongside any lead change made in the same dialog.
4. **Given** the admin makes both a lead change and an admin change in one session, **When** they click Save, **Then** both changes are committed and the table row reflects the new effective role label.
5. **Given** an admin role change fails server-side, **When** the failure occurs, **Then** the dialog stays open, no partial UI change is committed, and the user is informed of the failure via the platform's existing toast/notification mechanism so they can retry.

---

### User Story 3 - Space admin removes a member from the community (Priority: P1)

A Space admin needs to remove a user or organization from the community — for example after a contractor leaves or an organization withdraws. The admin opens the Member settings dialog, activates the Remove section, sees an explicit confirmation prompt with the member's name, confirms, and the member is removed from the community (and from any subspaces they were a member of through this community).

**Why this priority**: Member removal is destructive and irreversible. The CRD UI today removes members on a single click without confirmation, which is a regression compared to MUI's confirm dialog. Closing this gap is required before CRD can be the default for any production tenant.

**Independent Test**: As a Space admin, trigger the Remove flow via two paths and verify both behave identically: (1) open the Member settings dialog and activate the in-dialog Remove member affordance; (2) open the row's `⋮` dropdown and activate **Remove from Space**. In both cases, a separate confirmation surface appears showing the member's display name and the cascade warning ("will be removed from all underlying subspaces"). Cancel — the member remains. Reopen and Confirm — the member is removed from the table.

**Acceptance Scenarios**:

1. **Given** the Member settings dialog is open for a member, **When** the admin activates the Remove member affordance, **Then** a confirmation prompt appears displaying the member's display name and stating that the action also removes them from underlying subspaces and cannot be undone.
2. **Given** the confirmation prompt is shown, **When** the admin cancels it, **Then** the prompt closes, the Member settings dialog stays open at the same state, and no mutation is sent.
3. **Given** the confirmation prompt is shown, **When** the admin confirms, **Then** the removal mutation is sent, both the confirmation prompt and the Member settings dialog close on success, and the member's row disappears from the table without a manual refresh.
4. **Given** the removal mutation fails, **When** the failure occurs, **Then** the confirmation prompt remains open with the confirm button re-enabled, no partial change appears in the table, and the user is informed of the failure via the platform's toast/notification mechanism.
5. **Given** the admin lacks the privilege to remove the specific member type (e.g., they cannot remove organizations), **When** the dialog opens for that member, **Then** the Remove member section is not displayed.

---

### User Story 4 - Admin opens Member settings from organization rows (Priority: P2)

A Space admin manages organization community members the same way they manage individual users — from the Organizations table, the same row-level affordance opens the Member settings dialog so the admin can toggle the organization's lead role or remove it from the community. The admin checkbox is not shown because organizations cannot be admins.

**Why this priority**: Organization management is part of the Community tab today in both MUI and CRD. Parity here means admins do not have to learn two different mental models for managing humans versus organizations.

**Independent Test**: As a Space admin, on the CRD Space settings → Community tab → Organizations sub-table, click the row-level affordance on an organization. The Member settings dialog opens with the organization's display name and avatar, only the lead toggle, and the Remove member affordance — no admin checkbox. Toggling the lead, saving, and the row reflects the new state.

**Acceptance Scenarios**:

1. **Given** the Organizations table on the Community tab, **When** the admin opens the Member settings dialog for an organization, **Then** the dialog renders the organization's display name and avatar, the lead checkbox with its helper text, and the Remove member affordance — without the Authorization (admin) section.
2. **Given** the admin toggles an organization's lead role and clicks Save, **Then** the change is persisted via the appropriate organization-role mutation, the dialog closes, and the row's role label updates.
3. **Given** the admin removes an organization via the Remove flow, **Then** the same confirmation behavior described in Story 3 applies, and on confirmation the organization is removed from the Organizations table.

---

### User Story 5 - Admin opens Member settings from a consistent row dropdown (Priority: P2)

An admin finds the new CRD Member settings dialog from each row's `⋮` dropdown menu in the Members and Organizations tables. The dropdown contains, in order: **View Profile** (navigation, separate from settings), **Change Role** (opens the Member settings dialog described in Stories 1–4), and **Remove from Space** (destructive, opens the same confirmation prompt the in-dialog Remove affordance uses). The dropdown shape, label set, and ordering match the prototype reference (`prototype/src/app/components/space/SpaceSettingsCommunity.tsx`).

**Why this priority**: A consistent dropdown entry point matches the prototype design system, ensures no destructive action runs without a confirmation prompt, and keeps the navigation action (View Profile) distinct from the settings actions.

**Independent Test**: On the CRD Members and Organizations tables, every row that the viewer can manage exposes a `⋮` dropdown containing View Profile / Change Role / Remove from Space. Activating "Change Role" opens the Member settings dialog. Activating "Remove from Space" opens the same confirmation prompt that the dialog's own Remove affordance opens. Activating "View Profile" navigates to the member's profile.

**Acceptance Scenarios**:

1. **Given** any row of the Members or Organizations table for a community on which the user has the Roleset-Entry-Role-Assign privilege, **When** the user opens the row's `⋮` dropdown, **Then** the dropdown shows **View Profile**, **Change Role**, and **Remove from Space** items in that order, with a separator before the destructive item.
2. **Given** the dropdown is open, **When** the user activates **Change Role**, **Then** the Member settings dialog opens for that member as described in Stories 1–4.
3. **Given** the dropdown is open, **When** the user activates **Remove from Space**, **Then** the same confirmation prompt described in Story 3 appears (with the cascade-removal warning), and confirming or cancelling has the same effect as triggering the prompt from inside the Member settings dialog.
4. **Given** a user without the Roleset-Entry-Role-Assign privilege on the community, **When** they view the Members or Organizations table, **Then** the Change Role and Remove from Space dropdown items are not shown (View Profile remains, since it is navigation rather than a settings action).
5. **Given** the dialog is open, **When** the user navigates to a different row's Change Role, **Then** the previous dialog closes and the new dialog opens scoped to the newly selected member.

### Edge Cases

- **Admin removes themselves**: When the current viewer is the same user as the row, the Remove member affordance must be hidden so admins cannot lock themselves out of their own community.
- **Last admin self-demotion**: When the current viewer toggles their own admin checkbox off and saves, the system relies on backend authorization to reject the change (or cascade correctly). The dialog itself does not pre-empt the call; failure is surfaced via the toast pattern in FR-014.
- **Lead cap reached mid-session**: A lead cap that fills while the dialog is open (e.g., another admin promoted a different member in another tab) does not prevent the admin from saving an in-flight demotion; promotions are guarded server-side, and a server-side rejection is surfaced via the toast pattern.
- **Member changes role mid-session**: If the underlying member's `isLead` or `isAdmin` changes while the dialog is open (in another tab), the dialog continues to operate on the values it loaded with; saving submits the change relative to those values. A server-side conflict triggers the toast and keeps the dialog open.
- **Display name missing**: If the member has no display name (empty profile), the dialog still renders, showing the avatar with default initials and an empty name slot. Other actions remain functional.
- **Long display name / location**: Display names, cities, and countries that exceed available width truncate with ellipsis; the avatar is not displaced.
- **Mobile viewport**: Dialog occupies the available width with the same content order, all checkboxes remain tappable (≥ 44px touch targets), and the confirmation prompt is also operable.
- **Keyboard-only operation**: Tab order proceeds: Avatar/Name (read-only) → Lead checkbox → Admin checkbox (if present) → Remove link (if present) → Cancel → Save → Close (X). Esc closes the dialog. The confirmation prompt is also fully keyboard-operable, with Enter activating Confirm and Esc cancelling.
- **CRD toggle off**: Navigating to the Space settings community page renders the legacy MUI page and dialog unchanged.
- **Concurrent Save and Remove**: If the user clicks Remove while a Save is in flight, the dialog disables interactive controls until the in-flight mutation settles, then proceeds with the Remove flow.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the CRD design system is enabled (via the `alkemio-crd-enabled` localStorage toggle), the system MUST provide a Member settings dialog in the CRD visual language that is reachable from each row of the Members table and the Organizations table in the Space settings → Community tab.
- **FR-002**: When the CRD design system is disabled (toggle off or unset, the default), the system MUST continue rendering the existing MUI Member settings dialog at its current entry points with no behavioral change.
- **FR-003**: The dialog MUST display the member's avatar and display name in a read-only header chip, mirroring the legacy dialog's identification block. Optional location data (city, country) MAY be shown alongside the name when available, consistent with how member chips render elsewhere in CRD.
- **FR-004**: The dialog MUST contain a Role section with a single labeled checkbox titled "This member is a lead," with the descriptive text "Leads are shown as the hosts of the community." The role-section content MUST be visible whenever the dialog is open.
- **FR-005**: Below the lead checkbox, the dialog MUST display a helper text explaining that the community has a specific maximum number of leads and that, when the maximum is reached, the lead option becomes disabled for members that are not currently leads.
- **FR-006**: The lead checkbox MUST be disabled when (a) the maximum leads cap has been reached AND the member is not currently a lead, or (b) the minimum-leads policy prevents the demotion of the current lead. In all other cases the checkbox MUST be enabled.
- **FR-007**: For individual users only, the dialog MUST display an Authorization section containing a single labeled checkbox titled "This member is an admin," with the descriptive text "(s)he has the right to administer this community and all of its content and contributors." Organizations MUST NOT see the Authorization section.
- **FR-008**: The dialog MUST display a Remove member section (with section title and an explicit destructive affordance) whenever the current viewer has the privilege to remove the member. The affordance MUST present the warning text "Click here to remove this user from this community. Be careful, this action cannot be undone." and trigger a separate confirmation prompt before issuing the removal.
- **FR-009**: The Remove confirmation prompt MUST display the member's display name and an explicit warning that the member will also be removed from any underlying subspaces they belong to through this community, and that contributions remain in place. The prompt MUST require an explicit Confirm action; Cancel MUST close the prompt without sending any mutation.
- **FR-010**: The dialog footer MUST contain a Cancel control and a Save control. Cancel MUST close the dialog without sending any mutation. Save MUST submit any role changes (lead and/or admin) that differ from the loaded values and close the dialog on success. Save MUST be a no-op (close only) if the user made no changes.
- **FR-011**: While a Save mutation is in flight, the Save control MUST display a busy state and the dialog MUST prevent re-submission. Other interactive controls (Cancel, Remove, role checkboxes) MUST be disabled while a mutation is in flight to prevent concurrent edits.
- **FR-012**: While a Remove mutation is in flight, the Confirm control of the confirmation prompt MUST display a busy state, the prompt MUST prevent re-submission, and the underlying Member settings dialog MUST remain open until the mutation settles successfully (after which both surfaces close).
- **FR-013**: The dialog MUST be closable via an explicit close control (X), the Esc key, or clicking outside the dialog. Closing MUST not persist any in-flight role changes.
- **FR-014**: When any user-initiated mutation triggered from the dialog (lead role change, admin role change, member removal) fails, the system MUST surface the failure via the platform's existing toast/notification mechanism. The originating surface (the dialog or the confirmation prompt) MUST remain open with controls re-enabled so the user can retry without re-entering data. No partial state change MUST be reflected in the table or in the dialog until the corresponding mutation succeeds.
- **FR-015**: Each row of the Members and Organizations tables MUST expose a `⋮` (MoreHorizontal) dropdown containing — in this order — **View Profile** (navigation), **Change Role** (which opens the Member settings dialog), and **Remove from Space** (destructive, which opens a confirmation prompt). The Change Role and Remove from Space items MUST appear only for users holding the Roleset-Entry-Role-Assign privilege on the community; View Profile MAY remain visible for any viewer with row visibility. The destructive Remove from Space item and the in-dialog Remove affordance MUST converge on the same confirmation prompt and the same removal mutation. The previously-existing per-row "Promote/demote lead" item MUST be removed from the CRD UI; lead promotion/demotion is performed exclusively from inside the Member settings dialog opened via Change Role.
- **FR-016**: The dialog MUST hide the Remove member section when the current viewer is the same user as the dialog's subject (an admin cannot remove themselves through this dialog).
- **FR-017**: All user-visible strings introduced by the CRD Member settings dialog MUST live in a CRD i18n namespace under `src/crd/i18n/<feature>/` and MUST be present in all six supported languages (English, Dutch, Spanish, Bulgarian, German, French). Missing translations MUST fall back to English without crashing.
- **FR-018**: The dialog MUST be operable via keyboard alone: tab order proceeds through interactive elements in a logical order, focus is trapped inside the dialog while open, Esc closes, and focus returns to the row affordance that opened it on close. The same MUST hold for the Remove confirmation prompt.
- **FR-019**: All interactive elements (close, role checkboxes, Remove affordance, Cancel, Save, Confirm, prompt-Cancel) MUST be reachable by assistive technologies with appropriate accessible names and roles. Decorative icons (e.g., the trash icon) MUST be hidden from assistive technologies and the action's intent MUST come from the visible label.
- **FR-020**: The dialog MUST be operable on mobile viewports: content scrolls within the dialog, all checkboxes meet a minimum 44px touch target, dismiss controls remain accessible, and no element overlaps the close control.
- **FR-021**: The CRD presentational component MUST NOT import from `@mui/*`, `@emotion/*`, `@/core/apollo/*`, `@apollo/client`, `@/domain/*`, `@/core/auth/*`, `@/core/state/*`, `react-router-dom`, or `formik`. All data and event handlers MUST flow in through props. Integration with mutations and Apollo cache MUST live in the consumer layer under `src/main/crdPages/`.
- **FR-022**: Toggling the CRD design system on or off and reloading the page MUST swap which version of the dialog renders (CRD vs. MUI) without requiring further configuration, mirroring the existing CRD-toggle behavior.
- **FR-023**: This feature applies to top-level Spaces (Level 0) only in this iteration, matching the scope of the legacy MUI dialog (which is reachable only from `SpaceAdminCommunityPage` for Level-0 Spaces). The CRD presentational component MUST nonetheless accept level-aware data so a future subspace-settings migration is a wiring change, not a redesign.

### Key Entities *(include if feature involves data)*

- **Community Member (User)**: An individual user belonging to a Space's community. Attributes referenced in the dialog: identifier, display name, optional first name (used in the removal confirmation), avatar URL, optional city/country, current `isLead` flag, current `isAdmin` flag.
- **Community Member (Organization)**: An organization belonging to a Space's community. Attributes referenced in the dialog: identifier, display name, avatar URL, optional location, current `isLead` flag. (Organizations have no `isAdmin` concept.)
- **Community Role-Set Policy**: The community's policy that governs which roles a viewer may assign and remove. Drives the `canAddLead` / `canRemoveLead` gating for users and organizations and is also the source of the maximum-leads cap.
- **Member Settings Dialog State**: Local visual state owned by the dialog — current `isLead` checkbox value, current `isAdmin` checkbox value (when applicable), confirmation-prompt open flag, save-in-flight flag, remove-in-flight flag.
- **Removal Confirmation**: A separate confirmation surface presenting the member's display name and a cascading-removal warning, returning a Confirm or Cancel decision.
- **Toast / Notification (existing)**: The platform's existing transient notification mechanism, used to surface mutation failures without closing the originating surface.
- **CRD Feature Toggle**: The per-browser preference (`alkemio-crd-enabled`) that selects which design system renders Space settings. Default off; when on, the CRD Community tab and its row-level Member settings affordance are active.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the CRD toggle on, 100% of admins who can manage a community can open the Member settings dialog from each row of the Members and Organizations tables and perform every action available to them in the MUI version (toggle lead, toggle admin where applicable, remove with confirmation).
- **SC-002**: With the CRD toggle off, 100% of admins continue to see the existing MUI dialog and behavior with no regression attributable to this feature work.
- **SC-003**: An admin can open the dialog, change a single role flag, and persist the change in fewer than 10 seconds on a typical broadband connection — measured as time from row affordance click to dialog close after Save.
- **SC-004**: The Remove member flow always presents an explicit confirmation prompt before issuing the removal mutation; in usability testing, zero accidental removals occur across at least 20 representative member-management sessions.
- **SC-005**: Mutation failures (lead change, admin change, removal) surface via toast in 100% of failure cases, the originating dialog or prompt stays open, no partial UI state is committed, and the user can retry without re-entering data.
- **SC-006**: All interactive elements meet WCAG 2.1 AA: visible focus indicators, accessible names, logical tab order, focus trap and restoration on open/close, ≥ 4.5:1 text contrast, and ≥ 44px touch targets on mobile.
- **SC-007**: All user-visible strings have a key present in each of the six supported language files with no runtime missing-key fallback errors. Non-English locale files MAY contain English placeholder values until translated by the translation team; these placeholders are acceptable interim state and do not violate this criterion.
- **SC-008**: Toggling the CRD setting on, reloading, then toggling off and reloading consistently produces the corresponding dialog version with no client-side errors or stale rendering.
- **SC-009**: The Member settings dialog and its confirmation prompt remain fully usable on a 360px-wide viewport without horizontal scroll, including all role checkboxes and the Remove affordance.
- **SC-010**: After this feature ships, the CRD Community tab no longer exposes a "Promote/demote lead" dropdown item or any "immediate Remove" item that bypasses the confirmation prompt. Each row's dropdown contains exactly **View Profile**, **Change Role**, and **Remove from Space** (the latter two gated on Roleset-Entry-Role-Assign). Both Remove paths (dropdown item and in-dialog affordance) are wired to the same confirmation prompt — verified by a code-level audit of the Members and Organizations tables.

## Assumptions

- The existing CRD toggle (`alkemio-crd-enabled`) and conditional routing in `TopLevelRoutes.tsx` continue to be the mechanism for selecting which design system renders Space settings. No URL change is required for this feature.
- The legacy MUI `CommunityMemberSettingsDialog` (`src/domain/spaceAdmin/SpaceAdminCommunity/dialogs/CommunityMemberSettingsDialog.tsx`) and its parent components (`CommunityUsers`, `CommunityOrganizations`, `SpaceAdminCommunityPage`) remain in place untouched; they continue to serve users with the toggle off.
- The integration layer in `src/main/crdPages/topLevelPages/spaceSettings/community/` already exposes the necessary mutation callbacks for lead, admin, and removal (today wired to `useAssignRoleToUserMutation`, `useRemoveRoleFromUserMutation`, `useAssignRoleToOrganizationMutation`, `useRemoveRoleFromOrganizationMutation` via `useCommunityAdmin`). The feature reuses these hooks and does not change their behavior; admin-role and remove-with-confirmation wiring is added in the integration layer where it is missing.
- The legacy translation keys under `community.memberSettings.*` (in `src/core/i18n/en/translation.en.json`) remain a source of authoritative copy for English. The CRD dialog introduces equivalent keys under a new CRD i18n namespace (e.g., `crd-spaceSettings` if the existing namespace is reused, or a new feature namespace) translated to all six supported languages — manually maintained, not Crowdin.
- The CRD presentational dialog uses CRD primitives (`Dialog`, `Checkbox`, `Button`, `Avatar`, etc.) and a `lucide-react` trash icon for the Remove affordance. Visual treatment may differ in detail from the MUI version (sizing, shadows, typography); CRD primitives and the prototype are the source of truth for visual choices.
- The destructive removal confirmation is rendered through the CRD `AlertDialog`-style surface (the existing `src/crd/components/dialogs/ConfirmationDialog.tsx`, built on the `AlertDialog` primitive at `src/crd/primitives/alert-dialog.tsx`). Both removal entry points (the dropdown's "Remove from Space" item and the in-dialog Remove link) MUST converge on this single confirmation surface. There is no fallback to a plain `Dialog` for confirmations.
- This iteration covers Level-0 Spaces only, matching MUI scope. The dialog accepts `level` data so a future Level-1/2 wiring is a routing/integration change.
- Permission gating relies on the same authorization signals the MUI page already uses: parent-page access requires Space-Admin privileges; the row affordance requires Roleset-Entry-Role-Assign on the community; the lead checkbox respects `canAddLead` / `canRemoveLead` from the community policy; the Remove section relies on the same privilege as the legacy MUI dialog.
