# Feature Specification: CRD Space Apply/Join Button on Dashboard

**Feature Branch**: `088-crd-space-apply-button`
**Created**: 2026-04-17
**Status**: Draft
**Input**: User description: "Render the CRD apply/join button at the top of the CRD Space Dashboard tab, mirroring the legacy MUI Space Dashboard behavior. Non-members see the state-driven application CTA (Sign in / Apply / Join / Accept invitation / Application pending / parent-prompt), introduced for the About dialog in spec 087, now also on the main Space Dashboard page. Reuse every existing CRD presentational component and integration connector from 087, and every domain business-logic hook. No new CRD components and no new translation keys."

## Context

Alkemio's Space page is the entry point for a prospective member to understand and join a Space. In the legacy MUI design system the Space Dashboard tab shows a prominent apply/join call-to-action at the top of the page whenever the current viewer is not a member, with the label adapting to the viewer's authentication state, membership state, and the Space's join/apply policy.

Spec 087 (CRD Space About Dialog) introduced the full CRD apply/join flow: a presentational state-driven button, five associated dialog surfaces, and two integration connectors that wire those surfaces to domain mutations. That flow is currently only reachable from inside the CRD About dialog. With the CRD toggle on, a non-member who lands on the Space Dashboard has no visible call-to-action until they navigate into About — a regression against MUI parity.

This feature closes the gap by adding the same state-driven call-to-action to the top of the CRD Space Dashboard tab. Everything reuses the CRD components built in 087 and every existing domain business-logic hook. The goal is feature parity with the MUI Dashboard call-to-action in the CRD visual language, with no new CRD primitives and no new translation keys.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Non-member sees a clear call-to-action on the Space Dashboard (Priority: P1)

A visitor (anonymous or authenticated non-member) lands on a Space they do not belong to. They open the Dashboard tab and immediately see, above the content feed, a single call-to-action whose label reflects what they can do next: sign in, apply, join, or accept a pending invitation. They can act on that call-to-action without first having to navigate to the About dialog.

**Why this priority**: This is the core parity gap. Without it, non-members on the CRD Dashboard have no visible entry into the membership flow and must rely on deep-linking through About. This story unlocks the full apply/join journey for anyone landing on the Dashboard.

**Independent Test**: With the CRD design system enabled, visit a Space's Dashboard tab as (a) an anonymous visitor and (b) an authenticated non-member. Confirm a single, correctly-labelled call-to-action is shown above the content feed. Clicking it opens the corresponding flow surface (sign-in redirect, application form, join confirmation, or invitation detail).

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor on a Space Dashboard, **When** the page renders, **Then** a "Sign in to apply" call-to-action is shown at the top of the Dashboard content area with a short helper note. Activating it navigates to sign-in preserving the current location.
2. **Given** an authenticated user who can join the community without an application, **When** the Dashboard renders, **Then** the call-to-action reads "Join". Activating it opens a join confirmation; confirming takes the user into the Space.
3. **Given** an authenticated user who must submit an application, **When** the Dashboard renders, **Then** the call-to-action reads "Apply". Activating it opens the application form surface with the Space's questions and community guidelines; submitting valid answers closes the form and surfaces a "submitted" confirmation; the Dashboard call-to-action then reflects the new "Application pending" state without a manual refresh.
4. **Given** an authenticated user with a pending invitation to the Space, **When** the Dashboard renders, **Then** the call-to-action reads "Accept invitation". Activating it opens the invitation detail surface with the invitation metadata and community guidelines; accepting takes the user into the Space; rejecting closes the surface and the Dashboard state re-evaluates on the next natural interaction.
5. **Given** an authenticated user with an existing pending application, **When** the Dashboard renders, **Then** the call-to-action reads "Application pending" in a disabled state (no follow-up surface).
6. **Given** an authenticated user viewing a Space that requires parent-Space engagement first, **When** they activate the call-to-action, **Then** a parent-prompt surface explains they must first engage with the parent Space and offers a link to do so.

---

### User Story 2 - Member sees an uncluttered Dashboard (Priority: P1)

A user who is already a member of a Space opens its Dashboard. They should see the content feed immediately — no disabled "Member" pill, no collapsed placeholder, no visual shift as the membership state loads.

**Why this priority**: Members are the most frequent visitors of the Dashboard. Surfacing a disabled membership pill on every visit would be permanent clutter and a regression against the MUI Dashboard, which hides the block entirely for members.

**Independent Test**: As an authenticated member of the Space, open the Dashboard. Confirm the call-to-action area is entirely absent (not merely hidden with reserved space) and the content feed is flush with the top of the content column. Confirm there is no layout shift as membership state resolves.

**Acceptance Scenarios**:

1. **Given** an authenticated member on the Space Dashboard, **When** the page renders, **Then** the call-to-action section is not rendered and the content feed appears directly below the Space navigation tabs.
2. **Given** membership state is still loading, **When** the page first paints, **Then** the call-to-action section is not rendered in a disabled/placeholder state; the final rendered state is the correct membership-aware state (or absent, for members).

---

### User Story 3 - Call-to-action is scoped to the Dashboard tab (Priority: P2)

A non-member browses between Dashboard, Community, and Subspaces tabs on the same Space. The call-to-action appears only on the Dashboard. The Community and Subspaces tabs remain unchanged — they show their own content without any duplicated apply/join call-to-action.

**Why this priority**: Mirrors the legacy MUI scoping. Duplicating the call-to-action on every tab would crowd tab content that doesn't share the Dashboard's "welcome / orientation" framing.

**Independent Test**: On a non-member view of a Space, navigate between the Dashboard, Community, and Subspaces tabs. Confirm the call-to-action appears only on the Dashboard.

**Acceptance Scenarios**:

1. **Given** a non-member viewing the Community or Subspaces tab, **When** the tab renders, **Then** no apply/join call-to-action is shown.
2. **Given** a non-member switches from Community back to Dashboard, **When** the Dashboard renders, **Then** the appropriate call-to-action reappears in its correct state.

---

### User Story 4 - Dashboard call-to-action respects subspace-only policies (Priority: P3)

A non-member viewing a Space whose policy requires them to engage with the parent Space first (e.g., subspace membership gated on parent membership) sees a call-to-action that, instead of directly submitting an application here, explains the parent-Space requirement and offers the path to engage there.

**Why this priority**: Most Spaces in this iteration are top-level (L0) so this path is lower-traffic, but parity with MUI requires supporting it so users on subspace-gated Spaces aren't stuck on a call-to-action that silently fails.

**Independent Test**: On a Space whose apply/join policy requires parent-Space engagement, activate the Dashboard call-to-action. Confirm the parent-prompt surface opens with either a "join parent" or "apply to parent" variant according to the parent Space's policy and the user's parent-membership state.

**Acceptance Scenarios**:

1. **Given** a non-member whose parent Space must be joined first, **When** they activate the Dashboard call-to-action, **Then** the join-parent prompt surface opens with a link to the parent Space.
2. **Given** a non-member whose parent Space must be applied-to first, **When** they activate the Dashboard call-to-action, **Then** the apply-to-parent prompt surface opens. If the parent application is already pending, the prompt reflects that pending state instead of offering another apply submission.

### Edge Cases

- **Mid-session permission or membership change**: the user's membership state changes in another tab while the Dashboard is open (invitation accepted, role revoked). The Dashboard does not actively poll or subscribe; the call-to-action re-evaluates on the next user interaction or the next natural cache refresh. No stale submission is allowed to proceed if the underlying state has changed — the next interaction surfaces the corrected state.
- **Mutation failure** (apply, join, invitation accept/reject): the platform's existing toast/notification mechanism surfaces the error; the originating flow surface stays open so the user can retry without re-entering data. The call-to-action does not reflect a partial state change until the mutation succeeds.
- **Space with no join-capable policy and no pending invitation for the viewer**: the call-to-action appears in a disabled "Apply not available" state rather than being absent, so the viewer understands that the Space exists but is not open to them.
- **Loading state**: while the membership state is resolving for the first time, the call-to-action section is absent; it appears once the state is known. No disabled spinner placeholder is rendered where the button will go.
- **Long call-to-action label on narrow viewports**: labels must remain readable on a 360px-wide viewport; the call-to-action must not cause horizontal scroll or overlap tab navigation.
- **CRD toggle off**: the Dashboard renders the existing MUI apply/join call-to-action in the same position with no regression.
- **Toggling CRD on/off**: switching the design system and reloading consistently produces the correct rendering (CRD on → CRD call-to-action; CRD off → MUI call-to-action). No client-side errors, no stale state leakage.
- **Anonymous user already has a prior Space URL in history**: after signing in from the call-to-action, the user returns to the exact Space Dashboard they started from, not a generic home or entry surface.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the CRD design system is enabled, the system MUST render a single apply/join call-to-action at the top of the Space Dashboard tab for non-member viewers. The call-to-action appears above the Dashboard content feed, aligned with the main content column of the Space Dashboard layout.
- **FR-002**: When the CRD design system is disabled (the default), the system MUST continue to render the existing MUI apply/join call-to-action on the Space Dashboard in its current position, with no behavioural change.
- **FR-003**: The call-to-action's label and behaviour MUST reflect the viewer's current state. The supported states are: not signed in, can join community, can apply to community, application pending, can accept pending invitation, must apply to parent Space, must join parent Space, parent application pending, apply-not-available. Members MUST NOT see a call-to-action.
- **FR-004**: When the call-to-action is activated in the "Apply" state, the system MUST open the application form surface already used by the CRD About dialog, presenting the Space's application questions, form description (if any), and community guidelines. Submitting valid answers MUST close the form, surface a "submitted" confirmation, and update the Dashboard call-to-action to the "Application pending" state without requiring a manual page refresh.
- **FR-005**: When the call-to-action is activated in the "Join" (no-form) state, the system MUST open the same CRD join confirmation surface used by the About dialog; confirming MUST submit the join and, on success, take the user into the Space.
- **FR-006**: When the call-to-action is activated in the "Accept invitation" state, the system MUST open the CRD invitation detail surface used by the About dialog, populated with the pending invitation's metadata and (if available) the Space's community guidelines. Accepting MUST take the user into the Space; rejecting MUST close the surface and leave the user on the Dashboard.
- **FR-007**: When the call-to-action is activated in a parent-prompt state (apply-to-parent or join-parent), the system MUST open the corresponding CRD parent-prompt surface used by the About dialog, including the "parent application pending" variant when the parent application is already pending.
- **FR-008**: When the viewer is not signed in and activates the call-to-action, the system MUST navigate them to sign-in with the current Space location preserved so they return to the same Dashboard after authentication.
- **FR-009**: Members of the Space MUST NOT see the call-to-action on the Dashboard. The call-to-action section MUST NOT occupy layout space for members (no "Member" pill, no disabled placeholder, no empty block).
- **FR-010**: While the viewer's membership state is still loading for the first time, the call-to-action section MUST NOT be rendered in a placeholder or disabled state. Once state is resolved, the correct final state MUST render (or remain absent, for members).
- **FR-011**: The call-to-action MUST appear only on the Dashboard tab in this iteration. It MUST NOT appear on the Community or Subspaces tabs, matching the legacy MUI placement.
- **FR-012**: All user-visible strings used by the call-to-action and its dialog surfaces MUST reuse the translation keys already introduced by spec 087 (CRD Space About Dialog). No new translation keys MUST be added by this feature. All six supported languages (English, Dutch, Spanish, Bulgarian, German, French) MUST continue to render the call-to-action correctly, with English fallback where translations are placeholder.
- **FR-013**: When a user-initiated mutation triggered from the Dashboard call-to-action (apply submission, direct join, invitation accept, invitation reject) fails, the system MUST surface the failure via the platform's existing toast/notification mechanism. The originating flow surface MUST remain open so the user can retry without re-entering data. No partial state change MUST be reflected on the Dashboard call-to-action until the mutation succeeds.
- **FR-014**: The Dashboard call-to-action and its associated flow surfaces MUST be operable by keyboard alone: the call-to-action is reachable via tab order, Enter/Space activates it, flow surfaces trap focus while open, Esc closes each surface, and focus returns to the call-to-action trigger on close.
- **FR-015**: All interactive elements of the call-to-action (the button itself, the helper text, and each flow surface's controls) MUST be reachable by assistive technologies with appropriate labels, roles, and state announcements. Decorative icons MUST be hidden from assistive technologies.
- **FR-016**: The call-to-action MUST remain usable on mobile viewports (≥360px wide): the label does not wrap unreadably, the button does not overflow the content column, and the helper text (when shown) sits directly beneath the button without overlap.
- **FR-017**: Mid-session membership or permission changes (granted or revoked in another tab) MUST be re-evaluated on the next natural user interaction or cache refresh. The system MUST NOT poll, subscribe in real time, or re-fetch on window focus for this call-to-action.
- **FR-018**: This feature applies to top-level (L0) Spaces only in this iteration, matching the L0 scope of the CRD Space Dashboard. Subspace (L1/L2) Space pages continue to render the legacy MUI Space layout and its existing apply/join call-to-action; no CRD Dashboard call-to-action is required on subspaces in this iteration.
- **FR-019**: Toggling the CRD design system on or off and reloading the page MUST swap which version of the Dashboard call-to-action renders without requiring further configuration, and MUST NOT produce client-side errors, stale rendering, or duplicated call-to-action sections.

### Key Entities *(include if feature involves data)*

- **Community Membership State** (per current viewer, per Space): authentication flag, membership flag, parent-membership flag, current application state (none / pending / archived), pending invitation (if any), parent application state, join/apply capability flags for this and the parent Space.
- **Application Form**: the Space's list of application questions (with required flag and maximum answer length) and an optional form description, presented inside the application flow surface.
- **Community Guidelines**: the Space's community guidelines document (display name, description, optional reference links), surfaced inside the application and invitation flow surfaces alongside the apply/accept controls.
- **Pending Invitation**: an existing invitation to this Space for the current viewer, including invitation metadata (issuer, welcome message, created date) and references to the Space's guidelines.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the CRD design system enabled, 100% of non-member viewers landing on a Space Dashboard see the correctly-labelled call-to-action without needing to navigate to About.
- **SC-002**: 100% of the membership states listed in FR-003 resolve to the correct label and disabled/enabled state on the Dashboard, verified across the scenarios enumerated in the Acceptance Scenarios above.
- **SC-003**: With the CRD design system disabled, 100% of viewers continue to see the existing MUI Dashboard call-to-action with no behavioural change attributable to this feature.
- **SC-004**: Members see no call-to-action section on the Dashboard in 100% of cases; no disabled "Member" state is rendered and no empty layout block is reserved.
- **SC-005**: A non-member can complete the apply flow from the Dashboard (open Dashboard → activate Apply → submit form → see confirmation) in fewer than 90 seconds on a Space with up to five application questions.
- **SC-006**: A non-member can complete the join flow from the Dashboard (open Dashboard → activate Join → confirm → enter Space) in fewer than 15 seconds on a join-capable Space.
- **SC-007**: An unauthenticated viewer can move from "Dashboard open as guest" to "signed in and back on the same Space Dashboard" without losing their place and without needing to manually re-navigate.
- **SC-008**: All interactive elements (the call-to-action itself plus every flow surface's controls) meet WCAG 2.1 AA: visible focus indicators, accessible names, logical tab order, focus management on open/close.
- **SC-009**: No new translation keys are introduced; all user-visible strings the Dashboard call-to-action renders have a key already present under the `crd-space` namespace in each of the six supported language files.
- **SC-010**: Toggling the CRD design system on, reloading, and then off and reloading consistently produces the corresponding Dashboard call-to-action version, with no client-side errors and no duplicate call-to-actions.

## Assumptions

- The CRD presentational button introduced in spec 087 (the state-driven apply/join button component) and its five flow surfaces (application form, application submitted, invitation detail, apply-to-parent prompt, join-parent prompt) are feature-complete and are reused verbatim by this feature. No new CRD primitives or composites are required.
- The domain business-logic hook that derives all button-state fields (membership flag, parent-membership flag, pending applications, pending invitations, join/apply privileges, join handler) is presentation-agnostic and is reused without modification. This feature does not introduce new GraphQL queries or mutations.
- The existing translation keys under the `crd-space` namespace (button state labels and apply/join dialog labels, already introduced by spec 087) cover every string the Dashboard call-to-action renders. No additions to any locale file are required.
- The CRD Space Dashboard is the L0 "home" tab of the Space and already exists; this feature adds the call-to-action inside that tab rather than introducing a new page or route.
- The existing feature toggle mechanism (localStorage-backed, surfaced via Admin → Platform Settings → Design System) remains the means of switching between MUI and CRD renderings. This feature introduces no new toggle.
- Subspace (L1/L2) Space pages continue to render the legacy MUI Space layout unchanged. The CRD Dashboard scope — and therefore this feature — is L0-only in this iteration.
- Contact-host and "read more" community-guidelines affordances are not part of this feature; they remain scoped to the About dialog (spec 087). This feature is strictly the top-of-Dashboard apply/join call-to-action.
