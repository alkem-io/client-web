# Feature Specification: CRD Space Settings Page

**Feature Branch**: `045-crd-space-settings`
**Created**: 2026-04-14
**Status**: Draft
**Input**: Migrate the Space Settings area (About, Layout, Community, Subspaces, Templates, Storage, Settings, Account tabs) from the current MUI implementation to the CRD design system (shadcn/ui + Tailwind), following the prototype reference at `prototype/src/app/components/space/SpaceSettings*.tsx`. Related sibling effort: `042-crd-space-page` — the CRD Space Page delivers the space hero (banner / title / tagline / member avatars) and the space-level visual language that this settings area reuses verbatim.

## Clarifications

### Session 2026-04-15

- Q: When CRD is enabled but not every tab has been migrated yet, what should a not-yet-migrated tab show? → A: All 8 tabs ship together in a single release — no progressive rollout and no mixed-shell fallback.
- Q: What happens when the admin switches to another tab while the current tab has unsaved changes? → A: The tab switch is blocked by a CRD confirmation dialog. Only one tab is ever dirty at a time.
- Q: Who can see the Account tab (plan, entitlements)? → A: Visibility mirrors the current MUI Space Admin Account page exactly. No new role gates.
- Q: What is the keyboard alternative to drag-and-drop on the Layout tab? → A: Each movable item's drag handle is focusable. Space/Enter activates grab mode, Arrow Up/Down reorders within the column, Arrow Left/Right moves across columns, Enter drops, Escape cancels. Announced via ARIA live region.

### Session 2026-04-15 — second round

- Q: Are all 8 tabs equally important? → A: Yes — all 8 are P1 and receive separate, equally structured user stories.
- Q: Tab order and labels in the strip? → A: About → Layout → Community → Subspaces → Templates → Storage → Settings → Account, each with the icon shown in the prototype header screenshot.
- Q: What are the movable items on the Layout tab? → A: **Callouts / posts** created by users — never "pages". Items can only be moved between columns; they cannot be created, deleted, or added from the Layout tab.
- Q: How does the Layout tab save? → A: Local dirty buffer with a Save Changes / Reset bar. "Reset" reverts to the last backend-known state and clears all local unsaved changes. "Save Changes" commits the buffer. Individual drags do not auto-save.
- Q: Post title and description editing on Layout? → A: **Post titles and descriptions are NOT editable from Settings → Layout.** Only the **column** (the space's innovation-flow step / space-level tab — Home / Community / Subspaces / Knowledge) has an inline-editable title and description. Individual callouts are moved / viewed / removed-from-tab only; to edit a post's own title or description the admin opens the post itself from where it lives.
- Q: Per-**column** "active phase" and "default post template" actions? → A: These are **per-column (innovation-flow step)** actions, NOT per-callout. They live in a three-dot overflow menu at the top-right of each column header card. The menu is visible in the UI (not deferred).
- Q: What is in the visible per-callout kebab menu on the Layout tab? → A: The prototype specifies exactly three entries: **Move to** (submenu listing the other three columns — Community / Subspaces / Knowledge, or whichever three are not the current column), **View Post** (navigate to that callout's page), and **Remove from Tab** (unassign the callout from the current column — the callout itself is NOT deleted, it simply becomes unassigned from this tabset). The two deferred actions (Active phase, Default post template) are separate and not surfaced.
- Q: About tab — Save / Reset bar or autosave? → A: **Per-field autosave**, NO Save button, NO Reset button. After 2 seconds of idle on any field, the mutation fires for that field. A spinner renders next to the field label while the mutation is in flight. On success a grayed-out "Saved!" indicator appears next to the field label. File uploads (avatar / banners / visuals) autosave immediately — the file-select is the explicit commit. Navigating away inside the debounce window flushes the pending save immediately. Only the Layout tab uses a Save Changes / Reset bar — About does not.
- Q: Layout column header contents? → A: Inline-editable **title**, inline-editable **description**, and a top-right **three-dot overflow menu** with "Active phase" + "Default post template". No icon, no callout-count badge, no collapse / expand arrow.
- Q: Inline-edit affordance for fields not already wrapped in a visible input? → A: The value renders as plain text by default. On hover it gains a subtle underline and a small pencil icon appears trailing the text; clicking either enters edit mode. Same pattern across every inline-editable field (Layout column title, Layout column description, any About-tab text values rendered without a visible input wrapper).
- Q: Account tab scope? → A: **Parity-only restyle.** Same fields, same actions, same permissions as the current MUI `SpaceAdminAccount` page. No new affordances (no URL Copy button, no progress bars, no badges). Only the visual design changes to CRD.
- Q: Preview card used on About? → A: The same reusable CRD space-card component that the future CRD Explore Spaces page will use. This feature ships that component once so About and Explore consume the same source of truth.
- Q: Post description display (collapse) toggle? → A: Bring it back to the Layout tab (it lives under Settings in the current MUI UI); reuse the existing `calloutDescriptionDisplayMode` setting and `updateSpaceSettings` mutation.
- Q: Community tab structure? → A: One users table at the top (paginated, ~10 rows visible). Organizations and Virtual Contributors each live in their own collapsible section; when expanded, each renders its own table (~5 rows visible) with the same row template as the users table.
- Q: Subspaces kebab menu? → A: Keep the current MUI menu exactly as it is — Pin/Unpin (alphabetical mode only), Save as Template, Delete. Do NOT add "Edit Details" or "Archive" in this iteration (designer review pending).
- Q: Subspace reorder? → A: Drop it for this iteration — the user does not see it in the current UI and does not want it invented.
- Q: Subspaces tab additions from the prototype? → A: Add search, filter-by-archived, Grid/List view toggle, and the Default Subspace Template selector. Clicking a subspace title navigates to that subspace (same as today).
- Q: Storage tab scope? → A: Keep the current UX verbatim (hierarchical document tree with size / uploader / date, delete action) and restyle it with CRD primitives. The prototype's info-card-only view is a regression and is NOT adopted.
- Q: Settings tab? → A: Keep every current MUI toggle; adopt the prototype's unified layout and Danger Zone card with confirmation dialog for space deletion.
- Q: Account tab? → A: Keep every current field, action, and permission. Add the prototype additions (URL copy field, entitlement usage progress, Visibility Status badge, Host card, support contact footer). There is no "Change Host" CTA today — a support-contact message appears instead; preserve that.

## User Scenarios & Testing

**All eight tabs are P1 and ship together in a single release (FR-018 / FR-050).** The priority label exists only for traceability; the user stories below are equally important and each is independently testable within its own tab.

### User Story 1 - About tab (Priority: P1)

A space admin opens Space Settings on the About tab (the default landing tab) and sees the CRD space hero at the top of the page — the same hero shown on the public Space page (banner, name, tagline, member avatars). Below the hero, a horizontal icon tab strip lists all 8 tabs in this order: **About, Layout, Community, Subspaces, Templates, Storage, Settings, Account**. The About tab is the only one marked active.

The About tab body presents every field from the current MUI About page plus the prototype additions. Each field (or obviously-paired pair of fields — e.g. country + city, email + pronouns) is rendered in its own CRD card. The full set of About fields is: **name**, **tagline**, **avatar**, **page banner**, **card banner**, **visuals gallery**, **country + city** (location), **email**, **pronouns**, **What**, **Why**, **Who**, **tags**, **references & links**. A live **Preview card** on the right shows how the space will appear as a space card in Explore Spaces and updates as the admin edits. The Preview MUST use the **same reusable CRD space-card component that the Explore Spaces page will use** (banner image, space avatar overlaid on the banner, public/private badge, name, tagline/description, tags, LEADS avatars, member count with icon — matching the design shown in the prototype). That component is built once in this feature and re-used later when the CRD Explore Spaces page adopts it; About is the first consumer. No umbrella section grouping (such as "Identity", "Branding", "Contact") is imposed — cards are flat and match what the current MUI / prototype already exposes.

**About has NO Save Changes button and NO Reset button.** The tab autosaves per field. After the admin stops editing a field for **2 seconds**, the mutation fires automatically. Feedback is rendered next to the field's label:

- While the mutation is in flight → a small loading spinner replaces the field label's status icon.
- After the mutation succeeds → a grayed-out "Saved!" text appears next to the field label for exactly **2 seconds**, then returns to idle.
- If the mutation fails → an inline error message is rendered next to the field label and remains until the admin edits the field again (the next `onChange` restarts the autosave cycle). There is no automatic retry.

There is no tab-wide dirty state on About: every edit is its own autonomous save. Switching tabs or navigating away does not lose data — any debounce window still open is flushed immediately (the pending mutation fires right away, not after 2 seconds, when the admin leaves the tab).

**Independent Test**: Toggle CRD on, open Space Settings, verify the CRD hero and the 8-tab strip in the correct order. Edit the space name — wait — observe the spinner next to the Name label, then "Saved!" within a couple of seconds. Edit the What field — same behavior. Upload a new avatar — autosave fires as soon as the upload completes (no 2s debounce on file upload). Reload — every change persists. Confirm there is no Save Changes or Reset button anywhere on the About tab.

**Acceptance Scenarios**:

1. **Given** an admin opens Space Settings with CRD enabled, **When** the page loads, **Then** the CRD space hero renders at the top and the tab strip shows About / Layout / Community / Subspaces / Templates / Storage / Settings / Account with About active.
2. **Given** the admin edits any About text field, **When** they stop typing, **Then** after a 2-second debounce the autosave mutation fires for that field; a spinner renders next to the field label while the mutation is in flight.
3. **Given** the autosave mutation for a field succeeds, **When** it returns, **Then** the spinner is replaced by a grayed-out "Saved!" indicator next to the field label for exactly 2 seconds, after which the indicator returns to idle; the Preview card reflects the new value.
4. **Given** the autosave mutation for a field fails, **When** it errors, **Then** an inline error indicator replaces the spinner next to the field label with the reason; the admin can retry by editing the field again.
5. **Given** the admin uploads a new avatar / page banner / card banner / visual, **When** the upload completes, **Then** the autosave fires immediately (file uploads are not debounced — the act of selecting a file is the explicit commit).
6. **Given** the admin edits a field and then switches to another tab within the 2-second debounce window, **When** they switch tabs, **Then** the pending autosave flushes immediately (fires now, does not wait for the 2s timer).
7. **Given** the admin views the About tab, **When** they look for Save Changes or Reset buttons, **Then** NONE exist — About never shows a tab-wide action bar.
8. **Given** the admin opens a direct URL to the About tab, **When** the page loads, **Then** the About tab is active.
9. **Given** CRD is disabled via the localStorage toggle, **When** the admin opens Space Settings, **Then** the current MUI Space Settings page renders unchanged.

---

### User Story 2 - Layout tab (Priority: P1)

A space admin opens the Layout tab to organize the space's **callouts / posts** (created by members) across the four space-level tabs that visitors see on the public Space page: **Home**, **Community**, **Subspaces**, **Knowledge**. The tab presents these four as column cards placed side-by-side on desktop and stacked on narrow viewports.

Each column card header shows exactly two pieces of content: an **inline-editable title** and an **inline-editable description** (the column represents the space's innovation-flow step / space-level tab). The header has **no icon**, **no callout-count badge**, and **no collapse / expand affordance**. In the top-right of the header sits a **three-dot overflow menu** that opens the column's action menu — see FR-010. Below the header, the callouts currently assigned to that space tab are listed with grab handles for drag-reorder (within a column) and drag-move (between columns). System / built-in entries in a column are pinned — shown with a lock indicator and not draggable.

**Inline-edit hover pattern** (applies to every inline-editable field across Space Settings — Layout column title, Layout column description, any About-tab value rendered without a visible input wrapper): the value renders as plain text by default; on hover, the text gains a subtle **underline** and a **small pencil icon** appears trailing the text; clicking either the text or the pencil enters edit mode. The pattern matches the prototype's Home-tab title affordance and must be identical across all inline-editable fields in CRD Space Settings.

Individual callouts are **not** inline-edited from the Layout tab. Their title is rendered read-only as it is in the current MUI implementation; editing a post's own text happens wherever the post normally lives (post page / callout editor). The Layout tab's per-callout actions are limited to move, view, and remove-from-tab (FR-007).

Moving or marking callouts never triggers a mutation directly. Every change is buffered locally. A sticky Save Changes / Reset action bar at the bottom-right appears when the buffer is dirty. **Save Changes** commits all pending column renames + descriptions, callout moves, pending removals, and the display-mode toggle to the backend in one go. **Reset** reverts the entire buffer to the last known backend state, discarding unsaved changes.

Each callout row also exposes a three-dot **per-callout menu** with exactly three entries: **Move to** (submenu with the other three columns — equivalent to drag-and-drop but keyboard-first and without needing to target a drop zone), **View Post** (navigates to that callout's page — if the Layout tab is dirty, the existing discard-confirm dialog blocks the navigation per FR-026), and **Remove from Tab** (marks the callout for removal from the current column). Move to and Remove from Tab are buffered like any other layout change; View Post is immediate navigation.

**Zero-mutations-until-Save invariant.** No drag, keyboard move, inline rename, column rename, Move-to, Remove-from-Tab, or display-mode toggle fires any GraphQL mutation or deletion query before the admin clicks Save Changes. Every change lives in the local buffer only. If the admin clicks Reset, closes the browser tab, refreshes, navigates away (and picks "Discard & leave" in the confirm dialog), or loses their network — nothing at all has happened on the server. The post is still in its original column with its original title, description, and tabset assignment. "Remove from Tab" in particular does NOT delete the callout and does NOT issue any call until Save Changes commits it — at which point it fires an unassignment against the existing tabset-assignment / callouts-set membership mutation.

**Pending-removal visual state.** A callout row marked via Remove from Tab remains visible inside its current column until Save Changes or Reset. It is rendered with a distinct pending-removal visual treatment (reduced opacity + strikethrough on the title) and exposes an **Undo removal** affordance in place of the kebab's Remove entry so the admin can retract the removal before saving. This keeps the intermediate state legible and reversible.

The Layout tab also includes a **Post description display** toggle (collapsed / expanded). This setting already exists in the current MUI implementation under Settings → Collaboration (via `calloutDescriptionDisplayMode`); in CRD it moves back to the Layout tab because it controls how callouts render.

- **Expanded** (`calloutDescriptionDisplayMode = EXPANDED`) — the callout's full description renders in place on the Space page.
- **Collapsed** (`calloutDescriptionDisplayMode = COLLAPSED`) — the description is truncated (first ~3 lines) with a "Read more" link that expands it inline on click.

The toggle on Layout is a single switch labeled "Collapse post descriptions by default. When enabled, descriptions show a 'Read more' link instead of the full text." — same copy as the current MUI implementation.

**Per-column overflow menu** — each column header's top-right three-dot button opens a dropdown with the same actions the current MUI Layout page exposes per innovation-flow step: **Active phase** (pick the phase this column / step represents) and **Default post template** (pick the default template used when a new callout is created in this column). These are column-level (innovation-flow-step-level) concerns, not per-callout.

The Layout tab never allows creating new callouts, deleting callouts, editing a callout's title or description, or adding posts. Callouts are created, deleted, and textually edited elsewhere (existing product flows); the Layout tab's per-callout actions are limited to **move**, **view**, and **remove-from-tab**.

**Independent Test**: Open Layout, drag a callout from Home to Community. Do not save. Confirm the action bar shows dirty state. Click Reset — the callout returns to Home. Drag again, rename a column title inline, mark a callout for removal via the kebab (the row stays visible with pending-removal styling), toggle Post description display, click Save Changes. Reload — every change persists and the removed callout is now unassigned.

**Acceptance Scenarios**:

1. **Given** the admin opens the Layout tab, **When** the page renders, **Then** four columns (Home / Community / Subspaces / Knowledge) are shown, each with an inline-editable title, an inline-editable description, a top-right three-dot overflow menu, and the list of assigned callouts below — no icon, no callout-count badge, no collapse arrow in the column header.
2. **Given** the admin drags a callout within a column, **When** they drop it, **Then** the new position is held in the local buffer and the action bar appears.
3. **Given** the admin drags a callout across columns, **When** they drop it on a valid target, **Then** the callout moves in the local buffer and the action bar appears.
4. **Given** the admin views a callout row, **When** they look for an inline-edit affordance on the post's title or description, **Then** NONE is present — post title and description are rendered read-only on the Layout tab (editing happens from the post's own page).
5. **Given** the admin inline-edits a column's title or description, **When** they confirm, **Then** the edit is held in the local buffer and the action bar appears.
6. **Given** the admin toggles the Post description display setting, **When** they toggle, **Then** the change is held in the local buffer and the action bar appears.
7. **Given** the admin clicks Save Changes, **When** the mutations succeed, **Then** all buffered changes persist in a single logical commit and the action bar disappears.
8. **Given** the admin clicks Reset, **When** confirmed, **Then** the entire buffer is discarded and the UI reverts to the last known backend state.
9. **Given** the admin tries to drag a pinned system entry, **When** they interact with the grab handle, **Then** the handle is disabled and an inline explanation states the entry is pinned.
10. **Given** the admin uses keyboard only, **When** they tab to a movable callout's grab handle and press Space, **Then** grab mode activates and Arrow Up/Down reorders within the column, Arrow Left/Right moves across columns, Enter commits, Escape cancels. Every transition is announced to assistive technology.
11. **Given** the admin opens any callout's per-callout menu, **When** the menu renders, **Then** it shows exactly three entries — **Move to** (submenu listing the other three columns), **View Post**, and **Remove from Tab** — and nothing else.
12. **Given** the admin clicks **Move to → Community** (or any other target column) from a callout in Home, **When** they click, **Then** the callout is moved to the chosen column in the local buffer and the action bar appears. The current column is absent from the submenu.
13. **Given** the admin clicks **Remove from Tab**, **When** they click, **Then** the callout row STAYS visible in the current column rendered with the pending-removal visual state (reduced opacity + strikethrough / badge), an **Undo removal** affordance replaces the Remove entry in its kebab, and the action bar appears. NO mutation fires yet.
13a. **Given** a callout has been marked for removal but not yet saved, **When** the admin clicks Undo removal, **Then** the row reverts to its normal visual state, the kebab restores the Remove from Tab entry, and the action bar clears only if no other changes remain in the buffer.
13b. **Given** a callout has been marked for removal but not yet saved, **When** the admin clicks Reset, **Then** the row reverts to its original state (no mutation fired). **Given** the admin clicks Save Changes, **Then** the unassignment mutation fires once and the row is removed from the list on re-query.
14. **Given** the admin clicks **View Post**, **When** they click and the Layout tab is clean, **Then** the app navigates to the post's page immediately; **When** the Layout tab is dirty, **Then** the discard-confirm dialog blocks the navigation (FR-026).
15. **Given** the admin hovers any column header, **When** they look at the top-right of the header, **Then** a three-dot overflow button is visible; clicking it opens a dropdown with exactly two entries — **Active phase** and **Default post template** — and selecting either fires the corresponding existing space-admin mutation for that column.
16. **Given** the admin views any column header, **When** the page renders, **Then** the header shows only the inline-editable title, the inline-editable description, and the top-right three-dot menu — NO icon, NO callout-count badge, and NO collapse / expand arrow.

---

### User Story 3 - Community tab (Priority: P1)

A space admin opens the Community tab to manage who is in the community. The tab renders **three tables** in total:

- A **main members (users) table** at the top of the tab, always visible, with ~10 rows per page. Columns: name (avatar + name + email), role (Host / Admin / Lead / Member), joined date, status (Active / Pending / Invited), actions. Above the table: search, role filter, status filter, and an Invite button. Each row's kebab menu exposes: View Profile, Change Role, Resend / Revoke (for Invited), Approve / Reject (for Pending — plus inline approve/reject icons), and Remove from Space.
- An **Organizations** collapsible section (collapsed by default) that, when expanded, renders its own table (~5 rows visible) with the same row structure scoped to member organizations (add / remove, role assignment, automatic-access toggle per the current MUI behavior).
- A **Virtual Contributors** collapsible section (collapsed by default) that, when expanded, renders its own table (~5 rows visible) with the same row structure scoped to virtual contributor accounts (add / edit / delete / active toggle).

In addition, two further collapsible cards sit alongside the tables: an **Application Form** card (edit the questions members must answer) and a **Community Guidelines** card (edit or save-as-template the guidelines text).

All mutations fire immediately on action confirmation (there is no tab-wide Save/Reset bar on Community); destructive actions are preceded by a CRD confirmation dialog.

**Independent Test**: Open Community, search for a member, change their role, remove another member (confirm dialog). Expand Organizations — a table appears with 5 visible rows — remove an org. Expand Virtual Contributors — another table appears — add a new VC. Edit the Application Form questions and save.

**Acceptance Scenarios**:

1. **Given** the admin opens the Community tab, **When** it renders, **Then** the users table is visible at the top and the Organizations / Virtual Contributors / Application Form / Community Guidelines cards are collapsed.
2. **Given** the users table has more than 10 rows, **When** the admin paginates, **Then** the next page loads with the same sort / search / filter state preserved.
3. **Given** the admin expands Organizations, **When** the section opens, **Then** a dedicated organizations table with ~5 visible rows renders with add / remove / role-assignment affordances.
4. **Given** the admin expands Virtual Contributors, **When** the section opens, **Then** a dedicated VC table with ~5 visible rows renders with add / edit / delete / active-toggle affordances.
5. **Given** the admin removes a member / organization / VC, **When** they confirm the CRD confirmation dialog, **Then** the mutation fires and the list refreshes.
6. **Given** the admin edits the Application Form, **When** they save, **Then** the updated questions persist.
7. **Given** the admin edits and saves-as-template the Community Guidelines, **When** they confirm, **Then** the guidelines update and a new template is created using existing template mutations.

---

### User Story 4 - Subspaces tab (Priority: P1)

A space admin opens the Subspaces tab to browse and manage the space's child subspaces. The tab preserves every capability the current MUI Subspaces page offers and adds a few prototype-driven filters and view options.

**Retained from the current MUI Subspaces page**:

- **Default Subspace Template** selector (with preview of innovation flow and callouts) — changeable via `updateTemplateDefault`.
- **Create Subspace** button (existing `createSubspace` flow, possibly a CRD-styled dialog reusing the existing creation form).
- **Subspace list / grid** of child subspaces.
- **Per-subspace kebab menu** (unchanged from the current MUI menu): **Pin / Unpin** (shown in alphabetical sort mode only), **Save as Template**, **Delete**. **"Edit Details" and "Archive" are explicitly out of scope** in this iteration pending designer review.
- Delete is preceded by a CRD confirmation dialog.

**Added from the prototype**:

- **Search** input that filters the visible subspaces by name.
- **Filter** dropdown: All / Active / Archived (the Archived state is represented by `SpaceVisibility.Archived` — already present on the schema).
- **View toggle**: Grid / List.
- Clicking a subspace's title navigates to that subspace (same behavior as today — delegated to the existing subspace route).

**Explicitly not included**:

- Reordering / drag-sort is NOT in scope (not in the current UI as the admin-user experiences it).
- The prototype's kebab "View" entry is dropped — redundant with title-click.
- The prototype's "Edit Details" and "Archive" kebab entries are NOT implemented — will be revisited after designer review.

**Independent Test**: Open Subspaces. Confirm the Default Subspace Template selector is present. Create a new subspace via the existing creation flow. Switch to alphabetical sort and pin a subspace via the kebab menu. Save a subspace as a template. Delete a subspace (confirm dialog). Search for a subspace by name. Filter to Archived — archived subspaces appear. Toggle Grid / List view. Click a subspace title — navigation goes to the subspace.

**Acceptance Scenarios**:

1. **Given** the admin opens the Subspaces tab, **When** it renders, **Then** the Default Subspace Template selector, the subspace list, and a Create Subspace CTA are visible.
2. **Given** the admin clicks Create Subspace, **When** the existing creation flow completes, **Then** the new subspace appears in the list.
3. **Given** alphabetical sort mode is active, **When** the admin opens a subspace's kebab and clicks Pin, **Then** the subspace is pinned (current `updateSubspacePinned` mutation).
4. **Given** the admin opens a subspace's kebab and clicks Save as Template, **When** the flow completes, **Then** a new space template is created.
5. **Given** the admin opens a subspace's kebab and clicks Delete, **When** they confirm the CRD confirmation dialog, **Then** the subspace is deleted.
6. **Given** the admin types in the search input, **When** they type, **Then** the visible list filters by name client-side.
7. **Given** the admin changes the filter to Archived, **When** the filter applies, **Then** only subspaces with `visibility === SpaceVisibility.Archived` are shown.
8. **Given** the admin toggles the view, **When** Grid is selected, **Then** subspaces render as a card grid; **When** List is selected, **Then** they render as a stacked row list.
9. **Given** the admin clicks a subspace title (card or row), **When** they click, **Then** the app navigates to that subspace's page.

---

### User Story 5 - Templates tab (Priority: P1)

A space admin opens the Templates tab to browse and manage the space's template library. The tab shows five collapsible categories in this order: **Space**, **Collaboration Tool**, **Whiteboard**, **Post (Brief)**, **Community Guidelines**. Each category has an icon, a title, an item count badge, a one-line description, and an "Add New" dropdown offering "Create a new template" and "Select from the platform library" — the same two entry points the current MUI Templates admin already supports.

A global search input at the top filters templates by name across all categories. Every template card shows a thumbnail, title, description, category badge, and a "Custom" badge if the template is space-owned. A per-card kebab menu offers: Preview, Duplicate as Custom, Edit (custom only), Delete (custom only) — all preceded by a CRD confirmation dialog for the destructive Delete.

All current supported template kinds are preserved: Post, Whiteboard, Callout (Collaboration Tool), Space, Community Guidelines.

**Independent Test**: Open Templates. Expand each of the five categories. Search for a template by name. Create a new custom template via the Add New dropdown. Edit it (custom only). Delete it (confirmation dialog). Duplicate a platform template as custom. Preview any template.

**Acceptance Scenarios**:

1. **Given** the admin opens the Templates tab, **When** it renders, **Then** all five categories (Space / Collaboration / Whiteboard / Post / Community Guidelines) are visible as collapsible cards with counts.
2. **Given** the admin types in the global search, **When** they type, **Then** every category filters to matching templates; empty categories stay visible with an empty state.
3. **Given** the admin clicks Add New on a category, **When** the dropdown opens, **Then** "Create a new template" and "Select from the platform library" are offered.
4. **Given** the admin creates, edits, or deletes a custom template, **When** the mutation completes, **Then** the category count and list update.
5. **Given** the admin clicks a template's Preview or Duplicate as Custom, **When** they confirm, **Then** the existing preview / duplicate flow runs with CRD styling.

---

### User Story 6 - Storage tab (Priority: P1)

A space admin opens the Storage tab and sees the **same hierarchical document browser the current MUI page already provides**, restyled with CRD primitives. The tab shows a tree of folders and files with expand/collapse controls. Each file row displays: display name, size (formatted bytes), uploaded-by (user link), uploaded-at (formatted datetime). Each file has actions: Open in new tab and Delete (preceded by a CRD confirmation dialog).

The prototype's "Platform-Managed Storage" info-only card is **not** adopted — removing the tree browser would be a functional regression.

**Independent Test**: Open Storage. Expand a folder and a subfolder. Click a file to open it in a new tab. Delete a file (confirmation dialog). The tree reflects the deletion.

**Acceptance Scenarios**:

1. **Given** the admin opens the Storage tab, **When** it renders, **Then** the hierarchical tree of folders and files is visible with expand / collapse controls.
2. **Given** each file row is shown, **When** it renders, **Then** name / size / uploader / uploaded-at are visible.
3. **Given** the admin clicks a file's "Open in new tab" action, **When** they click, **Then** the file opens in a new browser tab.
4. **Given** the admin clicks Delete, **When** they confirm the CRD confirmation dialog, **Then** the file is deleted (`deleteDocument`) and the tree refreshes.
5. **Given** the query is still loading, **When** the tree would render, **Then** CRD skeleton placeholders are shown.

---

### User Story 7 - Settings tab (Priority: P1)

A space admin opens the Settings tab to control the space's privacy, membership policy, and capabilities. The tab preserves every toggle and control the current MUI Settings page exposes and groups them into accordion sections following the prototype's layout.

**Sections and controls (all retained from the current MUI)**:

- **Visibility** — Public / Private radio group.
- **Membership** — No Application Required / Application Required / Invitation Only radio group.
- **Applicable Organizations** — add / remove organizations; Automatic Access toggle (domain-based auto-membership).
- **Allowed Actions** — toggles for: Space Invitations (allow subspace admins to invite), Create Posts, Video Calls, Guest Contributions, Create Subspaces, Subspace Events, Alkemio Support, and the current trust-host-org and inherit-member-rights-from-parent toggles that the MUI version exposes.
- **Danger Zone** — card styled with the CRD destructive variant. Contains the "Delete this Space" action; confirmation requires a dialog that explicitly lists what is deleted (existing behavior) and uses the CRD destructive confirm button.

Every toggle commits its change via the existing `updateSpaceSettings` mutation immediately (no tab-wide Save/Reset bar on Settings).

**Independent Test**: Open Settings. Flip Visibility from Public to Private. Flip Membership from Application Required to Invitation Only. Add an organization to Applicable Organizations. Flip each Allowed Actions toggle. Click Delete this Space in the Danger Zone → the confirmation dialog appears; cancel → nothing happens.

**Acceptance Scenarios**:

1. **Given** the admin opens the Settings tab, **When** it renders, **Then** all current MUI settings are present in the listed accordion sections.
2. **Given** the admin flips any toggle or radio, **When** they confirm, **Then** the mutation fires immediately and the UI reflects the new value.
3. **Given** the admin adds or removes an applicable organization, **When** the mutation completes, **Then** the list updates.
4. **Given** the admin clicks Delete this Space in the Danger Zone, **When** the confirmation dialog opens, **Then** it lists the data that will be deleted and requires explicit confirmation before firing `deleteSpace`.
5. **Given** the admin cancels the delete confirmation, **When** they click Cancel or press Escape, **Then** the dialog closes and nothing is deleted.

---

### User Story 8 - Account tab (Priority: P1)

A space admin opens the Account tab. This tab is a **pure restyle** of the current MUI Space Admin Account page — every field, action, and permission is preserved exactly as today; no new capabilities are introduced.

**Sections (parity with current MUI `SpaceAdminAccount`)**:

- **URL** — read-only display of the space URL with the existing "contact Alkemio to change" helper line. Same text and format the current MUI page renders.
- **License / plan** — current plan name, included features, days-left indicator (if applicable), the existing "Change License" external link, and the existing "More about Alkemio licenses" link. No new progress bars or badges.
- **Host / Provider** — the current host profile card as rendered in MUI today.
- **Support contact link** — the existing "Contact Alkemio Support" link.
- **Delete Space** — the existing destructive action (visible only when the admin has the `useDeleteSpaceMutation` permission, just like today), using the existing confirmation flow.

Everything on this tab is either read-only display or routes through pre-existing mutations / external links. No Save / Reset bar is shown.

**Independent Test**: Open Account. Verify every field shown on the current MUI Account admin page is present (URL, plan + features, host card, support link, Delete Space when permitted) — nothing more, nothing less. The only difference between Before and After is the CRD styling (cards, typography, spacing). Click Delete Space — the existing confirm flow runs.

**Acceptance Scenarios**:

1. **Given** the admin opens the Account tab, **When** it renders, **Then** the same field set and action set the current MUI `SpaceAdminAccount` page exposes is visible — no prototype-only additions (URL Copy button, entitlement progress bar, Visibility Status badge, host badges, etc.) are introduced.
2. **Given** the admin clicks Contact Alkemio Support, **When** they click, **Then** the existing support link opens — same behavior as today.
3. **Given** the admin clicks the existing "Change License" link, **When** they click, **Then** it routes to the same external / host-provider destination as today.
4. **Given** the admin has delete permission, **When** they confirm the delete flow, **Then** `deleteSpace` fires — identical to current MUI behavior.
5. **Given** the admin lacks delete permission, **When** the Account tab renders, **Then** the Delete Space button is NOT shown — identical to current MUI behavior.

---

### Edge Cases

- What happens when an admin opens Space Settings but does not have admin permission for the space? → Same access rules as the current MUI page; unauthorized path is preserved.
- Save mutation fails (any tab with mutations)? → Action bar stays visible, form retains dirty state, inline error banner in the affected card. No data is silently discarded.
- Two browser tabs edit the same space simultaneously? → Last save wins; conflicting tab surfaces an inline "Reload current values / Discard my changes" choice on its next save attempt.
- Admin navigates to `…/settings/unknown-tab`? → Tab strip defaults to About and the URL is normalized.
- Empty input that a server rejects (e.g., empty column title on Layout)? → Inline validation prevents save; Save Changes button is disabled while any edit is invalid.
- Pinned system entry on Layout? → Drag handle disabled; inline note explains the entry is pinned.
- Dragging across columns violates a backend rule? → The drop is rejected visually, the callout snaps back, and a brief inline message explains why.

## Requirements

### Functional Requirements

- **FR-001**: Space Settings MUST present the same CRD space hero (banner, name, tagline, member avatars) as the CRD Space Page when CRD is enabled.
- **FR-002**: Space Settings MUST present a horizontal tab strip below the hero with these tabs in this order: **About, Layout, Community, Subspaces, Templates, Storage, Settings, Account**, and MUST indicate the active tab visually.
- **FR-003**: Each tab MUST be deep-linkable — the active tab MUST be reflected in the URL, and opening a direct URL MUST land on the corresponding tab.
- **FR-004**: The tab strip MUST collapse to a horizontally scrollable row on narrow viewports without losing any tab.
- **FR-005** (About): The About tab MUST allow admins to view and edit space name, tagline, avatar, page banner, card banner, location (country, city), email, pronouns, tags, references & links, visuals gallery, and the three rich-text context fields (**What**, **Why**, **Who**); a live Preview card MUST update on every edit. Fields are rendered as flat CRD cards mirroring the current MUI About page augmented with prototype additions (Tags, References & Links, Preview) — no new umbrella section groupings are introduced. The Preview card MUST be rendered via a **reusable CRD space-card component** that will also be consumed by the future CRD Explore Spaces page; the component is introduced in this feature as shared infrastructure so it ships only once.
- **FR-005a** (About — autosave): The About tab MUST NOT expose a Save Changes button or a Reset button. Each field autosaves after a **2-second idle debounce**. File uploads (avatar, page banner, card banner, visuals) MUST fire the mutation immediately on upload completion (no debounce). While a field's mutation is in flight the UI MUST render a loading spinner adjacent to the field's label; on success the spinner MUST be replaced by a grayed-out "Saved!" indicator that remains visible for exactly **2 seconds** before returning to idle; on error it MUST be replaced by an inline error message that remains until the admin edits the field again (no automatic retry). Switching tabs or navigating away while a debounce timer is pending MUST flush the pending mutation immediately. Every indicator slot MUST be a `role="status"` element with `aria-live="polite"` and a descriptive `aria-label`.
- **FR-006** (Layout): The Layout tab MUST present four column cards — Home, Community, Subspaces, Knowledge — each with an **inline-editable title and description** representing the space's innovation-flow step / space-level tab. The column header MUST show ONLY the title, the description, and a top-right three-dot overflow menu — no icon, no callout-count badge, no collapse / expand affordance. Each column MUST list its currently assigned **callouts / posts** with read-only title and description. Users MUST be able to drag a callout within a column to reorder and across columns to move. Pinned system entries MUST remain pinned and MUST NOT be draggable. Callout title and description editing is OUT of scope for the Layout tab — those fields are edited from the post's own page.
- **FR-006a** (Inline-edit hover pattern): Every **inline-editable value that is not already wrapped in a visible input field** (Layout column titles, Layout column descriptions, any About-tab value the designer renders as plain text) MUST render its value as plain text by default and, on hover, show (a) a **1px underline** in `text-muted-foreground` and (b) a **small `Pencil` icon** (`lucide-react`) at `size-3`, rendered inline immediately after the text with `ml-1`. Clicking either the text or the pencil enters edit mode. The pencil MUST be keyboard-focusable and activatable via Enter / Space. The pattern MUST be identical across every inline-editable field in CRD Space Settings and MUST match the prototype's Home-tab title affordance.
- **FR-007** (Layout): The Layout tab MUST NOT allow creating, deleting, or editing callouts — callouts are created, deleted, and textually edited elsewhere in the product. The Layout tab's per-callout mutations are limited to: moves (within a column, across columns, or unassign via "Remove from Tab"). "Remove from Tab" MUST unassign the callout from the current column (by updating the existing tabset assignment / callouts-set membership). It MUST NOT delete the callout itself.
- **FR-008** (Layout): The Layout tab MUST use a local dirty buffer + a sticky Save Changes / Reset action bar. **Save Changes** commits all buffered callout moves, callout reorders, **column** title and description edits, pending callout removals, and the Post-description-display toggle in a single logical commit (callouts themselves are never renamed on this tab per FR-007). **Reset** reverts the entire buffer to the last known backend state, clearing all unsaved local state. While the mutation batch is in flight (`saveBar.kind === 'saving'`), BOTH the Save Changes button AND the Reset button MUST be disabled to prevent double-commits or mid-flight resets. On save error (`saveBar.kind === 'saveError'`), BOTH buttons MUST be re-enabled: clicking Save Changes again **retries** the flush against the current buffer — no partial success is recorded, and the buffer stays exactly as the admin left it so the retry is deterministic. Clicking Reset from the errored state MUST discard the buffer.
- **FR-008a** (Layout — zero-mutations-until-Save invariant): No drag, keyboard move, inline rename of a column or callout, Move to, Remove from Tab, or Post description display toggle MAY issue any GraphQL mutation or deletion query before Save Changes is clicked. If the admin clicks Reset, refreshes the page, closes the browser tab, or navigates away (including choosing Discard in the confirm dialog), the backend state MUST be unchanged from before the admin first opened the tab. All intermediate state lives exclusively in the in-memory buffer.
- **FR-009** (Layout): The Layout tab MUST include a "Post description display" toggle (collapsed / expanded) backed by the existing `calloutDescriptionDisplayMode` setting. `Expanded` renders the callout description in full; `Collapsed` renders the first ~3 lines with a "Read more" link that expands the description inline on click (same behavior the current MUI implementation produces). The toggle's change is held in the same local buffer and committed with Save Changes.
- **FR-010** (Layout — per-column overflow menu): Each column header MUST render a three-dot overflow button in its top-right corner. Clicking it MUST open a dropdown with exactly two entries — **Active phase** and **Default post template** — identical to the per-step actions the current MUI Layout page offers. These are column-level (innovation-flow-step-level) concerns, not per-callout. Selecting an entry fires its mutation via the existing space-admin mutations (no GraphQL changes — FR-031). The menu is visible in the UI; there is no deferred / hidden state.
- **FR-011** (Layout): The Layout tab MUST provide a keyboard alternative to drag-and-drop. Each movable item's drag handle MUST be focusable; Space/Enter activates grab mode; Arrow Up/Down reorders within the current column; Arrow Left/Right moves across columns; Enter commits; Escape cancels and restores the original position. Grab-mode state and new positions MUST be announced via an ARIA live region.
- **FR-011a** (Layout — visible per-callout menu): Each movable callout row MUST expose a three-dot menu with exactly three entries, in this order: (1) **Move to** — submenu listing the other three columns (the current column is omitted); choosing a target moves the callout into that column in the local buffer. (2) **View Post** — navigates to the callout's page; blocked by the discard-confirm dialog (FR-026) when the Layout buffer is dirty. (3) **Remove from Tab** — renders with destructive styling; marks the callout for removal in the local buffer (NO mutation or deletion fires until Save Changes — FR-008a). A callout row flagged pending-removal MUST remain visible with a pending-removal visual treatment (reduced opacity + strikethrough / badge) and MUST swap its kebab's Remove entry for an **Undo removal** entry. Pinned system rows MUST NOT render this menu. The three visible entries are **per-callout** and distinct from the **per-column** overflow menu in FR-010 (the two menus attach to different surfaces).
- **FR-012** (Community): The Community tab MUST render a main users table (paginated, ~10 rows visible) with columns name / role / joined / status / actions and with search, role filter, status filter, and Invite button controls above. Row kebab actions: View Profile, Change Role, Resend / Revoke (Invited), Approve / Reject (Pending — plus inline approve/reject), Remove.
- **FR-013** (Community): The Community tab MUST provide an **Organizations** collapsible section (collapsed by default). When expanded, it MUST render its own table (~5 rows visible) with the same row template as the users table, scoped to member organizations, exposing the existing add / remove / role assignment / automatic-access affordances.
- **FR-014** (Community): The Community tab MUST provide a **Virtual Contributors** collapsible section (collapsed by default). When expanded, it MUST render its own table (~5 rows visible) with the same row template as the users table, scoped to virtual contributor accounts, exposing the existing add / edit / delete / active-toggle affordances.
- **FR-015** (Community): The Community tab MUST provide an Application Form card (edit application questions) and a Community Guidelines card (edit guidelines; save-as-template via existing `createTemplate`). Both are collapsible.
- **FR-016** (Subspaces): The Subspaces tab MUST retain the current MUI per-subspace kebab menu exactly: **Pin / Unpin** (alphabetical sort mode only), **Save as Template**, **Delete**. "Edit Details" and "Archive" are explicitly OUT of scope in this iteration.
- **FR-017** (Subspaces): The Subspaces tab MUST retain the current Default Subspace Template selector (with innovation flow / callouts preview) and the existing Create Subspace entry point.
- **FR-018** (Subspaces): The Subspaces tab MUST add — on top of the retained MUI features — a **search** input, a **filter** dropdown with values All / Active / Archived (using existing `SpaceVisibility.Archived` enum), and a **Grid / List** view toggle. Clicking a subspace title MUST navigate to the subspace (existing behavior). The prototype's kebab "View" entry is dropped.
- **FR-019** (Templates): The Templates tab MUST list five collapsible categories — **Space**, **Collaboration Tool**, **Whiteboard**, **Post**, **Community Guidelines** — each with an Add New dropdown offering "Create a new template" and "Select from the platform library", mirroring current MUI entry points.
- **FR-020** (Templates): Each template card MUST expose: Preview, Duplicate as Custom, Edit (custom only), Delete (custom only — preceded by a CRD confirmation dialog). A top-level search input MUST filter all categories by template name.
- **FR-021** (Storage): The Storage tab MUST render the current hierarchical document browser (folders + files) with columns name / size / uploader / uploaded-at and actions Open-in-new-tab / Delete. Delete MUST be preceded by a CRD confirmation dialog.
- **FR-022** (Settings): The Settings tab MUST retain every toggle and radio the current MUI Settings page exposes (Visibility, Membership, Applicable Organizations with Automatic Access, Allowed Actions including trust-host-org and inherit-member-rights) and MUST add a Danger Zone section containing the existing Delete-this-Space action.
- **FR-023** (Settings): Every Settings toggle MUST commit its change via the existing `updateSpaceSettings` mutation immediately on confirmation (no tab-wide Save / Reset bar on Settings). Delete this Space MUST require a confirmation dialog listing the data that will be deleted (existing behavior).
- **FR-024** (Account): The Account tab MUST render exactly the fields, actions, and permissions the current MUI `SpaceAdminAccount` page renders — URL display, plan + features + days-left, the existing "Change License" and "More about Alkemio licenses" links, the existing host / provider card, the existing Contact Alkemio Support link, and the existing Delete Space destructive action gated by the same permission as today. The CRD Account tab is a pure restyle: NO new fields, NO new affordances (no URL Copy, no entitlement progress bars, no Visibility Status badge, no host badges).
- **FR-025** (action bars / save semantics): Only the **Layout** tab uses a tab-wide Save Changes / Reset action bar. **About** uses per-field autosave (FR-005a). Community / Subspaces / Templates / Storage / Settings / Account commit on-confirm per action and have no tab-wide save bar.
- **FR-026**: Switching to another tab while the **Layout** tab has a dirty buffer MUST be blocked by a CRD confirmation dialog offering Save / Discard & leave / Cancel. Cancelling keeps the admin on Layout with the buffer intact. Navigating away from the Space Settings page entirely while the Layout buffer is dirty MUST also prompt for confirmation. About never triggers this dialog — its autosave model flushes any pending debounced save immediately on tab switch / navigation so there is no state to lose.
- **FR-027**: Every destructive action (delete subspace, delete template, delete document, remove member / organization / VC, delete space) MUST be preceded by a CRD confirmation dialog with a clearly distinguishable destructive confirm button. Cancel / Escape MUST cancel.
- **FR-028**: Data loading states MUST be represented with skeleton placeholders inside the affected cards / tables. Data load errors MUST be represented by inline error banners inside the affected card — NOT full-page errors.
- **FR-029**: All form controls, tables, dialogs, and dropdowns used inside Space Settings MUST be CRD components. The CRD presentation layer MUST NOT depend on any MUI or Emotion primitives.
- **FR-030**: The CRD Space Settings area MUST be gated behind the existing `alkemio-crd-enabled` localStorage toggle. All 8 tabs MUST ship together in a single release — the CRD Space Settings page MUST NOT be enabled until every tab is fully migrated.
- **FR-031**: The CRD Space Settings area MUST reuse the existing space admin queries and mutations — no backend or GraphQL schema changes are introduced by this feature.
- **FR-032**: Every interactive element MUST meet WCAG 2.1 AA for keyboard navigation, visible focus, labels, and ARIA semantics (tablist / tab / tabpanel on the tab strip, labeled form controls, ARIA live regions for save feedback, Layout grab-mode, and async action results).

### Key Entities

- **Space**: The space being administered. Provides the identity fields rendered in the hero and edited on the About tab, plus every tab's data source.
- **Callout / post**: A user-created content item that lives on one of the four space-level tabs (Home / Community / Subspaces / Knowledge). Movable and renamable from the Layout tab; never created or deleted there.
- **Space-level tab column** (Layout): Home, Community, Subspaces, Knowledge. Each has an inline-editable title and description.
- **Pinned system entry** (Layout): A non-callout entry on a column that is provided by the platform (e.g., the built-in Community members list) and cannot be moved.
- **Space navigation buffer** (Layout): Client-side dirty state that collects pending column-moves, reorders, title edits, description edits, and the `calloutDescriptionDisplayMode` toggle until the admin clicks Save Changes or Reset.
- **Subspace**: A child space. Listed on the Subspaces tab; the same permission model as today; archive state available via `SpaceVisibility.Archived`.
- **Template**: A reusable artifact of category Space / Collaboration Tool / Whiteboard / Post / Community Guidelines.
- **Document**: A file in the space's storage tree.
- **Community member / lead**: An identity (user, organization, or virtual contributor) with a role in the space.
- **Space privacy / visibility / allowed-actions settings**: The configuration values edited on the Settings tab.
- **Space license / entitlements**: The read-only plan information shown on the Account tab.

### Related Specifications

- **042-crd-space-page**: Sibling CRD migration that delivered the CRD Space Page, including the space hero and the visual language for space-level surfaces. This spec reuses that hero verbatim and inherits the same CRD primitives, card patterns, and tab conventions.

### Out of Scope

- Backend / GraphQL schema changes — existing space admin queries and mutations are reused as-is.
- The Communication admin area (current `SpaceAdminCommunication`) is out of scope for the 8-tab redesign.
- New admin capabilities — no new permissions, fields, or configuration options are introduced.
- Platform-level (Global Administration) screens.
- Subspaces: "Edit Details" and "Archive" kebab entries are deferred pending designer review.
- Subspaces: reordering / drag-sort is NOT in scope (not present in the current UI as the user perceives it).

## Success Criteria

### Measurable Outcomes

- **SC-001**:
  - **Layout**: An admin can move a callout across columns (or make any buffered edit) and persist the full buffer via Save Changes in under 60 seconds end-to-end.
  - **About**: An autosave for any single field completes in under 3 seconds from the last keystroke (measured as: 2-second idle debounce + mutation round-trip), so the admin sees the `saving → saved` transition within that budget on a typical connection.
- **SC-002**: 100% of the 8 Space Settings tabs are reachable from the tab strip on desktop and narrow viewports without any tab being hidden, clipped, or inaccessible.
- **SC-003**: For every destructive action across all tabs, 100% of deletions require an explicit confirmation step; zero deletions can be triggered by a single click.
- **SC-004**: The CRD Space Settings page reaches feature parity with the current MUI Space Settings for all actions currently exposed, measured by a side-by-side action inventory with 0 missing actions (except explicitly deferred items noted in Out of Scope).
- **SC-005**: An admin cannot lose edits on any tab. On Layout (dirty buffer) switching tabs / navigating / closing is blocked by a confirm dialog. On About (autosave) any pending debounced save is flushed immediately on tab switch / navigation so no edit is ever lost silently.
- **SC-006**: Toggling the `alkemio-crd-enabled` flag off restores the current MUI Space Settings with no visible regressions; toggling it on restores the CRD experience. Verified across all 8 tabs.
- **SC-007**: Keyboard-only users can reach and operate every control on every tab — including the Layout grab-mode equivalent — without a mouse.
- **SC-008**: The CRD space hero rendered in Space Settings is visually and behaviorally identical to the hero on the CRD Space Page (spec 042), verified by side-by-side screenshots with zero divergences.
- **SC-009**: The Layout per-column overflow menu ("Active phase", "Default post template") reaches parity with the current MUI per-step menu — verified by a side-by-side action inventory and unit tests that exercise each mutation end-to-end per column.

## Assumptions

- The CRD space hero component delivered by spec 042 is reusable as-is and requires no changes to support embedding inside Space Settings.
- Every existing space admin Apollo query and mutation covers the retained capabilities; no new GraphQL fields or operations are required for any tab (including Subspaces Archive, which reuses `updateSpacePlatformSettings` with `SpaceVisibility.Archived`).
- Permission checks that currently gate access to each MUI admin tab continue to apply unchanged; the CRD layer is a presentation-only change.
- Translation strings for the CRD Space Settings area live under a new `crd-spaceSettings` i18n namespace and are authored in English only (Crowdin handles other locales, separately).
- The `alkemio-crd-enabled` localStorage toggle is the only gating mechanism — no server-side feature flag is introduced.
- The CRD Space Page (spec 042) is considered the source of truth for space-level visual language. If spec 042 changes those patterns during development, this spec follows.
- The Layout per-column overflow menu ("Active phase", "Default post template") is visible in the top-right of each column header — no deferred / hidden state.
