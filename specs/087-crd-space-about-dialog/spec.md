# Feature Specification: CRD Space About Dialog

**Feature Branch**: `087-crd-space-about-dialog`
**Created**: 2026-04-16
**Status**: Draft
**Input**: User description: "Implement Space About dialog in CRD design system with feature parity to MUI version, including apply/join flow dialogs, contact host, edit pencils, community guidelines, lock icon, and level-aware section titles. Routes load CRD or MUI version based on alkemio-crd-enabled localStorage toggle."

## Context

Alkemio's Space About is the primary way visitors and members understand what a Space is, who is involved, and how to engage with it. Today it is rendered with the legacy MUI design system. The platform is being progressively migrated to the new CRD design system (shadcn/ui + Tailwind), and a partial CRD About view exists but lacks dialog presentation, apply/join flows, contact-host messaging, in-place editing for privileged users, the community guidelines block, and the visual cues that signal access state (lock icon, level-aware section titles).

This feature brings the CRD About experience to feature-parity with the MUI version so that environments that opt into the CRD design system (via the existing `alkemio-crd-enabled` localStorage toggle, surfaced through the Admin → Platform Settings → Design System control) deliver the same functionality, in the new visual language. Environments without the toggle continue to render the MUI dialog unchanged.

## Clarifications

### Session 2026-04-16

- Q: When an Apply / Join / Accept-invitation / Contact-host mutation fails, how should the failure be surfaced? → A: Surface the error via the platform's existing toast/notification mechanism; the originating flow surface stays open so the user can retry.
- Q: With the CRD toggle on, what renders at a subspace About URL (e.g., `/:spaceId/challenges/:subspaceNameId/about`)? → A: Continue rendering the legacy MUI subspace About dialog. CRD About is L0-exclusive in this iteration.
- Q: When a user lacks read privilege and dismisses the dialog, where do they go? → A: Step browser history back two entries (mirrors legacy behavior); if no prior history exists, fall back to the platform Home.
- Q: When should the Apply form's client-side validation errors become visible? → A: Validate continuously and keep the submit button disabled until valid; show inline error text only after the first submit attempt or after a field is blurred with invalid content.
- Q: How should the dialog react when read privilege changes mid-session (granted in another tab, or revoked by an admin)? → A: Re-evaluate on next user interaction or natural cache refresh; no active polling, no focus-triggered re-fetch, no real-time subscription.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor explores a Space they may want to join (Priority: P1)

A visitor (anonymous or authenticated non-member) navigates to a Space's About URL and needs to learn enough about the Space — its purpose, focus, leaders, host, community guidelines, and key metrics — to decide whether to apply or join. They open the About dialog, scan the sections, and either dismiss it (returning to where they came from) or proceed to apply.

**Why this priority**: This is the foundational journey. Without it, there is no About dialog at all. Every other journey builds on this presentation surface.

**Independent Test**: Open `/:spaceId/about` on a Space the user does not belong to. Confirm the About content (name, tagline, description, location, metrics, leaders, host, why, who, guidelines, references) is displayed in a dialog, the dialog can be closed (X button, Esc, backdrop click) returning the user to the previous page, and the previously visible Space content remains intact behind the overlay.

**Acceptance Scenarios**:

1. **Given** a Space with full About data populated, **When** the user navigates to its About URL, **Then** the dialog opens displaying the Space name, tagline, description, location, metrics grid, leaders/organizations, host, "Why" section, "Who" section, community guidelines block (truncated), and external references list.
2. **Given** the About dialog is open, **When** the user clicks the close button, presses Esc, or clicks outside the dialog, **Then** the dialog closes and the user returns to the page they came from (or to the Space home page if they entered the About URL directly).
3. **Given** a Space with sparse data (some sections missing), **When** the dialog renders, **Then** missing sections are omitted entirely without leaving empty placeholders.
4. **Given** the user has no read privilege on the Space, **When** the dialog opens, **Then** a lock icon with explanatory tooltip appears next to the title; the tooltip contains a "Learn how to apply" link that, when activated, focuses or triggers the apply call-to-action.

---

### User Story 2 - Non-member applies to or joins a Space (Priority: P1)

A non-member viewing the About dialog wants to become part of the Space's community. Depending on the Space's policy and the user's authentication state, the user may need to: sign in first; submit an application form; join immediately (no questions asked); accept a pending invitation; or first apply/join the parent Space before this Space becomes joinable. Each of these states surfaces the right call-to-action and follow-up dialog.

**Why this priority**: The apply/join flow is the primary conversion path from "interested visitor" to "active community member." Parity with MUI here is required to avoid blocking new memberships when a tenant turns the CRD toggle on.

**Independent Test**: For each membership state (anonymous, authenticated-no-membership, can-join, can-apply, application-pending, invitation-pending, must-apply-to-parent, must-join-parent), confirm the correct button label appears and clicking it opens the corresponding follow-up surface (sign-in redirect, apply form, join confirmation, invitation acceptance, or parent-Space prompt). After successful application, a confirmation surface appears.

**Acceptance Scenarios**:

1. **Given** an unauthenticated visitor, **When** the dialog opens, **Then** a "Sign in to apply" call-to-action appears below the header along with a helper text explaining that the user will be redirected to sign in. Activating the call-to-action navigates to the sign-in page.
2. **Given** an authenticated user who can join the community without an application, **When** they activate the "Join" call-to-action, **Then** a join confirmation surface opens; confirming submits the join request and on success the user is taken into the Space.
3. **Given** an authenticated user who must apply with answers, **When** they activate the "Apply" call-to-action, **Then** an application surface opens displaying the application questions, the form description (if any), and the community guidelines; submitting valid answers closes the application surface and opens a "your application has been submitted" confirmation.
4. **Given** an authenticated user with an existing pending application, **When** the dialog opens, **Then** the call-to-action shows "Application pending" in a disabled state (no follow-up surface).
5. **Given** an authenticated user with a pending invitation to the Space, **When** they activate the "Accept invitation" call-to-action, **Then** the existing invitation acceptance surface opens with the invitation details; accepting takes the user into the Space.
6. **Given** an authenticated user viewing a subspace whose parent Space they have not yet joined or applied to, **When** they activate "Join" or "Apply", **Then** a parent-Space prompt explains they must first engage with the parent Space and offers a link to do so.
7. **Given** a successful application submission, **When** the confirmation surface is dismissed, **Then** the About dialog reflects the new "Application pending" state without requiring a manual refresh.

---

### User Story 3 - Member or visitor contacts the Space host (Priority: P2)

A user (member or non-member) wants to ask a question or get help from the Space's host (an organization or individual). When the host is displayed in the About dialog, an explicit "Contact host" affordance lets them open a direct-message surface pre-addressed to the host. Anonymous users are first prompted to sign up.

**Why this priority**: Host contact is a meaningful, frequently-used path but not blocking. The MUI version supports it; parity prevents regression.

**Independent Test**: On a Space where the host is displayed (i.e., where there are no community leads, or in the "host below the references" position when leads exist), click "Contact host" while authenticated and confirm the messaging surface opens with the host pre-addressed; click "Contact host" while signed out and confirm the user is taken to the sign-up flow.

**Acceptance Scenarios**:

1. **Given** an authenticated user viewing a Space whose host is shown, **When** they activate "Contact host", **Then** a direct-message surface opens with the host (organization or person) pre-set as the recipient; submitting a message sends it.
2. **Given** an unauthenticated user, **When** they activate "Contact host", **Then** they are redirected to sign-up with the current page recorded so they can return after registering.
3. **Given** a Space with both community leads AND a host, **When** the dialog renders, **Then** the leads appear in the dedicated leads area and the host is displayed in a separate position (after references) so neither obscures the other.
4. **Given** a Space with no community leads, **When** the dialog renders, **Then** the host is displayed in the prominent position normally occupied by leads, with the "Contact host" affordance directly attached.

---

### User Story 4 - Privileged user edits a Space section in place (Priority: P2)

A user with edit privileges on the Space (Space lead, admin) needs to update the About content. From the dialog, they see a small edit affordance next to each editable section (description, why, who, references, community guidelines) and clicking it takes them directly to the corresponding edit screen in Settings, anchored to the right section.

**Why this priority**: Removing this in CRD would force admins to navigate manually to Settings, increasing friction. Parity ensures admin workflows do not regress.

**Independent Test**: As a user with edit privileges, open the About dialog and confirm pencil-style affordances appear next to each editable section; clicking each one navigates to the correct anchor inside the Space settings.

**Acceptance Scenarios**:

1. **Given** a user with edit privileges, **When** the dialog renders, **Then** edit affordances appear next to the description, "Why", "Who", references, and community guidelines section headers.
2. **Given** a user without edit privileges, **When** the dialog renders, **Then** no edit affordances are shown.
3. **Given** an edit affordance is activated for a specific section, **When** the navigation completes, **Then** the user lands in the Space settings on the About page anchored to that section (or to the Community settings for guidelines).

---

### User Story 5 - User reads the full Community Guidelines (Priority: P3)

A user scanning the About dialog sees a truncated preview of the Community Guidelines and wants to read the full text and any associated reference links before deciding to apply or interact further.

**Why this priority**: Guidelines visibility is important but the truncated preview already conveys the gist. The full read-more flow is a smaller value increment.

**Independent Test**: On a Space with non-empty community guidelines, open the About dialog, click "Read more" in the guidelines section, confirm a full-content surface opens with description and references; close it and verify the underlying About dialog stays open.

**Acceptance Scenarios**:

1. **Given** a Space with community guidelines populated, **When** the user activates "Read more" within the guidelines section, **Then** a full-content surface opens displaying the complete guidelines description and the list of reference links.
2. **Given** the full-content surface is open, **When** the user dismisses it (X / Esc / backdrop), **Then** only that surface closes; the underlying About dialog remains open and scrolled to the same position.
3. **Given** the Space has no guidelines text but the viewer has edit privileges, **When** the dialog renders, **Then** a short note explains that guidelines are admin-only and offers the edit affordance.
4. **Given** the Space has no guidelines and the viewer has no edit privileges, **When** the dialog renders, **Then** the guidelines section is omitted entirely.

### Edge Cases

- **Permission downgrade or upgrade mid-session**: a user's read privilege changes while the dialog is open (role removed by an admin, or membership granted in another tab). The dialog re-evaluates on the next user interaction or the next natural cache refresh — there is no active polling, no focus-triggered re-fetch, and no real-time subscription. The next interaction (e.g., clicking Apply or navigating) surfaces the corrected state.
- **Direct URL access without read privilege**: closing the dialog navigates to a safe destination (not the inaccessible Space home page).
- **Long content**: extremely long descriptions, "Why", "Who", or guideline texts must scroll within the dialog without breaking page layout.
- **Concurrent state changes**: a user accepts an invitation in another tab while the About dialog is open here. The apply call-to-action should remain functional and not get into an inconsistent state when the user returns.
- **Deep linking from dashboard**: a user arriving from a dashboard membership card should be returned to the dashboard on close, not to a default fallback.
- **No host and no leads**: the leads/host area is omitted entirely; no empty placeholder is shown.
- **Guidelines block requires data load**: while guidelines are still loading, the section displays a brief loading indication and does not flash empty content.
- **CRD toggle off**: navigating to the same About URL renders the legacy MUI dialog unchanged. Toggling the setting and reloading swaps to the CRD dialog without code-level changes.
- **Mobile viewport**: dialog adapts to small screens with the same content order, scroll behavior, and dismiss gestures, without overlapping the dismiss control.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: When the CRD design system is enabled (via the `alkemio-crd-enabled` localStorage toggle), the system MUST render the Space About at `/:spaceId/about` as a dialog overlay using the CRD visual language.
- **FR-002**: When the CRD design system is disabled (toggle off or unset, the default), the system MUST continue rendering the existing MUI About dialog at the same URL with no behavioral change.
- **FR-003**: The CRD About dialog MUST display, when the corresponding data is available: Space name, tagline, description, location, metrics (key/value pairs), community leads (users and organizations), host (organization or individual), "Why" section, "Who" section, community guidelines block, and external references.
- **FR-004**: The dialog MUST omit any section whose data is missing rather than rendering an empty placeholder.
- **FR-005**: The dialog MUST be closable via an explicit close control, the Esc key, or clicking outside the dialog. When the user has read privilege on the Space, closing MUST navigate them back to the page they came from (or to the Space home if they navigated to the About URL directly). When the user lacks read privilege, closing MUST step the browser history back two entries (so they leave both the inaccessible Space home and the About URL itself); if no such prior history exists, the system MUST fall back to the platform Home page.
- **FR-006**: When the viewer has no read privilege on the Space, the dialog MUST display a visible "restricted access" indicator near the title, with an accessible explanation, and offer a path to apply.
- **FR-007**: For non-members, the dialog MUST present a single primary call-to-action whose label and behavior reflects the user's current state. The supported states are: not signed in, can join community, can apply to community, application pending, can accept pending invitation, must apply to parent, must join parent. Members do not see a call-to-action.
- **FR-008**: When the user activates the "Apply" call-to-action, the system MUST present a form surface listing the Space's application questions, validate required answers and length limits client-side, submit the answers, and on success surface a "submitted" confirmation; the dialog MUST then reflect the "Application pending" state. Validation MUST run continuously while the user fills the form and the submit control MUST remain disabled until all required fields are valid; inline error text for an individual field MUST appear only after the user has either attempted to submit the form or blurred that field with invalid content (no per-keystroke error text).
- **FR-009**: When the user activates the "Join" call-to-action and the Space allows direct join, the system MUST request a single confirmation, then submit the join, and on success take the user into the Space.
- **FR-010**: When the user activates "Accept invitation," the system MUST present the existing invitation acceptance surface allowing the user to accept or decline.
- **FR-011**: When the Space requires parent-Space membership/application first, the system MUST present an explanatory surface with a link to engage with the parent Space.
- **FR-012**: When the user is not signed in, the call-to-action MUST navigate them to sign-in with their current location preserved so they return to the same About dialog after authentication.
- **FR-013**: When the host is displayed and the user activates "Contact host," the system MUST open a messaging surface pre-addressed to the host. Unauthenticated users MUST be redirected to sign-up first with the current location preserved.
- **FR-014**: The dialog MUST display the host either next to the leads area (when no leads exist) or in a separate position after the references (when leads exist), so the two never crowd each other.
- **FR-015**: For users with edit privileges, the dialog MUST display per-section edit affordances next to the description, "Why," "Who," references, and community guidelines section headers. Activating an affordance MUST navigate to the corresponding settings page anchored to the right section.
- **FR-016**: The community guidelines block MUST show a truncated preview when guidelines exist, with a "Read more" affordance that opens a full-content surface containing the description and references. Closing the full-content surface MUST keep the About dialog open and scrolled to its prior position.
- **FR-017**: When community guidelines are empty and the viewer has edit privileges, the dialog MUST inform them that guidelines are admin-only and offer the edit affordance. When guidelines are empty and the viewer has no edit privileges, the section MUST be omitted entirely.
- **FR-018**: Section titles for "Why" and "Who" MUST adapt to the Space's level (top-level vs. subspace) so that copy reflects the appropriate framing for the current entity.
- **FR-019**: All user-visible strings introduced by the CRD About dialog MUST be available in all six languages currently supported by the platform (English, Dutch, Spanish, Bulgarian, German, French). Missing translations MUST fall back to English without crashing.
- **FR-020**: The dialog MUST be operable via keyboard alone: tab order proceeds through interactive elements in a sensible order, focus is trapped inside the dialog while open, Esc closes, and focus returns to the prior trigger on close.
- **FR-021**: All interactive elements (close, call-to-action, edit affordances, "Read more," "Contact host," lock-tooltip "Learn how to apply" link) MUST be reachable by assistive technologies with appropriate labels and roles. Decorative icons MUST be hidden from assistive technologies.
- **FR-022**: The dialog MUST work on mobile viewports: content scrolls within the dialog, dismiss controls remain accessible, and no element overlaps the dismiss area.
- **FR-023**: Toggling the CRD design system on or off and reloading the page MUST swap which version of the dialog renders without requiring further configuration.
- **FR-024**: This feature applies to top-level Spaces (Level 0) only in this iteration. With the CRD toggle on, navigating to a subspace About URL (e.g., `/:spaceId/challenges/:subspaceNameId/about`) MUST continue to render the legacy MUI subspace About dialog. The CRD dialog's level-aware behavior MUST nonetheless support all three Space levels in its data so that future subspace migration requires no further work in this layer.
- **FR-025**: When any user-initiated mutation triggered from the About dialog (apply submission, direct join, invitation acceptance/rejection, host message send) fails, the system MUST surface the failure via the platform's existing toast/notification mechanism. The originating flow surface MUST remain open so the user can retry without re-entering data. No partial state change MUST be reflected in the About dialog until the mutation succeeds.

### Key Entities *(include if feature involves data)*

- **Space**: The primary unit users explore. Key attributes referenced in the About dialog: display name, tagline, description, level (Level 0 / 1 / 2), location, profile URL.
- **Space About**: Aggregated view-data for a Space — description, "Why," "Who," metrics (key/value pairs), references (name + URL + optional description), provider (host), community membership info (leads users, leads organizations), application form, community guidelines reference.
- **Community Membership State** (per current viewer): membership flag, parent-membership flag, current application state (none/pending/etc.), pending invitation (if any), parent application state, join/apply capability flags for both this and the parent Space.
- **Community Guidelines**: Per-Space document with display name, markdown description, and a list of reference links.
- **Application Form**: A list of questions, each with question text, "required" flag, and maximum answer length, plus an optional form description.
- **Host (Provider)**: Either an organization or an individual responsible for hosting the Space. Has a display name, avatar, optional location, and a profile URL.
- **Community Lead**: A user or organization listed as a leader of the Space's community. Has display name, avatar, optional location, profile URL, and a "user" or "organization" type.
- **Reference**: An external link with a name, URL, and optional description.
- **CRD Feature Toggle**: A per-browser preference that switches the design system rendered for the Space pages. Default is off; users opt in via the Admin → Platform Settings → Design System control.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the CRD toggle on, 100% of users who navigate to a Space About URL see the CRD dialog and can perform every action they could perform in the MUI version (view, apply, join, accept invitation, contact host, edit if privileged, view guidelines).
- **SC-002**: With the CRD toggle off, 100% of users continue to see the existing MUI dialog and report no behavioral change attributable to this feature work.
- **SC-003**: The dialog presents and becomes interactive within 1 second of route navigation on a typical broadband connection (perceived first interaction time).
- **SC-004**: A user can complete the apply flow (open dialog → activate Apply → submit form → confirmation) in fewer than 90 seconds on a Space with up to 5 application questions.
- **SC-005**: An unauthenticated visitor can move from "About dialog open" to "signed in and back at the apply call-to-action" without losing their place in the application path.
- **SC-006**: All interactive elements meet WCAG 2.1 AA: visible focus indicators, accessible names, logical tab order, focus management on open/close.
- **SC-007**: All user-visible strings render in each of the six supported languages with no missing keys and no English fallback occurrences in non-English runs.
- **SC-008**: Toggling the CRD setting on, reloading, then toggling off and reloading consistently produces the corresponding dialog version, with no client-side errors or stale rendering.
- **SC-009**: Edit affordances appear for users with edit privileges and never appear for users without — measured at zero false positives across role-permission permutations covered by smoke testing.
- **SC-010**: For Spaces with community guidelines, the truncated preview is readable on a 360px-wide viewport without horizontal scroll, and the full-content surface remains usable on the same viewport.

## Assumptions

- The existing route swap between MUI and CRD Space routes (driven by `alkemio-crd-enabled`) remains the mechanism for selecting which About implementation renders. No URL change is required.
- Reusing existing business-logic hooks (application state, invitation actions, direct messaging, community guidelines query, application submission, navigation back) is acceptable because they are presentation-agnostic.
- Existing translation keys used by the MUI dialog under the `translation` namespace (e.g., level-aware section titles, application-button labels, sign-in-helper text) may continue to be used as a source for copy. New CRD-only labels (e.g., dialog chrome, apply state machine labels for the new button composite) will be added to the `crd-space` namespace and translated to all six supported languages.
- The legacy MUI direct-message surface, opened from the integration layer when a user activates "Contact host," is acceptable as a temporary stopgap and will be replaced by a CRD equivalent in a later iteration. This is consistent with how legacy MUI messaging and notifications surfaces are reused from the CRD layout today.
- This iteration covers Level-0 Spaces only. Subspaces continue to render the MUI About; the CRD presentational components nonetheless accept level-aware data so the future subspace migration is a routing change, not a redesign.
- The CRD dialog's visual treatment may differ in detail from the MUI version (sizing, shadows, typography) since "we lack a specific design in the prototype," and the existing CRD primitives and layout patterns are the source of truth for visual choices.
