# Feature Specification: CRD SubSpace Page (with L0 Banner Community Refinements)

**Feature Branch**: `091-crd-subspace-page`
**Created**: 2026-04-24
**Status**: Draft
**Input**: User description: "Implement the CRD SubSpace (L1) page per the prototype design and Issue #9568, reusing the existing L0 (top-level) Space CRD layer (specs 042/045/086/087/088/089) and applying small refinements to the L0 banner community avatar stack (real total member count + click-to-open community dialog). Follows docs/crd/migration-guide.md verbatim."

## Background

The platform is in the middle of an incremental UI redesign: the new design system (CRD) ships behind a per-user toggle, while the legacy UI remains the default for everyone else. Top-level Spaces ("L0") are already migrated. SubSpaces ("L1" — the focused collaboration areas nested under a parent Space) are not. Today, when a user with the new design system enabled opens any subspace URL, they see an empty shell because the new layout short-circuits for any non-L0 space. This feature fills that gap and, while we are touching the shared banner layout, fixes two known issues on the L0 banner community avatar stack.

The visual design is documented in the prototype (the source of truth for layout) plus a set of corrections from the design lead captured in issue [#9568](https://github.com/alkem-io/client-web/issues/9568). Those corrections are applied during the port — we do not ship the prototype as-is.

## Clarifications

### Session 2026-04-24

- Q: How should the community dialog (opened from the banner avatar stack on both L0 and L1) handle a community with thousands of members? → A: Reuse the same members-listing pattern already used in the L0 Community tab (consistency)
- Q: Which flow phase is active on first load? → A: Match the legacy behaviour — default to the subspace's currently active innovation-flow phase
- Q: For an L2 (sub-of-sub) space, which space appears as the "behind" identity in the banner's layered avatar? → A: The immediate parent (the L1 SubSpace), consistent with the L1 case; the broader hierarchy is conveyed by breadcrumbs
- Q: When a subspace has no innovation flow phases, what does the page render? → A: An empty-state message only — no action button, regardless of viewer privileges

## User Scenarios & Testing *(mandatory)*

### User Story 1 — A SubSpace member can browse and act in the new design system (Priority: P1)

A platform user with the new design system enabled opens a subspace they belong to. They see a complete page: the subspace's banner (inheriting the parent's banner image), a clear visual link to the parent space (a layered avatar showing parent + subspace identity), the subspace's title and tagline below the banner, a strip of innovation-flow phase tabs across the top of the content area, and the active phase's posts in the feed. They can switch phases, open dialogs for community / events / recent activity / index / child subspaces from the right sidebar, and read the subspace's purpose and lead from the sidebar info card. None of these surfaces are empty placeholders — they all show real data.

**Why this priority**: This is the entire reason the feature exists. Without it, opening a subspace with the new design system on is a broken experience for every member.

**Independent Test**: Enable the design system toggle, visit any subspace URL, and confirm the page renders with banner, breadcrumbs, flow tabs, posts, sidebar, and dialogs — all populated from real data, not placeholders.

**Acceptance Scenarios**:

1. **Given** the new design system is enabled and the user is a member of a subspace, **When** they navigate to the subspace URL, **Then** they see the subspace's banner with the parent's banner image as background, a layered parent + subspace avatar, the subspace title and tagline below the banner, breadcrumbs (home → parent space → subspace), innovation-flow phase tabs, the feed of posts for the first phase, and the right-hand sidebar with info card, About button, and Quick Actions.
2. **Given** the subspace has multiple flow phases, **When** the user clicks a different phase tab, **Then** the feed updates to show only the posts associated with that phase, and a connector renders between every adjacent pair of phase tabs.
3. **Given** the user is on a subspace, **When** they click any Quick Action (Community, Events, Recent Activity, Index, Subspaces), **Then** the corresponding dialog opens populated with real data drawn from the same components used elsewhere in the platform.

---

### User Story 2 — A non-member can discover and apply to a SubSpace (Priority: P2)

A platform user who is not yet a member of a subspace opens a public subspace's URL. They can read the subspace's description, see who leads it, see how many people are in the community, and find an Apply / Join button. If they have a pending invitation or application, the button reflects that state. If joining the parent space is a prerequisite, the button reflects that too.

**Why this priority**: Discovery and joining are the second most-used path for any space surface; without them, the page only serves existing members and breaks the growth flow.

**Independent Test**: As a signed-in non-member (or signed-out visitor), open a public subspace and confirm the apply / join CTA appears with the correct state. As an invited user, confirm the invitation accept flow is reachable. As an applicant, confirm the pending state shows.

**Acceptance Scenarios**:

1. **Given** the user is signed in and is not a member of the subspace and the subspace is public, **When** they open the page, **Then** they see all public details (banner, description, lead, community size) and an Apply or Join button reflecting the correct membership state (joinable / invitation pending / application pending / parent membership required).
2. **Given** the subspace is archived, demo, or inactive, **When** the user opens the page, **Then** they see a clearly-marked notice describing the subspace's state at the top of the page.
3. **Given** the user clicks "About this Subspace" from the sidebar, **When** the dialog opens, **Then** it shows the subspace's full public details (description, structure, leads, guidelines) using the same About dialog already used on L0 spaces.

---

### User Story 3 — L0 Space banner avatar stack is interactive (Priority: P3)

A user on a top-level Space sees a stack of lead-user avatars on the banner. Clicking the avatar stack opens a community dialog listing the members.

**Why this priority**: The avatar stack currently looks clickable but does nothing — wiring it to the community dialog is small in scope and shares all of its plumbing with User Story 1, so it ships in the same feature.

**Note on the original "+N" count fix**: The banner originally lied about community size (`+N` showed lead count, not member count). The proposed fix (true total via a new `CommunityMemberCount.graphql`) was deferred — see research R1. Both L0 and L1 banners now show lead-user avatars only, with no `+N` overflow chip.

**Independent Test**: Open any L0 space, click the avatar stack, confirm the community dialog opens.

**Acceptance Scenarios**:

1. **Given** the user clicks the avatar stack on an L0 banner, **When** the click is handled, **Then** the community dialog opens (the same dialog used by the SubSpace page).

---

### User Story 4 — Innovation flow tabs render with consistent visual integrity (Priority: P4)

A user looking at any subspace with multiple innovation-flow phases sees a connector (visual arrow) between every adjacent pair of phases. There are no gaps, no extra small "count" circles next to phases. The strip is sticky as the user scrolls.

**Why this priority**: This is the design lead's explicit correction (#1 and #2 from issue #9568) and applies to every subspace. It is a polish requirement on top of P1 — the page works without it but is visibly off-spec.

**Independent Test**: Visit any subspace with at least three flow phases. Confirm a connector renders between every adjacent pair. Confirm no count badges render next to phase names. Scroll the feed and confirm the tab strip remains visible.

**Acceptance Scenarios**:

1. **Given** a subspace has phases A → B → C → D, **When** the user views the page, **Then** connectors render between A-B, B-C, and C-D.
2. **Given** any phase has callouts, **When** the user views the tab strip, **Then** no count badge appears next to the phase name.

---

### User Story 5 — All text is translated and the page is accessible (Priority: P5)

A user changes the platform language to one of the 6 supported languages (English, Dutch, Spanish, Bulgarian, German, French). Every visible string on the SubSpace page renders in their chosen language. A user navigating with a keyboard alone can reach every interactive element on the page; a screen reader announces the purpose of every icon-only button; focus indicators are visible.

**Why this priority**: Translation completeness and accessibility are non-negotiable for any new page in the platform — but they are validated last because they verify the work of the earlier stories rather than introducing new functionality.

**Independent Test**: Switch the language to each of the six supported languages and confirm no English fallbacks remain on the SubSpace page. Run an automated accessibility audit and confirm zero WCAG 2.1 AA violations.

**Acceptance Scenarios**:

1. **Given** the user switches language to Bulgarian (or any of the other 5 supported languages), **When** the SubSpace page renders, **Then** every label, button, dialog title, sidebar heading, and accessibility-only text appears in the selected language.
2. **Given** the user navigates the SubSpace page using only the keyboard, **When** they Tab through the page, **Then** focus passes through every interactive element in a logical reading order, and a visible focus indicator appears on each one.

---

### Edge Cases

- **Subspace has no parent banner image**: The banner falls back to a deterministic accent gradient derived from the parent's identity (so the same parent always shows the same fallback colour).
- **Subspace has no callouts / no flow phases**: The flow tab strip and feed render an empty-state message explaining the absence rather than a blank region. No action button is shown, regardless of viewer privileges (flow setup is reachable from the existing settings path, not from the empty state).
- **Subspace is L2 (sub-of-sub)**: Renders using the same SubSpace layout. The banner badge adapts to the level (e.g. shows "SubSubSpace" for L2). The layered avatar's "behind" identity is the immediate L1 parent (not the root L0); the L0 still appears in breadcrumbs.
- **Visitor is signed out**: Public details still render. The apply CTA prompts sign-in.
- **Subspace is archived, demo, or inactive**: A visibility notice appears at the top of the page; the rest of the page still renders.
- **Joining the parent space is a prerequisite**: The apply CTA shows that path explicitly.
- **The user opens the page with the design system toggle OFF**: They get the legacy experience, unchanged. Nothing in this feature affects the legacy path.
- **Community member count is zero**: The avatar stack is hidden rather than rendering an empty group.
- **The user lacks update permission on the subspace**: The flow editor entry point does not appear.
- **The user lacks create permission on callouts**: The Add Post entry point does not appear.

## Requirements *(mandatory)*

### Functional Requirements

#### SubSpace page rendering (User Story 1)

- **FR-001**: The system MUST render a complete SubSpace page (not an empty shell) for every L1 and L2 space when the new design system is enabled.
- **FR-002**: The system MUST inherit the parent space's banner image as the SubSpace banner background.
- **FR-003**: The system MUST display a layered avatar on the banner showing both the immediate parent space's identity (behind) and the current subspace's identity (in front), visually conveying the direct parent-child relationship. For an L2 (sub-of-sub) space, the "behind" identity MUST be the immediate L1 parent, not the root L0 space — the broader hierarchy is conveyed by breadcrumbs (FR-006).
- **FR-004**: The system MUST display a badge on the banner identifying the page as a SubSpace (or SubSubSpace for L2) so visitors can distinguish it from an L0 page.
- **FR-005**: The system MUST render the subspace's title and tagline immediately below the banner.
- **FR-006**: The system MUST render breadcrumbs from the platform home through the parent space to the current subspace.
- **FR-007**: The system MUST display banner action icons for recent activity, video call, share, and settings; each icon MUST appear only when the user is entitled to use the corresponding feature.
- **FR-008**: The system MUST render the subspace's innovation flow phases as a sticky pill-tab strip across the top of the content column.
- **FR-009**: The system MUST render a visual connector (double-arrow) between every adjacent pair of flow phases — no gaps.
- **FR-010**: The system MUST NOT display per-phase count badges on the flow tabs.
- **FR-011**: The system MUST filter the content feed by the active flow phase. On first load, the active phase MUST default to the subspace's currently-active innovation-flow phase (matching the legacy behaviour); when no current phase is defined, it MUST default to the first phase in flow order.
- **FR-012**: The system MUST show an "Edit Flow" entry point next to the flow tabs only when the user has permission to update the subspace's structure.
- **FR-013**: The system MUST show an "Add Post" entry point next to the flow tabs only when the user has permission to create callouts in the subspace.

#### Right sidebar (User Story 1)

- **FR-014**: The system MUST render a right-aligned sidebar (one column gap from the right edge, mirroring the L0 layout). The sidebar is fixed (not collapsible).
- **FR-015**: The sidebar MUST render a primary info block at the top showing the space's purpose (sourced from `profile.description`, rendered as markdown) and the lead user(s) and lead organization(s) inline within the same panel. The same widget is shared between L0 and L1 sidebars (see plan D14). On L0, the info block (with leads) MUST appear on every tab — Dashboard, Community, Subspaces, and Knowledge — not only on the Community tab (see plan D15). Lead organizations use square avatars to mirror the platform-wide treatment.
- **FR-016**: The info block MUST NOT contain a "Challenge Statement" header label or icon. Body text is white on the blue panel for accessibility, sized to `text-body` (14px) per the prototype, with markdown headings downgraded to body size so a `# Heading` in the description never balloons in the sidebar.
- **FR-017**: The info block MUST expose an edit-on-hover affordance: a `<Pencil>` icon revealed on hover/focus in the top-right corner, with the entire panel clickable. Clicking it MUST navigate to (L0) `${spaceProfileUrl}/settings/about` or (L1) open the existing platform-wide About dialog populated with the subspace's full public details. There is no separate "About this Subspace" outline button below the info block — the unified InfoBlock handles both reading and editing entry points.
- **FR-018**: The sidebar MUST render a Quick Actions list with entries for Community, Events, Recent Activity, Index, and Subspaces. Clicking each entry MUST open the corresponding dialog.
- **FR-019**: The Events Quick Action MUST reuse the existing space-level Events / Timeline component — the system MUST NOT introduce a separate per-subspace events implementation.
- **FR-020**: The Recent Activity Quick Action MUST reuse the existing home-page recent-activity component — the system MUST NOT introduce a separate per-subspace activity implementation.
- **FR-021**: The sidebar MAY render a Virtual Contributor card when the subspace has an associated virtual contributor; otherwise the section MUST be hidden.
- **FR-022**: The sidebar MUST render a placeholder section titled "Updates from the Lead" with a clearly-marked TODO indicating the implementation is tracked as a separate follow-up.

#### Membership and visibility (User Story 2)

- **FR-023**: The system MUST display the apply / join CTA when the visitor is not a member of the subspace, reusing the existing platform application-button logic so the CTA correctly reflects: joinable, application pending, invitation pending, accept-invitation, and parent-membership-required states.
- **FR-024**: The system MUST display a visibility notice (archived / demo / inactive) at the top of the page when the subspace is in any of those states.
- **FR-025**: A signed-out visitor MUST be able to view all public details of a public subspace and MUST be prompted to sign in when they engage the apply CTA.

#### Banner community avatar stack (User Stories 1 and 3)

- **FR-026**: ~~The banner avatar stack on both L0 and L1 pages MUST display a sample of community member avatars and the **true total community member count** (not the count of lead users).~~ **DEFERRED** — see research R1. Both banners currently show lead-user avatars only, no `+N` overflow chip. The "true total" portion is tracked as a follow-up.
- **FR-027**: Clicking the banner avatar stack MUST open the community dialog (the same dialog used by both L0 and L1 pages). The dialog MUST present the members using the same listing pattern (search, pagination/virtualisation, ordering) already used by the L0 Community tab — no separate scaling strategy is introduced for the dialog.
- **FR-028**: When there are no lead-user avatars to display, the avatar stack MUST be hidden rather than rendering an empty group.
- **FR-029**: The system MUST remove the dashboard-style KPI section that was previously shown in the community context — neither L0 nor the new L1 community dialog renders it.

#### Coexistence with the legacy experience

- **FR-030**: When the new design system toggle is OFF, all subspace and L0 space URLs MUST continue to render the legacy experience unchanged.
- **FR-031**: The settings icon on the SubSpace banner MUST link to the legacy settings pages until those pages are themselves migrated.

#### Internationalization and accessibility (User Story 5)

- **FR-032**: Every visible string on the SubSpace page MUST be translated for all 6 supported platform languages (English, Dutch, Spanish, Bulgarian, German, French) without falling back to English.
- **FR-033**: Every interactive element on the SubSpace page MUST be reachable and operable by keyboard alone, with visible focus indicators.
- **FR-034**: Every icon-only button MUST expose an accessible label that conveys its purpose to assistive technologies.
- **FR-035**: The SubSpace page MUST meet WCAG 2.1 AA contrast requirements for all text and interactive elements.

### Out of Scope (explicit follow-ups)

- **Updates from the Lead** panel implementation — placeholder only (FR-022). Tracked as a follow-up that will address both L0 and L1 consistently, because the underlying functionality already exists in space settings but is not surfaced on the view side of either level.
- **Collapsible sidebar** — the sidebar is fixed (FR-014). The prototype's collapse-toggle is intentionally skipped per design lead's note that the collapse logic is not fully thought through.
- **L1 admin / settings pages migration** — settings icon links to legacy settings (FR-031); the L1 settings pages are migrated in a separate feature.
- **Dedicated L2 (sub-of-sub) layout** — L2 spaces use the same SubSpace layout with an adapted badge label (FR-004); a dedicated L2 layout, if ever needed, is a separate feature.

### Key Entities *(business-level)*

- **SubSpace**: A focused collaboration area nested within a parent Space. Identified by a slug under the parent's URL. Has an identity (name, tagline, optional avatar), a banner inherited from its parent, an innovation flow with one or more phases, a content feed of posts/callouts organised by phase, a community with members and one or more leads, public visibility and lifecycle state (active / archived / demo / inactive), and a permission scope determining who can read, post, edit the flow, and apply.
- **Innovation Flow Phase**: A named stage in the subspace's process flow. Used to group and filter the subspace's content feed. Phases are ordered.
- **Community**: The set of users that have joined the subspace. Surfaced on the banner as a lead-user avatar sample (no total count — see FR-026) and in the Community dialog as a full list.
- **Lead**: A designated lead user of the subspace. Surfaced on the sidebar info card.
- **Parent Space**: The top-level (L0) Space (or, for L2, the L1 SubSpace) that contains this subspace. Provides the banner image and is shown in breadcrumbs.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: With the new design system enabled, opening any L1 or L2 space URL renders a complete page (banner, tabs, feed, sidebar, dialogs all populated) in 100% of cases — versus today, where 100% of such opens render an empty shell.
- **SC-002**: A first-time visitor to a public subspace can read the subspace's purpose, identify its lead, see the community size, and locate the apply CTA within 30 seconds without scrolling beyond the first viewport.
- **SC-003**: The community member count displayed on the banner of every L0 and L1 page matches the actual total community size with 100% accuracy — versus today, where L0 displays the lead count instead and L1 displays nothing.
- **SC-004**: 100% of visible strings on the SubSpace page render correctly in each of the 6 supported languages (no English fallbacks).
- **SC-005**: The SubSpace page passes automated WCAG 2.1 AA accessibility audits with zero violations.
- **SC-006**: 100% of innovation flow tab renders display a connector between every adjacent phase pair, with no count badges anywhere — verified across at least three subspaces with different phase counts.
- **SC-007**: With the new design system disabled, every existing user flow on legacy SubSpace and L0 pages continues to work with zero observable change.
- **SC-008**: The community dialog opens within 500ms of clicking the banner avatar stack on either an L0 or L1 page.

## Assumptions

These defaults were chosen rather than flagged as `[NEEDS CLARIFICATION]` because reasonable conventions exist:

- **Settings icon target**: For now, the settings icon on the SubSpace banner links to the legacy settings pages, because the L1 settings migration is a separate effort. This is consistent with how breadcrumbs already navigate to legacy paths in interim states.
- **L2 badge label**: For L2 (sub-of-sub) spaces, the banner badge reads "SubSubSpace" derived from the space's level, so visitors can still tell the depth.
- **Virtual Contributor visibility**: The Virtual Contributor sidebar card is rendered only when the subspace has an associated virtual contributor; otherwise the section is hidden entirely (no empty state).
- **Member count source field**: The platform's data model already exposes a community member count distinct from the lead count; this spec assumes that count is available without schema changes. If not, surfacing it is a small follow-up data-layer change scoped during planning.
- **Mobile responsiveness**: The right sidebar collapses to a bottom-of-page section on small screens, mirroring the L0 mobile pattern. Quick Actions remain accessible via the same mobile "More" affordance the L0 page already uses.
- **Dialog reuse**: The Community, Events, Recent Activity, Index, and Subspaces dialogs all reuse components already shipped on the L0 side or the home page; they are wrapped, not re-implemented.
