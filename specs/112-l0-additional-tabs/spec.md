# Feature Specification: Additional Tabs on L0 Spaces

**Feature Branch**: `story/9857-adding-an-additional-space-tab`
**Created**: 2026-06-22
**Status**: Draft
**Input**: GitHub story alkem-io/client-web#9857 — "Adding an additional Space tab" (epic alkem-io/alkemio#1930)

## User Scenarios & Testing *(mandatory)*

A top-level ("L0") Space today exposes a **fixed set of four tabs** (Dashboard, Community, Subspaces, Knowledge Base). Subspaces (L1/L2) already let a Space admin add, rename, reorder, hide, and delete tabs ("phases" of the innovation flow) from the **Settings → Layout** screen. This feature brings that same tab-management capability to L0 Spaces — admins can add tabs beyond the fixed four (for a second knowledge base, an archive, a brainstorm board, etc.) and delete the ones they added — while keeping the four built-in tabs permanently protected.

The behaviour deliberately mirrors the existing Subspace logic; the term shown to L0 users is **"tab"** rather than **"phase"**.

### User Story 1 - Add an additional tab to an L0 Space (Priority: P1)

A Space admin opens **Settings → Layout** for their top-level Space and adds a new tab (e.g. "Archive"). The new tab appears both in the Layout editor and in the Space's main tab bar, after the four built-in tabs, and members can navigate to it and place posts in it.

**Why this priority**: This is the core capability the story and epic exist to deliver — L0 admins gaining the additional-tab control that already exists for subspaces. Without it the feature delivers nothing.

**Independent Test**: On an L0 Space as an admin, open Settings → Layout, click "Add tab", supply a name, and confirm a new tab appears in the Layout editor and in the Space's tab navigation, reachable by members.

**Acceptance Scenarios**:

1. **Given** an L0 Space with the four built-in tabs and an admin viewing Settings → Layout, **When** the admin adds a tab named "Archive", **Then** a fifth tab "Archive" is created on the Space's innovation flow and appears at the end of the Layout editor columns.
2. **Given** the admin has just added "Archive", **When** they navigate to the Space's main tab bar, **Then** "Archive" appears after the four built-in tabs and opens its (initially empty) content area.
3. **Given** an L0 Space already at the maximum allowed number of tabs, **When** the admin views Settings → Layout, **Then** the "Add tab" affordance is disabled (or hidden) and no further tab can be added.
4. **Given** an admin adds a tab, **When** the create request is in flight, **Then** the Add affordance is disabled until it resolves, preventing a duplicate concurrent create.

---

### User Story 2 - Delete an admin-added tab from an L0 Space (Priority: P1)

A Space admin deletes a tab they previously added. Any posts that were in the deleted tab are not lost — they move to the **first** tab. The four built-in tabs can never be deleted.

**Why this priority**: Add without delete is an incomplete, one-way capability that traps admins with tabs they no longer want; the story lists both add and delete as must-have, and the "first 4 protected" guard is the central safety rule of the epic.

**Independent Test**: On an L0 Space as an admin, add a tab, place a post in it, then delete the tab; confirm the tab disappears, the post now lives in the first tab, and the kebab menu offers no Delete option on any of the four built-in tabs.

**Acceptance Scenarios**:

1. **Given** an L0 Space with an admin-added tab "Archive" containing one post, **When** the admin deletes "Archive" and confirms, **Then** "Archive" is removed from the Layout editor and the Space tab bar.
2. **Given** "Archive" contained a post when deleted, **When** the deletion completes, **Then** that post is reassigned to the first tab and remains accessible (no content is lost).
3. **Given** an L0 Space, **When** the admin opens the per-tab kebab menu on any of the **first four** tabs (Dashboard, Community, Subspaces, Knowledge Base), **Then** no "Delete" action is offered for those tabs.
4. **Given** an L0 Space, **When** the admin opens the per-tab kebab menu on an admin-added tab (the 5th or later), **Then** a "Delete" action is offered, gated behind a confirmation dialog.
5. **Given** an admin confirms deletion of the currently-active tab, **When** the deletion proceeds, **Then** the active tab advances to an adjacent surviving tab first so the delete is accepted, mirroring the existing subspace delete behaviour.

---

### User Story 3 - Manage additional L0 tabs consistently with subspaces (Priority: P2)

The other tab-management affordances already available on subspaces — renaming a tab, editing its description, toggling its member-facing visibility, and (where applicable) reordering — behave the same way on L0 additional tabs, and Space templates capture all tabs (built-in plus additional) so a templated Space reproduces them.

**Why this priority**: The story explicitly asks to "follow the same logic as Subspaces" and that "Templates: include all tabs". This consistency is required for the feature to feel complete, but the add/delete core (P1) already delivers the headline value, so this is P2.

**Independent Test**: On an L0 Space, rename and hide an admin-added tab and confirm both behave as they do on a subspace; then save the Space as a template and confirm the additional tabs are present in the template content.

**Acceptance Scenarios**:

1. **Given** an admin-added L0 tab, **When** the admin renames it or edits its description, **Then** the change persists and the tab bar reflects the new name, identical to subspace behaviour.
2. **Given** an admin-added L0 tab, **When** the admin toggles its visibility off, **Then** it is hidden from members in the tab bar while remaining reachable by admins, identical to subspace behaviour.
3. **Given** an L0 Space with additional tabs, **When** the Space is saved as a template, **Then** the template content includes every tab (the four built-in plus all additional tabs).
4. **Given** the four built-in L0 tabs, **When** an admin manages tabs, **Then** built-in tabs may be renamed/hidden where that already exists, but never deleted, and reordering must not move an admin-added tab ahead of the four built-in tabs.

---

### Edge Cases

- **At the minimum number of tabs**: an L0 Space with only the four built-in tabs offers no Delete on any tab (all four are protected) — the minimum and the "first four protected" rule coincide for a fresh Space.
- **At the maximum number of tabs**: the Add affordance is disabled/hidden; the limit value comes from the innovation-flow settings, identical to the subspace cap.
- **Deleting the active tab**: the active state is advanced to an adjacent surviving tab before the delete request, so the backend does not reject deleting the current state (existing subspace behaviour, reused unchanged).
- **Posts in a deleted tab**: reassigned to the first tab; never orphaned or destroyed.
- **Concurrent structural mutation**: while a create/delete is in flight, further structural actions are disabled to avoid racing two changes against the same flow.
- **Non-admin viewer**: a member without the manage privilege sees the tabs but no add/delete/rename affordances — gating is by the same authorization privilege used for subspace tab management.
- **L1/L2 Spaces unchanged**: subspace tab management behaviour must be byte-for-byte unchanged — no regression in how phases are added/deleted/reordered on subspaces.
- **Reordering boundary**: an admin-added tab must not be reorderable to a position before the fourth built-in tab; the four built-in tabs keep their leading positions and indices.
- **Previously-broken create**: the story reports the existing "add one tab to a space" path no longer works on L0; the feature must result in a working create path for L0 (root-caused, not patched over).

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST allow a Space admin to add one or more additional tabs to a top-level (L0) Space, beyond the four built-in tabs, from the Settings → Layout screen.
- **FR-002**: The system MUST present and persist additional L0 tabs using the same underlying tab/phase mechanism that subspaces use, so a tab added on L0 behaves like a phase added on a subspace (name, description, default post template, visibility, ordering after the built-in four).
- **FR-003**: The system MUST label the tab-management affordances on L0 with the user-facing term **"tab"** (not "phase").
- **FR-004**: The system MUST enforce the same numeric limit on the number of tabs for an L0 Space as is enforced for subspaces (driven by the innovation-flow settings' maximum), and MUST **disable** (not hide) the Add affordance at the limit, matching the existing subspace behaviour.
- **FR-005**: The system MUST allow a Space admin to delete an admin-added L0 tab (the 5th tab onward) from the Layout editor's per-tab menu.
- **FR-006**: The system MUST prevent deletion of the **first four** L0 tabs — identified by position (the first four states by sort order, indices 0–3) — under all circumstances: no Delete affordance is offered for them and no delete request is issued for them.
- **FR-007**: When an L0 tab is deleted, the system MUST reassign any posts in that tab to the **first** tab, so no post content is lost (mirrors the subspace delete-phase behaviour).
- **FR-008**: When the tab being deleted is the currently-active tab, the system MUST first advance the active tab to an adjacent surviving tab before issuing the delete, so the backend accepts the deletion (reuses existing subspace behaviour).
- **FR-009**: The system MUST require an explicit confirmation before deleting an L0 tab, consistent with the design-system rule that all destructive actions are confirmed.
- **FR-010**: The system MUST gate all L0 add/delete/rename/visibility tab affordances behind the same admin authorization privilege used for subspace tab management; non-admins see tabs but no management affordances.
- **FR-011**: A newly added L0 tab MUST appear in the Space's main tab navigation (after the four built-in tabs) and be navigable, with its own (initially empty) content area, consistent with how admin-added custom tabs already render at index ≥ 4.
- **FR-012**: The system MUST keep rename, description-edit, and visibility-toggle behaviour for L0 tabs identical to the equivalent subspace behaviour.
- **FR-013**: Space templates MUST capture all L0 tabs — the four built-in tabs plus every additional tab — so a Space created from the template reproduces them.
- **FR-014**: The system MUST disable further structural tab actions (add/delete) on an L0 Space while a create or delete request for that Space's flow is in flight.
- **FR-015**: The system MUST NOT change tab behaviour on L1 or L2 (subspace) Spaces in any way; existing subspace phase add/delete/reorder/rename/hide behaviour is preserved exactly.
- **FR-016**: Column drag-reorder of tabs is **not enabled** on L0 in this slice (out of scope); the L0 tab order remains the four built-in tabs followed by additional tabs in creation order. Should reorder be enabled in a future slice, it MUST NOT permit moving an admin-added tab ahead of the four built-in tabs, nor reordering the built-in four out of their canonical leading positions.
- **FR-017**: The L0 add-tab path MUST be functional (root-caused fix of the reported "no longer works" defect, if the defect is reproduced in the client), producing a persisted, navigable tab.
- **FR-018**: If a structural tab mutation (create/delete) on an L0 Space fails server-side, the system MUST surface the failure through the existing Layout-editor structure/save error path; no bespoke L0-only error UI is introduced, and the editor must recover to a consistent state.

### Key Entities *(include if feature involves data)*

- **Space**: A top-level (L0) Space owns an innovation flow whose states render as the Space's tabs. The first four states are the built-in tabs; states beyond the fourth are admin-added additional tabs. L1/L2 Spaces (subspaces) own equivalent flows whose states render as phases — out of scope for change.
- **Tab (innovation-flow state)**: A single tab on a Space. Attributes a user perceives: name (display name), description, member-facing visibility, default post template, and position. On L0 the first four are protected built-ins; the rest are deletable additional tabs. Each tab can hold posts.
- **Post (callout)**: User-authored content placed within a tab. On tab deletion, posts move to the first tab. Posts are unchanged by this feature except for the move-on-delete behaviour.
- **Space Template**: A reusable capture of a Space's structure, including all of its tabs and their contents, used to create new Spaces.
- **Tab limits**: The minimum and maximum number of tabs permitted on a Space, supplied by the innovation-flow settings; for L0 the effective floor is the four protected built-ins.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Space admin can add an additional tab to an L0 Space and see it in the Space's tab navigation within a single Settings → Layout interaction, with no page reload required.
- **SC-002**: 100% of attempts to delete any of the four built-in L0 tabs are prevented — the Delete affordance is never present on those tabs.
- **SC-003**: After deleting an admin-added L0 tab that contained posts, 100% of those posts remain accessible, relocated to the first tab (zero post loss).
- **SC-004**: Adding tabs on an L0 Space is blocked once the Space reaches the same maximum tab count enforced on subspaces (no L0 Space can exceed the configured maximum).
- **SC-005**: Subspace (L1/L2) tab/phase management shows zero behavioural change — existing subspace tab tests continue to pass unchanged.
- **SC-006**: A Space created from a template of an L0 Space that had additional tabs reproduces every additional tab.
- **SC-007**: A non-admin viewing an L0 Space sees its tabs but is offered no add, delete, rename, or visibility affordance.

## Clarifications

### Session 2026-06-22

- Q: How does the client identify the four protected built-in L0 tabs — by position or by a server-provided flag? → A: By position — the first four tabs by sort order (indices 0–3) are the protected built-ins; tabs at index ≥ 4 are deletable additional tabs. This matches the existing client convention that renders custom L0 tabs at index ≥ 4, and the server enforces protection authoritatively.
- Q: When an L0 Space is at the maximum tab count, is the "Add tab" affordance hidden or disabled? → A: Disabled (greyed out, not removed), matching the existing subspace `canAddPhase` behaviour, so the admin sees the control and understands it is capped.
- Q: Does this slice enable column drag-reorder of tabs on L0, or only add/delete? → A: Only add/delete (plus the already-present rename/description/visibility). Column drag-reorder stays disabled on L0 in this slice; the story scope is add/delete + protecting the first four, and enabling reorder would add a "can't move ahead of the built-in four" DnD constraint that is out of scope. FR-016 therefore constrains any future reorder but no reorder is shipped here.
- Q: What user-facing term and labels appear for the management affordances on L0? → A: "tab" — the L0 Layout editor shows "Add tab" / "Delete tab" (and a tab-worded confirmation), distinct from the subspace "phase" wording, via level-aware i18n keys in the relevant CRD namespace.
- Q: If the server rejects a delete (e.g. a race on a protected tab) despite the client not offering it, how is it handled? → A: The client never surfaces Delete on the first four, so the only path to a rejection is a race; in that case the existing mutation-error surface (the Layout editor's save/structure error handling) reports it — no new bespoke error UI.

## Assumptions

- **A-001**: "Tab" on an L0 Space maps to an **innovation-flow state** — the same entity that renders as a "phase" on a subspace. The four built-in L0 tabs (Dashboard, Community, Subspaces, Knowledge Base) correspond to the first four states (indices 0–3); additional tabs are states at index ≥ 4. This is consistent with the existing client rendering of custom L0 tabs at index ≥ 4.
- **A-002**: The numeric tab limits (minimum/maximum) come from the existing innovation-flow settings already surfaced to the Layout editor; this feature does not introduce a new, L0-specific limit beyond the structural "first four are protected" rule.
- **A-003**: The server slice (guards reworking L0 tabs to behave like L1/L2, and the create/delete mutations) is delivered by the sibling story alkem-io/server#6177; this client story consumes those server capabilities. Where the client currently disables L0 add/delete purely on the client side, this story removes those client-side gates and replaces them with the "first four protected" rule, relying on the server for authoritative enforcement.
- **A-004**: The "create one additional tab" mutation referenced as "no longer works" resolves, on the client, to the generic create-state-on-innovation-flow path already used by the Layout editor; the fix is to enable that path on L0 with the protective guard, not to introduce a separate L0-only mutation.
- **A-005**: The user-facing strings for the L0 tab affordances live in the appropriate CRD per-feature i18n namespace, added across all six supported languages (en, nl, es, bg, de, fr) in this same change, with the platform glossary respected (e.g. "Post"/"Posts", "template" kept per the Dutch glossary rules).
- **A-006**: No new design-system primitive is required; the existing `SpaceSettingsLayoutView`, `AddPhaseDialog`, per-column kebab menu, and `ConfirmationDialog` are reused, parameterised by space level and a per-tab "deletable" flag.

## Dependencies

- **D-001**: Server story alkem-io/server#6177 — backend guards and mutations for L0 additional tabs (epic alkem-io/alkemio#1930). The client behaviour assumes the server permits create/delete of states on an L0 flow with the first four protected.
- **D-002**: Existing CRD Layout-management surface (`Settings → Layout`) and its data hooks, which already implement add/delete/rename/hide/reorder for subspaces.
