# Feature Specification: About Dialog Redesign (Prototype → CRD)

**Feature Branch**: `104-about-dialog-redesign`
**Created**: 2026-06-05
**Status**: Draft
**Input**: User description: "Follow the directions of /docs/crd/migration-guide.md. and migrate the About dialog UI/UX from the prototype/ to the CRD making sure no functionality is affected negatively."

## Overview

The Space "About" dialog already exists in the new design system (CRD) and is wired to live data, the apply-to-join flow, community guidelines, host contact, edit affordances, and private-space lock state. However, its visual layout predates the updated prototype design (`prototype/src/app/components/space/AboutThisSpaceDialog.tsx`), which presents the same information in a richer, more polished arrangement.

This feature re-skins the existing CRD About dialog so its **look and feel matches the updated prototype**, while **preserving every existing behavior** (no functional regressions). It is a presentation-layer migration: the data, permissions, navigation targets, and flows stay the same; only the visual structure changes to match the prototype.

The dialog is reached from two entry points that must remain behaviorally identical: the "About this Space" trigger in the space sidebar, and the `/about` route.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Visitor reads about a space in the redesigned dialog (Priority: P1)

A visitor opens the About dialog from a space and sees, in the new prototype layout: the space name and tagline as the heading, a prominent space-information panel containing the full description, the location and member count, and the space leads; followed by the "Why" and "Who" context sections, the community guidelines, the references, and the "Hosted by" block.

**Why this priority**: This is the core of the feature — the whole purpose is to present existing space information using the new prototype's visual design. Without it, there is nothing to demonstrate.

**Independent Test**: Open the About dialog on a space that has a description, tagline, location, members, leads, why/who text, guidelines, references, and a host. Confirm every piece of information appears, is readable, and is arranged to match the prototype reference, and that the heading shows the space name and tagline.

**Acceptance Scenarios**:

1. **Given** a space with full About content, **When** a user opens the About dialog, **Then** the heading shows the space name with the tagline beneath it, and all sections (space-info panel, Why, Who, Guidelines, References, Hosted by) render with the prototype's visual treatment.
2. **Given** a tall About dialog on a short screen, **When** the content exceeds the viewport, **Then** the heading and close control stay pinned and only the body scrolls (the close control is always reachable).
3. **Given** a space missing optional content (no tagline, no why/who, no references, no guidelines, no host), **When** the dialog opens, **Then** the corresponding sections are omitted cleanly with no empty placeholders or broken layout.
4. **Given** any space-level entity (top-level space or subspace), **When** the dialog opens, **Then** the "Why"/"Who" section headings use the level-appropriate wording already defined for the current dialog.

---

### User Story 2 - Visitor applies to join from the About dialog (Priority: P1)

A non-member opens the About dialog and uses the apply / join affordance to start the existing membership flow. A current member instead sees the "already a member" indication rather than an apply control.

**Why this priority**: Applying to join is a primary conversion action and an existing capability. A redesign that breaks it would negatively affect functionality, which the request explicitly forbids.

**Independent Test**: As a non-member, open the dialog and confirm the apply/join control appears and launches the same apply flow and follow-up dialogs as today. As a member, confirm the member indication appears and no apply control is shown.

**Acceptance Scenarios**:

1. **Given** a non-member viewing the dialog, **When** the apply data has loaded, **Then** the apply/join control is shown and triggers the existing apply flow and its dialogs unchanged.
2. **Given** a member viewing the dialog, **When** the dialog opens, **Then** no apply control is shown and the member status is indicated.
3. **Given** apply state is still loading, **When** the dialog opens, **Then** the apply control does not flash an incorrect state before data resolves.

---

### User Story 3 - Admin edits space content from the dialog (Priority: P2)

An administrator (a user with update permission) sees inline edit affordances on the editable sections and the space-information panel. Activating an edit affordance navigates to the matching space-settings destination exactly as it does today.

**Why this priority**: Inline editing is an existing capability for admins. It must continue to work and land on the same settings destinations; otherwise the redesign degrades functionality. It is P2 because it serves admins rather than the broader visitor audience addressed by P1.

**Independent Test**: As an admin, open the dialog and confirm edit affordances appear for the description/space-info panel, Why, Who, Guidelines, References, and members/community; activate each and confirm it navigates to the same settings destination as the current dialog.

**Acceptance Scenarios**:

1. **Given** an admin viewing the dialog, **When** they activate the edit affordance for a given section, **Then** they are taken to the same space-settings destination that the current dialog uses for that section.
2. **Given** a non-admin viewing the dialog, **When** the dialog opens, **Then** no edit affordances are shown.
3. **Given** an admin on the space-information panel, **When** they use its profile/community edit affordances, **Then** navigation goes to the space profile/community settings respectively.

---

### User Story 4 - Visitor reads guidelines, references, and contacts the host (Priority: P2)

A visitor reads the community guidelines (with the ability to expand long guidelines to their full text), follows a reference to its external destination, and uses the "Hosted by" block to reach the host.

**Why this priority**: These are existing supporting capabilities surfaced in the prototype layout. They round out the dialog's value but are secondary to viewing information (P1) and joining (P1).

**Independent Test**: Open the dialog on a space with long guidelines, several references, and a host; confirm guidelines can be expanded to full text, each reference opens its destination in a new tab, and the host affordance behaves as it does today.

**Acceptance Scenarios**:

1. **Given** guidelines longer than the previewed area, **When** the user chooses to read more, **Then** the full guidelines text becomes available to read.
2. **Given** a list of references, **When** the user activates a reference, **Then** its external destination opens in a new browser tab without navigating away from the dialog.
3. **Given** a space with a host, **When** the user uses the host-contact affordance, **Then** the existing host-contact behavior is preserved (see Assumptions).

---

### Edge Cases

- **Private space (no read access)**: the lock indication currently shown in the dialog heading must be preserved.
- **No host / no leads**: the "Hosted by" and "Leads" areas are omitted without leaving gaps; the layout reflows to the prototype's fallback arrangement.
- **Missing avatars/banners**: people and organizations without an avatar fall back to the design system's standard fallback treatment; no broken image icons appear.
- **Very long text** (description, why, who, tagline, names): text wraps or truncates per the prototype without overflowing the panel or pushing controls off-screen.
- **Markdown content**: description, why, who, and guidelines that contain formatting render as formatted rich text, never as raw markup.
- **Slow data**: opening the dialog before data resolves shows an acceptable intermediate state and never an error or layout jump.
- **Both entry points**: the sidebar trigger and the `/about` route render the same content and behavior.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The About dialog MUST present space information using the updated prototype's visual layout, including a heading with the space name and tagline, a prominent space-information panel (description, location, member count, leads), and distinct sections for Why, Who, Community Guidelines, References, and Hosted by.
- **FR-002**: The redesign MUST preserve all data currently shown in the dialog: name, tagline, description, location, member count, member status, lead users, lead organizations, host/provider, why, who, community guidelines, and references.
- **FR-003**: The apply-to-join flow MUST remain functionally unchanged — same trigger conditions (shown only to eligible non-members once apply data has loaded), same flow, and same follow-up dialogs.
- **FR-004**: Member status MUST be indicated for current members, and the apply control MUST NOT be shown to members.
- **FR-005**: Inline edit affordances MUST appear only for users with update permission and MUST navigate to the same space-settings destinations the current dialog uses (description, why, who, guidelines, references, members/community).
- **FR-006**: The community-guidelines presentation MUST allow the full guidelines text to be read when it exceeds the previewed length.
- **FR-007**: Each reference MUST open its external destination in a new browser tab and MUST NOT dismiss or navigate away from the dialog.
- **FR-008**: The private-space lock indication MUST be preserved when the viewer lacks read access.
- **FR-009**: The dialog heading and close control MUST remain visible while the body scrolls, on any viewport height; the close control MUST always be reachable.
- **FR-010**: Both entry points (sidebar "About this Space" trigger and the `/about` route) MUST render identical content and behavior.
- **FR-011**: Optional sections with no content MUST be omitted without leaving empty placeholders or broken layout.
- **FR-012**: Rich-text fields (description, why, who, guidelines) MUST render as formatted content, never as raw markup.
- **FR-013**: People and organizations without an avatar MUST display the design system's standard fallback treatment; no broken images.
- **FR-014**: The "Why"/"Who" section headings MUST continue to use the level-appropriate wording for the entity (top-level space vs. subspace).
- **FR-015**: The host-contact affordance MUST be preserved (its behavior is governed by the Assumptions section).
- **FR-016**: The redesigned dialog MUST be reachable and operable by keyboard alone, with visible focus indicators and screen-reader-accessible labels for all interactive elements, including icon-only controls.
- **FR-017**: All user-visible text introduced or relocated by the redesign MUST be localizable; no new hardcoded user-facing strings.
- **FR-018**: The redesign MUST NOT remove or weaken any behavior currently available in the dialog (no functional regression).

### Key Entities *(include if feature involves data)*

- **Space (About)**: the subject of the dialog — name, tagline, description, location, member count, why, who, guidelines, references, host/provider, and leads. All sourced from existing data; no new data requirements.
- **Lead**: a person or organization that leads the space — name, optional avatar, optional location, and a link to its profile.
- **Host / Provider**: the organization responsible for the space's content — name, optional avatar, optional location, and a link/contact affordance.
- **Community Guidelines**: a titled, formatted body of text with optional references; expandable to full length.
- **Reference**: a titled external link with an optional description.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the information available in the current About dialog is present in the redesigned dialog (no data dropped).
- **SC-002**: 100% of the current dialog's interactive behaviors — apply/join, member indication, per-section editing with correct destinations, guidelines expansion, reference links, host contact, lock indication — remain available and land on the same outcomes (zero functional regressions).
- **SC-003**: Both entry points produce visually and behaviorally identical dialogs in side-by-side comparison.
- **SC-004**: A reviewer comparing the redesigned dialog against the prototype reference confirms layout parity for all sections, with no missing or extra sections.
- **SC-005**: The dialog is fully operable by keyboard, and the heading/close control remain visible at viewport heights down to a small laptop/landscape phone, with the body scrolling independently.
- **SC-006**: Spaces with any combination of missing optional content render without empty placeholders, gaps, or broken layout.

## Assumptions

- **Refresh in place**: This redesign updates the existing CRD About dialog (the components behind the sidebar trigger and the `/about` route) rather than introducing a separate, parallel dialog. The existing dialog is the one being re-skinned.
- **Functional preservation over prototype novelty**: Where the prototype introduces an interaction that the current dialog implements differently, the existing behavior is preserved (restyled to match the prototype), because the explicit constraint is that no functionality is affected negatively and the migration guidance is to not over-migrate. Specifically, the **host-contact affordance** keeps its current behavior (reaching the host as it does today) presented within the prototype's "Hosted by" block — the prototype's standalone in-app message-compose sub-dialog is treated as out of scope for this functional-parity migration and can be reconsidered separately during clarification/planning.
- **Mock data is illustrative**: The prototype's hardcoded space, leads, host, guidelines, and references are placeholders for the real data already wired into the current dialog; they are not requirements in themselves.
- **Admin edit entry points**: The prototype's space-information panel shows profile/community edit affordances and the individual sections show per-section edit affordances. Both map to the existing settings destinations; the per-section edit navigation already in the dialog is retained.
- **Design tokens over prototype literals**: The prototype's hardcoded colors and inline styles are reproduced using the design system's tokens/conventions rather than literal values, consistent with the migration guide.
- **No new platform data or backend changes**: The feature consumes only data already available to the current dialog.
- **Scope is the Space About dialog**: The closely related subspace About and innovation-hub About surfaces are out of scope unless they share the same underlying component, in which case shared-component parity is maintained.

## Out of Scope

- A new in-app message-compose flow for contacting the host (beyond the existing affordance).
- Changes to the apply-to-join flow itself, the settings pages the edit affordances navigate to, or the underlying data model.
- Migration of unrelated dialogs or pages.
- Removal of the legacy MUI About dialog or any feature-toggle cleanup.
</content>
