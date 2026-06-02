# Feature Specification: CRD (Sub)Space Settings — Functional Parity with Legacy Settings

**Feature Branch**: `103-crd-settings-parity`  
**Created**: 2026-06-01  
**Status**: Draft  
**Input**: GitHub issue [#9752](https://github.com/alkem-io/client-web/issues/9752) — "[CRD] Settings". The redesigned (CRD) (sub)space settings dropped or broke behaviour that still works in the legacy settings. This feature restores parity.

## Overview

The platform is migrating its space and subspace **settings** screens from the legacy design to the new design. Several capabilities that space administrators rely on were lost or degraded in the new settings screens. This feature restores each missing or broken capability so that an administrator using the new settings can do everything they could do in the legacy settings — no more, no less. The legacy settings remain the default and must continue to work unchanged; the new settings are only shown to users who have opted into the new design.

Each user story below corresponds to one regression reported in the issue. The **legacy behaviour is the acceptance baseline**: where the spec says "as before" it means "matches what the legacy settings already do".

## Clarifications

### Session 2026-06-01

- Q: How much of the legacy subspace-ordering behaviour must the new settings match? → A: Full parity — an Alphabetical/Custom sort-mode selector, drag-reorder in Custom mode, and pinned subspaces draggable within Alphabetical mode.
- Q: How should inviting a Virtual Contributor be surfaced in the new settings Community tab? → A: A separate "Invite Virtual Contributor" entry point/dialog (account VCs + library VCs), mirroring the legacy structure where user-invite and VC-invite are distinct flows.
- Q: What is the acceptance bar for the "single input" member invite? → A: Live as-you-type detection — one input that surfaces matching existing users while typing and treats a non-matching valid email as a new external invite.
- Q: For Innovation Flow phase descriptions, is the editor or the view broken? → A: Only the Layout **column view** renders the description as raw markup and must render it as formatted text; the phase editor is already a markdown editor and stays untouched; the preview truncation is intentional and stays.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Invite people to a (sub)space with one smart input, a message, and a role (Priority: P1)

A space administrator opens the Community tab of the new (sub)space settings and clicks "Invite". They type either the name/handle of an existing platform user **or** the email address of someone not yet on the platform into a **single** input. The system recognises existing users as they type and offers them for selection; anything that is a valid email but not a known user is treated as an invitation to a brand-new external person. Before sending, the administrator can edit a welcome message (pre-filled with a sensible default) and choose which role(s) the invitee will receive — including the option to invite them directly as an **admin** (and/or lead), with "member" always included.

**Why this priority**: Community growth is a core administrator task. The new settings currently split the flow into two disjoint paths, omit the welcome message, and omit role selection — so administrators literally cannot invite an admin or send a personalised invitation from the new settings. This is the most-used and most-degraded area.

**Independent Test**: Opt into the new design, open a space's settings → Community → Invite. Confirm a single input accepts both an existing user's name and a new email; confirm an editable welcome message is present and pre-filled; confirm a role selector offers Member (locked), Lead, and Admin; send an invitation and confirm the invitee receives it with the chosen message and role(s).

**Acceptance Scenarios**:

1. **Given** the administrator is on the new settings Community tab, **When** they open the invite dialog, **Then** they see one input that searches existing users by name and email and also accepts a new email — not two separate tabs/flows.
2. **Given** the administrator types the display name or email of an existing platform user, **When** they are typing, **Then** matching users are surfaced live (as-you-type, without an extra confirm step) and can be added as invitees.
3. **Given** the administrator types a valid email that does not match any existing user, **When** they confirm the entry, **Then** it is accepted as an invitation to a new external person.
4. **Given** one or more invitees are selected, **When** the administrator reviews the invitation, **Then** a welcome-message field is shown, pre-filled with a default message, and editable before sending.
5. **Given** one or more invitees are selected, **When** the administrator opens the role selector, **Then** "Member" is always included and locked, and "Lead" and "Admin" can each be toggled on; selected roles are applied to the invitation.
6. **Given** a completed invitation with a message and roles, **When** the administrator sends it, **Then** the invitation is created with exactly those roles and that message, identical to the legacy outcome.

---

### User Story 2 - Invite a Virtual Contributor to a (sub)space (Priority: P1)

A space administrator wants to add an AI Virtual Contributor to their space's community. From the new settings, a **separate "Invite Virtual Contributor" entry point** (distinct from the people-invite flow, mirroring the legacy structure) lets them choose a Virtual Contributor already available on their account or one from the shared library — and, where a welcome message applies, include one, exactly as in the legacy settings.

**Why this priority**: Virtual Contributors are a flagship capability. The new settings offer no way to invite one at all, blocking a key workflow entirely.

**Independent Test**: Opt into the new design, open settings → Community, and confirm there is an entry point to invite a Virtual Contributor. Confirm the picker lists Virtual Contributors available on the account and those from the library, and that selecting and confirming one results in the Virtual Contributor being invited/added to the space community.

**Acceptance Scenarios**:

1. **Given** the administrator is on the new settings Community tab, **When** they look for ways to add members, **Then** a separate, clearly distinct option to invite a Virtual Contributor is available (not merged into the people-invite input).
2. **Given** the administrator opens the Virtual Contributor invite flow, **When** the list loads, **Then** Virtual Contributors available on the account and those available in the library are both presented and distinguishable.
3. **Given** the administrator selects a Virtual Contributor that requires an invitation message, **When** they proceed, **Then** they can supply/edit the message before confirming.
4. **Given** the administrator confirms, **When** the action completes, **Then** the Virtual Contributor is invited/added to the community with the same result as the legacy flow.

---

### User Story 3 - See and set the active phase of the Innovation Flow in settings (Priority: P2)

A space administrator on the Layout tab of the new settings can tell at a glance which phase of the Innovation Flow is currently active, and can change which phase is active — just as the legacy settings allow.

**Why this priority**: The active phase drives what members see across the space. Not being able to see or change it from the new settings is a meaningful loss of control, though it does not block the most frequent invitation workflows.

**Independent Test**: Opt into the new design, open settings → Layout. Confirm the currently active phase is visually distinguished from the others, and that there is a control to make a different phase the active one; change it and confirm the new phase is shown as active and persists after reload.

**Acceptance Scenarios**:

1. **Given** a space with an Innovation Flow of several phases, **When** the administrator views the Layout tab, **Then** the currently active phase is visibly distinguished from inactive phases.
2. **Given** the administrator wants to advance the flow, **When** they use the per-phase controls, **Then** they can set a chosen phase as the active one.
3. **Given** the administrator sets a new active phase, **When** the change is saved, **Then** the active-phase indicator updates and the change persists across reloads, matching the legacy behaviour.

---

### User Story 4 - Reorder subspaces from settings (Priority: P2)

A space administrator can control the order in which subspaces are presented, by reordering them from the new settings — including a custom (manual) order — just as the legacy settings allow.

**Why this priority**: Ordering affects how visitors experience a space. The capability is entirely absent from the new settings, but it affects presentation rather than blocking core membership tasks.

**Independent Test**: Opt into the new design, open settings → Subspaces. Confirm subspaces can be put into a custom order (and that an alphabetical option exists where the legacy provides one), reorder them, and confirm the chosen order persists and is reflected where subspaces are listed.

**Acceptance Scenarios**:

1. **Given** a space with multiple subspaces, **When** the administrator views the Subspaces settings, **Then** they can pick a sort mode — Alphabetical or Custom — matching the legacy options.
2. **Given** Custom mode, **When** the administrator drags subspaces, **Then** any subspace can be reordered and the new order is saved.
3. **Given** Alphabetical mode, **When** the administrator drags subspaces, **Then** only pinned subspaces can be reordered (pinned ones lead, the rest stay alphabetical), matching the legacy pin/order interplay.
4. **Given** a saved custom order, **When** the administrator (or a visitor) returns, **Then** subspaces appear in the saved order, matching the legacy outcome.

---

### User Story 5 - Innovation Flow phase descriptions render as formatted text in the Layout view (Priority: P2)

On the Layout tab, each phase column shows the phase description. Today that description is shown as raw text, so markdown/HTML markup (e.g. `<strong>…</strong>`) appears literally instead of as formatted text. The administrator should see the description rendered as formatted text (bold, links, emojis), just like description previews elsewhere on the platform. The phase **editor already uses a rich-text/markdown editor and is not changed by this story**; only the read-only column preview needs to render the markup.

**Why this priority**: The literal markup is visibly broken and confusing, but the description still saves and edits correctly, so it is a presentation defect rather than a hard blocker.

**Independent Test**: Opt into the new design, open settings → Layout for a space whose phase description contains formatting (e.g. bold). Confirm the column preview shows the text formatted (no literal `<strong>` or `**` markup), and that the preview remains truncated as it is today.

**Acceptance Scenarios**:

1. **Given** a phase whose description contains markdown/HTML formatting, **When** the administrator views its column on the Layout tab, **Then** the description renders as formatted text (no literal tags or markup characters).
2. **Given** a long phase description, **When** it is shown in the column preview, **Then** it stays truncated to its current clamped height (the preview is intentionally not fully visible) — truncation behaviour is unchanged.
3. **Given** the administrator opens the phase editor, **When** they edit the description, **Then** the editor is the existing rich-text/markdown editor, unchanged by this story.

---

### User Story 6 - "View post" from a callout's menu on the Layout tab navigates to that post (Priority: P3)

A space administrator using the Layout tab opens a callout's three-dots menu and selects "View post"; the platform takes them to that post/callout, instead of doing nothing.

**Why this priority**: It is a clearly broken affordance, but a narrow one with an easy alternative path (navigating to the post directly), so it is the lowest priority of the set.

**Independent Test**: Opt into the new design, open settings → Layout, open a callout's three-dots menu, and select "View post". Confirm the platform navigates to that callout/post.

**Acceptance Scenarios**:

1. **Given** a callout listed on the Layout tab, **When** the administrator selects "View post" from its menu, **Then** the platform navigates to that callout/post.
2. **Given** the menu item is shown, **When** the target cannot be resolved, **Then** the item is not presented as an actionable control that silently does nothing (it either works or is not offered).

---

### Edge Cases

- **Invite input ambiguity**: text that is neither a recognised user nor a valid email is rejected with clear feedback; a valid email that *also* matches an existing user is treated as that existing user (no duplicate external invite).
- **Already-member / already-invited**: inviting someone who is already a member or already has a pending invitation surfaces the existing state rather than creating a duplicate.
- **Permissions**: only users with the appropriate administrative permission see the invite, reorder, set-active-phase, and phase-edit controls; the relevant role options (e.g. Admin) are only offered to those allowed to grant them.
- **Single / empty collections**: a space with zero or one subspace shows no meaningless reorder affordance; a flow with a single phase still shows which phase is active.
- **Discarding unsaved input**: closing the invite dialog or a phase editor with unsaved, user-authored content prompts before discarding (consistent with the design system's discard-guard rule); transient selection/search dialogs do not prompt.
- **Destructive actions** reachable from these settings (e.g. deleting a phase or subspace) continue to require explicit confirmation.
- **Virtual Contributor with no available options**: the VC invite flow communicates clearly when there are no Virtual Contributors on the account or in the library rather than showing an empty, confusing list.
- **Sub-space vs top-level space**: every restored capability behaves the same in subspace settings as in top-level space settings.

## Requirements *(mandatory)*

### Functional Requirements

**Invitations (Community tab)**

- **FR-001**: The new (sub)space settings Community tab MUST let an administrator invite people via a single input that surfaces matching existing platform users **live as they type** (by display name and email) and accepts a non-matching valid email as an external invitation — not two separate tabs/flows and not requiring a separate confirm step to reveal matches.
- **FR-002**: The new settings invite flow MUST provide an editable welcome message, pre-filled with the same default the legacy flow uses, for invitations.
- **FR-003**: The new settings invite flow MUST let the administrator select the invitee's role(s), with "Member" always included and locked and "Lead" and "Admin" individually selectable, and MUST apply exactly the selected roles to the invitation.
- **FR-004**: The new settings invite flow MUST produce the same invitation outcome (recipients, roles, message) as the legacy flow for equivalent input.
- **FR-005**: The new (sub)space settings MUST let an administrator invite a Virtual Contributor to the community via a **separate entry point/dialog distinct from the people-invite flow**, offering both Virtual Contributors available on the account and those from the shared library, including any required invitation message, matching the legacy structure and capability.

**Innovation Flow (Layout tab)**

- **FR-006**: The new settings Layout tab MUST visibly indicate which Innovation Flow phase is currently active.
- **FR-007**: The new settings Layout tab MUST let an administrator set a different phase as the active phase, and the change MUST persist.
- **FR-008**: On the Layout tab, the phase column preview MUST render the phase description as formatted text (markdown/HTML rendered, not shown as literal tags/markup), while keeping its current truncated/clamped preview height. The phase editor already uses a rich-text/markdown editor and MUST remain unchanged.

**Subspaces tab**

- **FR-009**: The new settings Subspaces tab MUST offer an Alphabetical/Custom sort-mode selector matching the legacy settings: in Custom mode any subspace is drag-reorderable; in Alphabetical mode only pinned subspaces are drag-reorderable (pinned subspaces lead, the remainder stay alphabetical). The chosen mode and order MUST persist and be reflected wherever subspaces are listed.

**Layout tab — callout menu**

- **FR-010**: Selecting "View post" from a callout's menu on the Layout tab MUST navigate the administrator to that callout/post; the control MUST NOT be presented as an actionable item that does nothing.

**Cross-cutting**

- **FR-011**: The legacy settings screens MUST remain the default and continue to function unchanged; restored capabilities apply only to the new (opt-in) settings.
- **FR-012**: Every restored capability MUST behave identically in subspace settings and in top-level space settings.
- **FR-013**: All restored controls MUST respect existing permission rules — controls and role options are only available to administrators permitted to use/grant them.
- **FR-014**: Destructive actions and discards of unsaved user-authored content reachable through these flows MUST follow the platform's existing confirm-before-destroy / discard-guard behaviour.

### Key Entities *(include if feature involves data)*

- **Space / Subspace**: the container whose settings are being edited; owns a community, an ordered set of subspaces, and an Innovation Flow.
- **Community membership & invitation**: a pending or accepted relationship between a contributor (user or Virtual Contributor) and a space's community, carrying one or more roles (Member, Lead, Admin) and, for new users, a welcome message.
- **Contributor**: a person (existing platform user or new external email) or a Virtual Contributor (available on the account or from the library) who can be invited.
- **Innovation Flow & Phase (state)**: the ordered set of phases for a space; exactly one is the active/current phase, and each phase has a display name and a rich-text description.
- **Subspace ordering**: the ordering mode (e.g. alphabetical or custom) and, for custom, the explicit sequence of subspaces.
- **Callout (post)**: a content item shown on the Layout tab that can be navigated to ("View post").

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: An administrator can complete every task in the issue from the new settings that they can complete in the legacy settings — invite an existing user, invite a new email with a message, invite as admin, invite a Virtual Contributor, reorder subspaces, see and change the active phase, see phase descriptions rendered as formatted text, and open a post from the Layout menu — with zero capabilities still missing (8 of 8 reported regressions resolved).
- **SC-002**: Inviting a member from the new settings requires a single input and no more steps than the legacy flow; an administrator can send an invitation with a chosen role and message in one pass through the dialog.
- **SC-003**: 100% of invitations sent from the new settings carry the intended roles and message, matching the legacy result for the same input.
- **SC-004**: Innovation Flow phase descriptions containing formatting render as formatted text in the Layout column preview in 100% of cases (no literal markup/tags visible), with the preview truncation unchanged.
- **SC-005**: The active Innovation Flow phase is identifiable on the Layout tab without additional interaction (visible at a glance), and a phase change persists across a page reload.
- **SC-006**: A saved custom subspace order is reflected everywhere subspaces are listed and survives reload.
- **SC-007**: "View post" navigates to the target post on every callout where the menu item is shown; there are no menu items that do nothing.
- **SC-008**: The legacy settings continue to pass all their existing behaviour checks (no regression introduced for users who have not opted into the new design).

## Assumptions

- The acceptance baseline for "parity" is the current legacy settings behaviour; where this spec is silent on a detail, the legacy behaviour governs.
- The opt-in mechanism for the new design (per-user design preference) is unchanged; this feature does not alter who sees the new vs legacy settings, only what the new settings can do.
- A parity-complete member-invite experience already exists elsewhere in the new design; the intent is for the settings Community tab to use that complete experience rather than a reduced one. (Whether to reuse or extend is an implementation decision for planning.)
- The backend capabilities required (creating invitations with roles and messages, inviting Virtual Contributors, setting the active phase, persisting subspace order, storing rich-text phase descriptions) already exist and are exercised by the legacy settings; no new backend capability is assumed.
- Rich-text phase descriptions use the platform's existing markdown content format, so descriptions are interoperable between the legacy and new editors.

## Out of Scope

- Any redesign or new capability beyond restoring parity with the legacy settings (no net-new features).
- Changes to the legacy settings screens themselves, other than ensuring they remain functional.
- Removing the legacy settings or the design toggle (that happens later, once all pages are validated).
- Settings areas not named in issue #9752.
