# Feature Specification: CRD Space Settings Page

**Feature Branch**: `045-crd-space-settings`
**Created**: 2026-04-14
**Status**: Draft
**Input**: Migrate the Space Settings area (About, Layout, Community, Subspaces, Templates, Storage, Settings, Account tabs) from the current MUI implementation to the CRD design system (shadcn/ui + Tailwind), following the prototype reference at `prototype/src/app/components/space/SpaceSettings*.tsx`. Related sibling effort: `084-crd-pending-memberships-dialog` — membership interaction patterns established there should inform the Community tab (decline/approve actions, confirmation affordances, list composition).

## Clarifications

### Session 2026-04-15

- Q: When CRD is enabled but not every tab has been migrated yet, what should a not-yet-migrated tab show? → A: All 8 tabs ship together in a single release — no progressive rollout and no mixed-shell fallback. The CRD Space Settings page is only enabled once all 8 tabs are fully migrated.
- Q: What happens when the admin switches to another tab while the current tab has unsaved changes? → A: The tab switch is blocked by a CRD confirmation dialog. The admin must Save Changes or Reset on the current tab before another tab becomes active. Only one tab is ever dirty at a time.
- Q: Which items on the Layout tab can be moved across columns? → A: Parity with the current behavior — only user-created content/callouts are movable between columns. System/built-in pages stay pinned to their column and cannot be dragged out; movable items are visually distinguishable from pinned ones.
- Q: Who can see the Account tab (plan, entitlements)? → A: Visibility mirrors the current MUI Space Admin Account page exactly. The CRD migration does not introduce new role gates; whoever can reach the Account tab today reaches it after migration, with the same read/write capabilities.
- Q: What is the keyboard alternative to drag-and-drop on the Layout tab? → A: Each movable item's drag handle is focusable. Space/Enter activates grab mode, Arrow Up/Down reorders within the column, Arrow Left/Right moves across columns, Enter drops, Escape cancels and restores the item's original position. The grab-mode state is announced to assistive tech.

## User Scenarios & Testing

### User Story 1 - Edit Space Identity on the About Tab (Priority: P1)

A space admin opens Space Settings to update their space's identity — name, tagline, banner image, avatar, vision, mission, impact, and tags. The About tab is the default landing tab and presents the existing space hero at the top (banner, title, tagline, member avatars) exactly as it appears on the public Space page, so the admin sees the live appearance of their space while editing it. Below the hero, a horizontal tab strip (About, Layout, Community, Subspaces, Templates, Storage, Settings, Account) lets the admin switch tabs. The About tab content is organized into cards — each card groups a related set of fields (Identity, Branding, Context) with a short inline description of what the card is for. A live Preview card on the right shows how the space card will appear to other users, and it updates as the admin edits.

**Why this priority**: The About tab is the most common entry point for admins — it covers the space identity that users see on the public page. Shipping this first delivers the redesigned shell (hero + tab strip + save bar) and the most-used tab, giving a complete viable slice.

**Independent Test**: Enable the CRD toggle, open Space Settings for any admin-owned space, observe the CRD hero and tab strip. Edit the space name, tagline, and banner. Confirm the Preview card updates live. Save and reload — confirm changes persist. Switching tabs works across all 8 tabs (all tabs ship together in the same release; none are stubbed).

**Acceptance Scenarios**:

1. **Given** an admin opens Space Settings with CRD enabled, **When** the page loads, **Then** the CRD space hero renders at the top with banner, name, tagline, and member avatars, and the horizontal tab strip shows all 8 tabs with the About tab active
2. **Given** the admin is on the About tab, **When** they edit the space name field, **Then** the Preview card on the right updates in real time to reflect the new name
3. **Given** the admin has unsaved changes, **When** they look at the bottom-right of the viewport, **Then** a sticky Save Changes / Reset action bar is visible; before any edit, the bar is hidden
4. **Given** the admin has unsaved changes, **When** they click Save Changes, **Then** the changes persist, a success confirmation is shown, and the action bar disappears
5. **Given** the admin has unsaved changes, **When** they click Reset, **Then** all fields revert to the last saved values and the action bar disappears
6. **Given** the admin has unsaved changes, **When** they click another tab in the tab strip, **Then** a confirmation dialog blocks the switch until they Save Changes or Reset; cancelling the dialog keeps them on the current tab with edits intact
7. **Given** the admin has unsaved changes, **When** they try to navigate away from the Space Settings page entirely (browser back, external link, close tab), **Then** a confirmation dialog warns about losing changes
8. **Given** the admin uploads a new banner image, **When** the upload completes, **Then** the new banner appears in both the hero above and the Preview card, and the field is marked as dirty
9. **Given** the admin opens a direct URL to the About tab, **When** the page loads, **Then** the About tab is active without any extra clicks
10. **Given** CRD is disabled via the localStorage toggle, **When** the admin opens Space Settings, **Then** the current MUI Space Settings page renders unchanged

---

### User Story 2 - Reorder and Manage Navigation Tabs on the Layout Tab (Priority: P1)

A space admin opens the Layout tab to customize the navigation tabs that appear on the space's public home page. The tab presents four parallel column cards — Home, Community, Subspaces, Knowledge — each representing a pool of pages available to members. Each column lists its current pages with drag handles, rename-in-place affordances, and add/remove buttons. The admin can drag pages within a column to reorder, drag a page between columns to move it, add new pages, and rename or delete existing pages. A sticky Save Changes / Reset action bar at the bottom-right appears only when there are unsaved changes.

**Why this priority**: The Layout tab is the second-most-impactful tab — it directly controls what members see first when they enter a space. The prototype changes the Layout tab most dramatically (from a tabular editor to a four-column pool layout), so it needs validation early.

**Independent Test**: Open Space Settings → Layout. Drag a page from the Home column to the Community column. Rename a page inline. Add a new page. Save, reload, verify the new order persists.

**Acceptance Scenarios**:

1. **Given** the admin is on the Layout tab, **When** the page renders, **Then** four column cards (Home, Community, Subspaces, Knowledge) are visible side-by-side on desktop, each listing its current pages
2. **Given** the admin drags a page within a column, **When** they drop it, **Then** the page takes its new position in the column and the action bar appears
3. **Given** the admin drags a page from one column to another, **When** they drop it, **Then** the page moves to the target column and the action bar appears
4. **Given** the admin clicks a page's rename affordance, **When** they type a new name and confirm, **Then** the new name is shown and the action bar appears
5. **Given** the admin clicks Add Page on a column, **When** they confirm the new page name, **Then** the new page is added to that column's list
6. **Given** the admin clicks a page's delete affordance, **When** they confirm the CRD confirmation dialog, **Then** the page is removed from the list
7. **Given** the Layout tab is viewed on a narrow viewport, **When** the layout adjusts, **Then** the four columns stack vertically and remain fully usable

---

### User Story 3 - Manage Subspaces, Templates, Storage with Safe Destructive Actions (Priority: P2)

A space admin manages the space's child subspaces, template library, and uploaded documents through the Subspaces, Templates, and Storage tabs. Each tab presents items in a CRD card grid or table; each item has edit and delete actions. Destructive actions (delete subspace, delete template, delete document) always open a CRD confirmation dialog with clear destructive styling — the admin must confirm before the deletion is performed.

**Why this priority**: These tabs are important but used less frequently than About and Layout. Grouping them together as P2 lets the team ship them in a single wave once the shell is proven.

**Independent Test**: Open Subspaces → delete a subspace. Confirm dialog appears with destructive styling. Cancel dismisses without deletion. Confirm triggers deletion and list refreshes. Repeat for Templates and Storage.

**Acceptance Scenarios**:

1. **Given** the admin is on the Subspaces tab, **When** the page renders, **Then** child subspaces are shown in a CRD grid with name, avatar, and action buttons per item
2. **Given** the admin clicks Delete on any subspace, template, or document, **When** the confirmation dialog opens, **Then** the dialog uses CRD styling with a clearly distinct destructive confirm button
3. **Given** the confirmation dialog is open, **When** the admin clicks Cancel or presses Escape, **Then** nothing is deleted and the dialog closes
4. **Given** the confirmation dialog is open, **When** the admin confirms, **Then** the item is deleted, the list refreshes, and a success confirmation is shown
5. **Given** the admin is on the Storage tab, **When** they drop a file onto the upload area, **Then** the file uploads, appears in the document table, and shows size, uploader, and date
6. **Given** the admin is on the Templates tab, **When** they create or edit a template, **Then** the editing flow uses CRD dialogs and primitives throughout

---

### User Story 4 - Configure Community, Privacy and Plan on Community / Settings / Account Tabs (Priority: P3)

A space admin configures community membership (leads, invitation and application settings), space-wide privacy and visibility, and reviews the space's license plan. These tabs are less frequently visited than identity and layout but are essential for operating a mature space. The Community tab reuses membership interaction patterns established in the sibling spec `084-crd-pending-memberships-dialog` — list composition, accept/decline affordances, and confirmation dialogs follow the same visual language.

**Why this priority**: These tabs are comparatively low-frequency and can ship after the more visible tabs are validated. Grouping them as P3 keeps the critical path focused on the most-used flows.

**Independent Test**: Open Community → add a lead, change the invitation setting. Open Settings → toggle privacy from Public to Private. Open Account → verify the current plan and entitlements are displayed read-only.

**Acceptance Scenarios**:

1. **Given** the admin is on the Community tab, **When** the page renders, **Then** members, leads, invitation settings, and the membership application form are presented in CRD cards using the same membership card patterns as the Pending Memberships dialog
2. **Given** the admin removes a member, **When** they confirm the CRD confirmation dialog, **Then** the member is removed and the list refreshes
3. **Given** the admin is on the Settings tab, **When** they change the privacy setting from Public to Private, **Then** the change is reflected in the action bar as a dirty state and is applied on Save
4. **Given** the admin is on the Account tab, **When** the page renders, **Then** the current plan, entitlement table, and contact-admin action are displayed in CRD cards as read-only information
5. **Given** any of these tabs fails to load data from the server, **When** the error occurs, **Then** an inline error banner is shown inside the affected card rather than a full-page error

---

### Edge Cases

- What happens when an admin opens Space Settings but does not have admin permission for the space? → The CRD page respects the same access rules as the current MUI page; if disallowed, the user sees the existing unauthorized / not-found response path.
- What happens when the admin tries to save while the network is unavailable or the mutation fails? → The action bar stays visible, the form retains dirty state, and an inline error banner appears in the affected card. No data is silently discarded.
- What happens when the admin tries to drag a pinned system/built-in page across columns on the Layout tab? → The page is not draggable — its drag handle is disabled and visually marked as pinned; if the admin attempts the interaction, a brief inline message explains that system pages cannot be moved. Only user-created content and callouts are movable.
- What happens when the admin uploads a banner image that is larger than the recommended dimensions? → The upload is accepted if the server allows it, but the dimensions hint remains visible so the admin understands the recommended size.
- What happens when two browser tabs edit the same space simultaneously? → The last save wins; the non-winning tab shows a conflict indication on its next save attempt and offers to reload current values.
- What happens when the admin navigates directly to `…/settings/unknown-tab`? → The tab strip defaults to About and the URL is normalized.
- What happens when a page is renamed to an empty string on the Layout tab? → Rename is rejected inline with a validation message; the Save Changes button is disabled while any edit is invalid.

## Requirements

### Functional Requirements

- **FR-001**: Space Settings MUST present the same CRD space hero (banner, name, tagline, member avatars) as the CRD Space page when CRD is enabled.
- **FR-002**: Space Settings MUST present a horizontal tab strip below the hero with the tabs About, Layout, Community, Subspaces, Templates, Storage, Settings, Account, and MUST indicate the active tab visually.
- **FR-003**: Each tab MUST be deep-linkable — the active tab MUST be reflected in the URL, and opening a direct URL MUST land on the corresponding tab.
- **FR-004**: The tab strip MUST collapse to a horizontally scrollable row on narrow viewports without losing any tab.
- **FR-005**: The About tab MUST allow admins to view and edit space name, tagline, banner image, avatar, card banner, tags, vision, mission, impact, and who; changes MUST be visible in a live Preview card on the same tab.
- **FR-006**: The Layout tab MUST present four column cards — Home, Community, Subspaces, Knowledge — each listing its pages with reorder, rename, add, and remove affordances. Only user-created content and callouts MAY be moved across columns; system/built-in pages MUST remain pinned to their column and MUST NOT be draggable across columns. Pinned items MUST be visually distinguishable from movable ones, and an attempt to drop a movable item onto an invalid target MUST snap back with an inline explanation.
- **FR-007**: The Community tab MUST allow admins to view and edit members and leads, invitation settings, and the membership application form, using the same member/invitation card patterns as the Pending Memberships dialog (spec 084).
- **FR-008**: The Subspaces tab MUST allow admins to browse, create, rename, move, and delete child subspaces.
- **FR-009**: The Templates tab MUST allow admins to browse, create, edit, and delete templates across supported template categories.
- **FR-010**: The Storage tab MUST allow admins to view uploaded documents with name, type, size, uploader, and date, upload new files via a drop zone, and delete existing files.
- **FR-011**: The Settings tab MUST allow admins to configure privacy (Public / Private), host, visibility, and visual identity toggles.
- **FR-012**: The Account tab MUST present the current plan, entitlements, and a contact-admin action as read-only information. Visibility of the Account tab (and all other tabs) MUST mirror the access rules of the current MUI Space Admin pages exactly — the CRD migration does not introduce, remove, or alter any role/permission gate.
- **FR-013**: Every tab with editable data MUST show a sticky Save Changes / Reset action bar that appears only when the tab has unsaved changes and disappears after a successful save or a reset.
- **FR-014**: Every destructive action (delete subspace, delete template, delete document, remove member) MUST be preceded by a confirmation dialog using CRD styling, with a clearly distinguishable destructive confirm button; cancel or escape MUST cancel the action.
- **FR-015**: While a tab has unsaved changes, switching to another tab in the tab strip MUST be blocked by a confirmation dialog that offers Save / Reset / Cancel; cancelling MUST keep the admin on the current tab with edits intact. Navigating away from the Space Settings page entirely (browser back, external link, close tab) MUST also prompt for confirmation. Only one tab can be in a dirty state at a time.
- **FR-016**: Data loading states MUST be represented with skeleton placeholders inside the affected cards, and data load errors MUST be represented by inline error banners inside the affected cards rather than full-page errors.
- **FR-017**: All form controls (text inputs, selects, toggles, radios, file pickers, drag handles, confirmation dialogs) used inside Space Settings MUST be CRD components; the CRD presentation layer MUST NOT depend on any MUI or Emotion primitives.
- **FR-018**: The CRD Space Settings area MUST be gated behind the existing `alkemio-crd-enabled` localStorage toggle; when the toggle is off, the current MUI Space Settings MUST render unchanged. All 8 tabs MUST be delivered in a single release — the CRD Space Settings page MUST NOT be enabled until every tab (About, Layout, Community, Subspaces, Templates, Storage, Settings, Account) is fully migrated.
- **FR-019**: The CRD Space Settings area MUST reuse the existing space admin data queries and mutations — no backend or GraphQL schema changes are introduced by this feature.
- **FR-020**: Every interactive element MUST meet WCAG 2.1 AA for keyboard navigation, visible focus, labels, and ARIA semantics (tablist / tab / tabpanel roles for the tab strip, labeled form controls, live-region feedback on save success and failure).
- **FR-021**: The Layout tab MUST provide a keyboard alternative to drag-and-drop. Each movable item's drag handle MUST be focusable; Space or Enter activates a "grab" mode; Arrow Up / Down reorders within the current column; Arrow Left / Right moves the item across columns; Enter commits the drop; Escape cancels and restores the original position. Grab-mode state and the item's new position MUST be announced via an ARIA live region. Pinned (non-movable) items MUST NOT enter grab mode.

### Key Entities

- **Space**: The space being administered. Provides the identity fields rendered in the hero and edited on the About tab (name, tagline, banner, avatar, tags, vision, mission, impact, who), plus the navigation pool configuration edited on the Layout tab.
- **Space navigation pool page**: An entry in one of the four Layout tab columns (Home, Community, Subspaces, Knowledge). Has a name, a home column, and an order within its column.
- **Subspace**: A child space nested under the current space. Listed and managed on the Subspaces tab.
- **Template**: A reusable artifact (across supported categories) defined at the space level and managed on the Templates tab.
- **Document**: A file uploaded to the space's storage, managed on the Storage tab.
- **Community member** / **lead**: An identity (user or virtual contributor) with a role in the space, managed on the Community tab. Follows the same shape used by the Pending Memberships dialog (spec 084) for visual consistency.
- **Space privacy / visibility settings**: Space-scoped configuration values managed on the Settings tab.
- **Space license / plan**: The plan and entitlements applicable to the space, shown read-only on the Account tab.

### Related Specifications

- **084-crd-pending-memberships-dialog**: Sibling CRD migration covering membership interactions in a dialog context. The Community tab in this spec reuses the membership card layout, accept / decline / remove affordances, and confirmation patterns established there. Visual and interaction consistency with spec 084 is a requirement, not a nice-to-have.
- **042-crd-space-page**: The CRD space page that first introduced the CRD space hero. This spec reuses that hero verbatim — its appearance and behavior on Space Settings MUST match the Space page.

### Out of Scope

- Backend schema or GraphQL changes; existing space admin queries and mutations are reused as-is.
- The Communication admin area (current `SpaceAdminCommunication`) is not part of the 8-tab redesign and is excluded from this spec.
- New admin capabilities — no new permissions, fields, or configuration options are introduced.
- Platform-level (Global Administration) screens are out of scope; this spec is scoped to a single space's settings.

## Success Criteria

### Measurable Outcomes

- **SC-001**: An admin can edit space identity (name, tagline, banner, avatar) on the About tab and persist the change in under 60 seconds end-to-end, without leaving the Space Settings page.
- **SC-002**: 100% of the 8 Space Settings tabs (About, Layout, Community, Subspaces, Templates, Storage, Settings, Account) are navigable from the tab strip on both desktop and narrow viewports without any tab being hidden, clipped, or inaccessible.
- **SC-003**: For every destructive action across all tabs, 100% of deletions require an explicit confirmation step; zero deletions can be triggered by a single click.
- **SC-004**: The CRD Space Settings page reaches feature parity with the current MUI Space Settings for all actions currently exposed, measured by a side-by-side action inventory that reports 0 missing actions.
- **SC-005**: An admin with unsaved changes cannot lose edits by switching tabs, navigating away, or closing the page without first being warned — verified by zero silent-loss paths in acceptance testing.
- **SC-006**: Toggling the `alkemio-crd-enabled` flag off restores the current MUI Space Settings experience with no visible regressions, and toggling it on restores the CRD experience; the round-trip is verified across all 8 tabs.
- **SC-007**: Keyboard-only users can reach and operate every control on every tab (tab strip, all form inputs, action bar, confirmation dialogs, drag-handle alternatives on the Layout tab) without a mouse.
- **SC-008**: Community tab interactions (member cards, accept / decline / remove flows, confirmation dialogs) render with the same visual language as the Pending Memberships dialog (spec 084), verified by a shared-patterns review checklist with zero divergences.

## Assumptions

- The CRD space hero component delivered by spec 042 is reusable as-is from `src/main/crdPages/` data mappers and requires no changes to support being embedded inside Space Settings.
- The existing space admin Apollo queries and mutations expose everything needed for the redesigned tabs; no new fields or operations are required.
- Permission checks that currently gate access to each MUI admin tab continue to apply unchanged; the CRD layer is a presentation-only change.
- Translation strings for the CRD Space Settings area live under a new `crd-spaceSettings` i18n namespace and are authored in English only in this repository (Crowdin handles other locales).
- The `alkemio-crd-enabled` localStorage toggle is the only gating mechanism; no server-side feature flag is introduced.
- Membership card patterns from spec 084 are stable enough to reuse in the Community tab without coordinating breaking changes; if spec 084 changes those patterns during development, this spec follows.
