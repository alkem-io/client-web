# Feature Specification: Global Administration in the CRD Design System

**Feature Branch**: `105-crd-global-admin`
**Created**: 2026-06-08
**Status**: Draft
**Input**: User description: "Transfer the entire global administration (`/admin`) into the CRD design system. Go through every tab and feature in the current MUI implementation and, based on the settings screens and tables already in CRD (space settings, my account etc.), recreate and reintroduce the admin into CRD — preserving the functional logic from the existing codebase and reimplementing only the visual part in CRD. Follow SOLID principles, make sure everything is tested and works as in the old UI, and be specific for every feature and detail on every page."

## Overview

The platform's global administration area (everything under `/admin`) is currently rendered in the legacy MUI design system. The rest of the application is progressively moving to the CRD design system, gated per-user by the **Design Version** preference. Today, a user who has opted into CRD (`designVersion = 2`) still drops back into the old MUI look-and-feel the moment they open `/admin`, producing a jarring, inconsistent experience and leaving the admin area as one of the last MUI islands.

This feature recreates the **entire** global admin area inside CRD: the admin shell (navigation between sections), every section (Spaces, Users, Organizations, Innovation Packs, Innovation Hubs, Virtual Contributors, Global Authorization/Roles, Authorization Policies, Transfer & Conversions, Layout), and every action available within each section. **Only the visual layer changes.** All business behavior — what data is shown, which actions are available, who is allowed to do what, what each mutation does, and the resulting server state — is preserved exactly as it is in the MUI implementation. The CRD admin reuses the established CRD settings patterns (settings shell, tab strip, tables, forms, confirmation dialogs) already proven in Space Settings, User Settings, and Organization Settings.

The migration follows the standard CRD coexistence model: the new CRD admin renders only when the user is on the CRD design version; the MUI admin remains untouched and continues to serve users on the legacy version. Both are reachable at the same `/admin` URLs and are selected at the route level by the existing design-version toggle.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Navigate the global admin in the new design (Priority: P1)

A platform administrator who is on the CRD design version opens `/admin`. Instead of the old MUI layout, they see the admin area rendered in CRD — the same navigation between admin sections, the same set of sections they had before, styled consistently with the rest of the CRD app (CRD header/footer, CRD typography, CRD components). They can move between every admin section (Spaces, Users, Organizations, Innovation Packs, Innovation Hubs, Virtual Contributors, Global Roles, Authorization Policies, Transfer, Layout) and each section opens the expected content.

**Why this priority**: Without the shell and navigation, no section can be reached. This is the foundational slice — it establishes the CRD admin layout, the section navigation, the access gate, and the routing/toggle wiring that every subsequent story builds on. It is independently valuable because it removes the visual "fall back to MUI" discontinuity at the admin entry point even before individual sections are filled in.

**Independent Test**: Set the design version to CRD, sign in as a platform admin, open `/admin`, and confirm the admin shell renders in CRD with working navigation to each section placeholder; confirm a non-admin user is denied access exactly as in MUI; confirm a user on the MUI design version still sees the old admin.

**Acceptance Scenarios**:

1. **Given** a platform admin on the CRD design version, **When** they navigate to `/admin`, **Then** the admin area renders inside the CRD shell with a section navigation listing the same sections as the MUI admin, in the same order.
2. **Given** a platform admin on the CRD design version, **When** they select any admin section from the navigation, **Then** the URL updates to that section's path and the corresponding section content loads.
3. **Given** a user without platform-admin privilege, **When** they attempt to open `/admin` on the CRD design version, **Then** they are denied/redirected exactly as they are in the MUI admin (no admin content is shown).
4. **Given** a user on the MUI design version, **When** they open `/admin`, **Then** they see the unchanged MUI admin (this feature does not alter the legacy admin).
5. **Given** a platform admin deep-linking to a specific section URL (e.g. `/admin/users`), **When** the page loads on the CRD design version, **Then** the admin shell renders with that section active.

---

### User Story 2 - Administer Users (Priority: P1)

A platform admin opens the **Users** section and sees a searchable, paginated list of every platform user. They can search by name/email, page through results, open a user's detail/edit view, edit user profile fields, delete a user (with confirmation), change a user's email (global-admin only), view a user's email-change history, resolve an email "drift", and manage the license plans assigned to a user's account.

**Why this priority**: User administration is one of the most frequently used and highest-impact admin capabilities. It exercises the full set of reusable patterns (searchable server-paginated table, row actions, detail/edit form, multiple dialogs, role-gated actions, license-plan management) that the remaining list-style sections reuse, so delivering it first de-risks the rest.

**Independent Test**: On the CRD design version, open `/admin/users`, search for a user, page through the list, open and edit a user, change an email, view email history, manage license plans, and delete a user — verifying each action produces the same server result as the MUI admin and shows the same success/error feedback.

**Acceptance Scenarios**:

1. **Given** the Users section, **When** it loads, **Then** a searchable list of users appears with server-side pagination matching the MUI page size and ordering.
2. **Given** the Users list, **When** the admin types a search term, **Then** the list filters by first name, last name, and email exactly as the MUI list does.
3. **Given** a user row, **When** the admin opens it, **Then** the user detail/edit view shows the same fields as MUI and supports editing and saving the same fields with the same validation.
4. **Given** a user row, **When** the admin chooses Delete and confirms in a CRD confirmation dialog, **Then** the user is deleted and the list refreshes — and cancelling the dialog performs no deletion.
5. **Given** a global admin on a user row, **When** they change the user's email, **Then** the email-change flow behaves as in MUI; **and** a non-global-admin does not see the change-email action.
6. **Given** a user, **When** the admin opens email-change history, **Then** the history list and outcome statuses render with the same data as MUI; **and** an email "drift" can be resolved through the same flow.
7. **Given** a user account, **When** the admin opens license-plan management, **Then** they can assign and revoke license plans, with the same available plans and the same effect as MUI.

---

### User Story 3 - Administer Organizations (Priority: P1)

A platform admin opens the **Organizations** section, sees a searchable, paginated list of organizations, creates a new organization, opens and edits an existing organization, toggles an organization's verification status, manages an organization account's license plans, and deletes an organization (with confirmation).

**Why this priority**: Organization administration is core platform management and, like Users, is high-frequency and high-impact. It introduces the create-entity form flow and the verification toggle, both reused conceptually elsewhere.

**Independent Test**: On the CRD design version, open `/admin/organizations`, create an organization, search/list, open and edit it, toggle verification, manage license plans, and delete it — confirming identical server outcomes to MUI.

**Acceptance Scenarios**:

1. **Given** the Organizations section, **When** it loads, **Then** a searchable, server-paginated list of organizations appears matching MUI.
2. **Given** the Organizations list, **When** the admin selects "New", **Then** an organization-creation form opens with the same fields as MUI (identity, contact email, domain, legal entity name, website, display name, description, tagline, references, avatar) and creates the organization on submit.
3. **Given** an organization, **When** the admin edits and saves it, **Then** the same fields are updated with the same validation as MUI.
4. **Given** an organization row, **When** the admin toggles verification, **Then** the verification state transitions exactly as MUI (same states/events) and the row reflects the new state.
5. **Given** an organization account, **When** the admin manages license plans, **Then** plans can be assigned/revoked with the same effect as MUI.
6. **Given** an organization row, **When** the admin deletes it and confirms, **Then** it is removed and the list refreshes; cancelling does nothing.

---

### User Story 4 - Administer Spaces (Priority: P1)

A platform admin opens the **Spaces** section, sees a searchable, paginated list of all platform spaces with their visibility (active/archived), privacy mode (public/private), and account owner, opens a space's settings (managing its license plans), and deletes a space (with confirmation).

**Why this priority**: Space administration is core to platform operations and surfaces space-level metadata (visibility, privacy mode, owner) plus license-plan management at the space level. It is one of the primary admin entry points.

**Independent Test**: On the CRD design version, open `/admin/spaces`, search/page the list, verify each column's data, open a space's settings to manage license plans, and delete a space — confirming identical outcomes to MUI.

**Acceptance Scenarios**:

1. **Given** the Spaces section, **When** it loads, **Then** a searchable list of spaces appears with columns for Name (link), Visibility (active/archived), Privacy Mode (public/private), and Account Owner, matching MUI.
2. **Given** the Spaces list, **When** the admin searches by display name, **Then** the list filters as in MUI, with the same "show more" pagination behavior.
3. **Given** a space row, **When** the admin opens its settings, **Then** the license-plan management for that space appears and supports assigning/revoking plans with the same effect as MUI.
4. **Given** a space row for which the admin has update rights, **When** they delete it and confirm, **Then** the space is deleted and the list refreshes; cancelling does nothing.

---

### User Story 5 - Manage Global Roles (Global Authorization) (Priority: P2)

A platform admin opens the **Global Authorization** (Roles) section, selects one of the global roles (e.g. Global Admin, Global Support, Global License Manager, Global Community Reader, Global Spaces Reader, Global Platform Manager, Global Support Manager, Platform Beta Tester, Platform VC Campaign), sees the current members of that role, searches available users, and adds or removes members.

**Why this priority**: Managing who holds global roles is critical for platform security but is used less frequently than the day-to-day Users/Orgs/Spaces lists. It introduces the role-membership management pattern (current-members + available-users picker).

**Independent Test**: On the CRD design version, open `/admin/authorization`, switch between roles, add a user to a role, remove a user from a role, and confirm membership changes match MUI exactly.

**Acceptance Scenarios**:

1. **Given** the Global Authorization section, **When** it loads, **Then** all the same global roles offered by MUI are selectable.
2. **Given** a selected role, **When** the section loads it, **Then** the current members of that role are listed.
3. **Given** a selected role, **When** the admin searches available users and adds one, **Then** the user receives the role and appears in the members list, matching MUI.
4. **Given** a member of a role, **When** the admin removes them, **Then** the role is revoked and the member list updates, matching MUI.

---

### User Story 6 - Browse Innovation Packs, Innovation Hubs, and Virtual Contributors (Priority: P2)

A platform admin opens the **Innovation Packs**, **Innovation Hubs**, or **Virtual Contributors** sections and sees a searchable, paginated list for each, with the columns Name (link), Listed in Store, Search Visibility (public/internal), and Account Owner. They can delete an Innovation Pack or Innovation Hub (with confirmation); Virtual Contributors is a read-only listing (no delete). Each row links to the corresponding detail page.

**Why this priority**: These three sections share an identical list shape and a small action set, so they can be delivered together once the searchable-table pattern from earlier stories exists. They are lower-traffic than Users/Orgs/Spaces.

**Independent Test**: On the CRD design version, open each of the three sections, search/page, verify the four columns, follow a row link, and (for Packs and Hubs) delete an item with confirmation — confirming parity with MUI.

**Acceptance Scenarios**:

1. **Given** the Innovation Packs section, **When** it loads, **Then** a searchable list with Name, Listed in Store, Search Visibility, and Account Owner appears, with client-side "show more" pagination matching MUI; **and** an item can be deleted with confirmation.
2. **Given** the Innovation Hubs section, **When** it loads, **Then** the same list shape appears and an item can be deleted with confirmation, matching MUI.
3. **Given** the Virtual Contributors section, **When** it loads, **Then** the same list shape appears as a read-only listing with no delete action, matching MUI.
4. **Given** any row in these sections, **When** the admin follows the row's link, **Then** they navigate to the same destination as MUI.

---

### User Story 7 - Inspect Authorization Policies (Priority: P3)

A platform admin opens the **Authorization Policies** section, looks up an authorization policy by its ID, and inspects the policy's type, credential rules (name, cascade flag, granted privileges, criteria), and privilege rules (name, source privilege, granted privileges). They can also look up the privileges a specific user is granted within that policy.

**Why this priority**: This is a low-frequency, expert diagnostic tool. It is mostly read-only and does not block the high-traffic sections, so it can come later.

**Independent Test**: On the CRD design version, open `/admin/authorization-policies`, enter a known policy ID, verify the rendered rules match MUI, then look up a user's privileges within the policy.

**Acceptance Scenarios**:

1. **Given** the Authorization Policies section, **When** the admin enters a valid policy ID, **Then** the policy's type, credential rules, and privilege rules render with the same data as MUI.
2. **Given** a loaded policy, **When** the admin looks up a specific user, **Then** the privileges granted to that user within the policy are displayed, matching MUI.
3. **Given** an invalid or unknown policy ID, **When** the admin submits it, **Then** the section reports the absence/error the same way MUI does.

---

### User Story 8 - Perform Transfers & Conversions (Priority: P3)

A platform admin opens the **Transfer & Conversions** section and performs the same dangerous operations available in MUI: converting a space, converting a virtual contributor, transferring a space / innovation hub / innovation pack / virtual contributor / callout between accounts (using an account search/picker), with the same prominent warning that these are destructive operations.

**Why this priority**: These are rare, high-risk operations performed by a small set of operators. Correctness matters enormously but usage frequency is the lowest, so this comes last among functional sections. Because each operation is destructive, every one must route through CRD confirmation before firing.

**Independent Test**: On the CRD design version, open `/admin/transfer`, exercise each conversion and transfer sub-flow against test data using the account picker, and confirm the same server effects and the same confirmations/warnings as MUI.

**Acceptance Scenarios**:

1. **Given** the Transfer section, **When** it loads, **Then** the same prominent destructive-operation warning shown in MUI is present.
2. **Given** the Conversions area, **When** the admin converts a space or a virtual contributor, **Then** the operation behaves identically to MUI and requires explicit confirmation before execution.
3. **Given** the Transfers area, **When** the admin transfers a space / innovation hub / innovation pack / virtual contributor / callout, **Then** the account search/picker behaves as in MUI and the transfer produces the same result, gated by confirmation.

---

### User Story 9 - Layout section parity (Priority: P3)

A platform admin opens the **Layout** section and finds it behaving exactly as in MUI (currently a placeholder/empty section reserved for future use). Its presence and position in the navigation are preserved so the CRD admin is a complete one-to-one replacement.

**Why this priority**: It is a placeholder today; replicating it is trivial but necessary for exact navigational parity. Lowest priority because it carries no functional behavior.

**Independent Test**: On the CRD design version, open `/admin/layout` and confirm it renders the CRD equivalent of the MUI placeholder, with the section present in navigation.

**Acceptance Scenarios**:

1. **Given** the admin navigation, **When** the admin views it, **Then** the Layout section appears in the same position as MUI.
2. **Given** the Layout section, **When** opened, **Then** it renders the CRD equivalent of the current MUI placeholder without error.

---

### Edge Cases

- **Access revoked mid-session**: A user whose platform-admin privilege is removed while viewing the CRD admin is denied on the next gated action/navigation, consistent with MUI.
- **Empty results**: Each list section renders an appropriate empty state when search returns nothing or no entities exist, consistent with MUI behavior.
- **Pagination boundaries**: "Show more"/server-paged lists behave correctly at the first and last page (no duplicate fetches, disabled controls where MUI disables them).
- **Concurrent mutation refresh**: After a delete/assign/revoke/verify mutation, the affected list refreshes to reflect the new server state, matching MUI's refetch behavior.
- **Destructive cancel**: Cancelling any confirmation dialog (delete, transfer, conversion) performs no server mutation.
- **Role-gated actions**: Actions limited to global admins in MUI (e.g. change-email) remain hidden/blocked for non-global-admins in CRD.
- **Deep links & refresh**: Reloading on any admin sub-route (including detail/edit and history pages) re-renders the correct CRD section with the section active.
- **Direct navigation while on MUI design version**: Visiting any `/admin/*` URL on the MUI design version always yields the MUI admin; the CRD admin is never shown to MUI users and vice versa.
- **Markdown/rich text fields**: Any admin field that stores markdown (e.g. organization/profile descriptions) is rendered and edited the way the CRD design system handles rich text, not as raw markup.
- **Unsaved edits**: Navigating away from an admin edit form with unsaved changes prompts to discard, consistent with the CRD unsaved-edits guard used elsewhere.

## Requirements *(mandatory)*

### Functional Requirements

#### Shell, navigation & access (P1)

- **FR-001**: The system MUST render the entire global admin area (`/admin` and all sub-routes) in the CRD design system for users on the CRD design version, while continuing to render the unchanged MUI admin for users on the MUI design version, selected at the route level by the existing design-version toggle.
- **FR-002**: The CRD admin MUST present a navigation between admin sections that includes every section present in the MUI admin — Spaces, Users, Organizations, Innovation Packs, Innovation Hubs, Virtual Contributors, Global Authorization (Roles), Authorization Policies, Transfer & Conversions, and Layout — in the same order, using the same section paths.
- **FR-003**: The CRD admin MUST gate access using the same privilege as the MUI admin (platform-admin privilege); users lacking it MUST be denied/redirected exactly as in MUI.
- **FR-004**: Every admin URL (section, detail, edit, and history routes) MUST be deep-linkable and survive a page reload with the correct section rendered active.
- **FR-005**: The CRD admin MUST live in the CRD shell (CRD header/footer) and MUST NOT import or render any MUI/Emotion components, consistent with CRD layer rules.

#### Spaces (P1)

- **FR-010**: The Spaces section MUST list all platform spaces in a searchable table with columns Name (linking to the space), Visibility (active/archived), Privacy Mode (public/private), and Account Owner, matching the MUI data and ordering.
- **FR-011**: The Spaces list MUST support search by display name and the same "show more" pagination behavior as MUI.
- **FR-012**: For each space, the admin MUST be able to open a settings view to manage that space's license plans (assign/revoke), with the same available plans and effects as MUI.
- **FR-013**: The admin MUST be able to delete a space they have update rights to, via a CRD confirmation dialog; on confirm the space is deleted and the list refreshes; on cancel nothing happens.

#### Users (P1)

- **FR-020**: The Users section MUST list platform users in a searchable, server-paginated table matching the MUI page size and ordering, searchable by first name, last name, and email.
- **FR-021**: The admin MUST be able to open a user's detail/edit view showing the same fields as MUI and to edit and save the same fields with the same validation.
- **FR-022**: The admin MUST be able to delete a user via a CRD confirmation dialog, with the list refreshing on confirm and no action on cancel.
- **FR-023**: A global admin MUST be able to change a user's email via the same flow as MUI; this action MUST be hidden/blocked for non-global-admins, matching MUI.
- **FR-024**: The admin MUST be able to view a user's email-change history (including per-change outcome status) and resolve an email "drift" via the same flows as MUI.
- **FR-025**: The admin MUST be able to manage (assign/revoke) the license plans on a user's account, with the same available plans and effects as MUI.

#### Organizations (P1)

- **FR-030**: The Organizations section MUST list organizations in a searchable, server-paginated table matching MUI, searchable by display name.
- **FR-031**: The admin MUST be able to create a new organization via a form with the same fields and validation as MUI (identity, contact email, domain, legal entity name, website, display name, description, tagline, references, avatar).
- **FR-032**: The admin MUST be able to open and edit an existing organization, updating the same fields with the same validation as MUI.
- **FR-033**: The admin MUST be able to toggle an organization's verification status with the same states/transitions as MUI, reflected in the row.
- **FR-034**: The admin MUST be able to manage (assign/revoke) license plans on an organization's account, matching MUI.
- **FR-035**: The admin MUST be able to delete an organization via a CRD confirmation dialog, with list refresh on confirm and no action on cancel.

#### Global Authorization / Roles (P2)

- **FR-040**: The Global Authorization section MUST offer the same set of global roles as MUI for selection.
- **FR-041**: For a selected role, the system MUST display the current members of that role.
- **FR-042**: The admin MUST be able to search available users and add one to the selected role, and to remove an existing member, with the same effects as MUI.

#### Innovation Packs / Hubs / Virtual Contributors (P2)

- **FR-050**: The Innovation Packs, Innovation Hubs, and Virtual Contributors sections MUST each list their entities in a searchable table with columns Name (link), Listed in Store, Search Visibility (public/internal), and Account Owner, with the same client-side "show more" pagination as MUI.
- **FR-051**: Innovation Packs and Innovation Hubs MUST support deleting an item via a CRD confirmation dialog with list refresh on confirm; Virtual Contributors MUST remain a read-only listing with no delete action, matching MUI.
- **FR-052**: Each row in these sections MUST link to the same destination as MUI.

#### Authorization Policies (P3)

- **FR-060**: The Authorization Policies section MUST let the admin look up a policy by ID and display its type, credential rules (name, cascade flag, granted privileges, criteria), and privilege rules (name, source privilege, granted privileges), matching MUI.
- **FR-061**: The admin MUST be able to look up the privileges granted to a specific user within a loaded policy, matching MUI.
- **FR-062**: Unknown/invalid policy lookups MUST surface the same not-found/error feedback as MUI.

#### Transfer & Conversions (P3)

- **FR-070**: The Transfer & Conversions section MUST present the same prominent destructive-operation warning as MUI.
- **FR-071**: The section MUST support space conversion and virtual-contributor conversion with identical behavior to MUI, each requiring explicit confirmation before execution.
- **FR-072**: The section MUST support transferring a space, innovation hub, innovation pack, virtual contributor, and callout between accounts using an account search/picker, with identical behavior to MUI, each gated by confirmation.

#### Layout (P3)

- **FR-080**: The Layout section MUST render the CRD equivalent of the current MUI placeholder and remain present in the navigation in the same position.

#### Cross-cutting

- **FR-090**: All destructive actions in the CRD admin (delete user/org/space/pack/hub, remove role member, transfer, convert) MUST be confirmed through the CRD confirmation dialog before the mutation fires; cancelling performs no mutation.
- **FR-091**: All admin user-visible strings MUST be provided through the CRD i18n mechanism (no hardcoded text), covering all supported CRD languages, consistent with how other CRD features are translated.
- **FR-092**: The CRD admin MUST reuse the established CRD settings/table/form/dialog patterns (settings shell + tab/section navigation, searchable tables, form fields, confirmation dialogs) rather than introducing parallel one-off implementations, and MUST keep presentation (CRD components) separate from data fetching/mapping (integration layer), consistent with SOLID separation of concerns.
- **FR-093**: The CRD admin MUST reuse the existing GraphQL data layer (queries/mutations/hooks) of the MUI admin without changing server behavior; only the presentation layer is new.
- **FR-094**: After any mutation (create, delete, assign/revoke, verify, transfer, convert), the affected list/view MUST refresh to reflect the new server state, matching MUI's refetch behavior.
- **FR-095**: The CRD admin MUST preserve the same per-action authorization gating as MUI (e.g. update/delete rights per row, global-admin-only email change), showing/enabling actions only when the user is permitted.
- **FR-096**: The MUI admin files MUST remain in the codebase and continue to function as the default for MUI-design-version users; this feature MUST NOT delete or alter the legacy admin behavior.
- **FR-097**: Every CRD admin section, list, form, and dialog MUST be covered by automated tests verifying behavioral parity with the MUI admin (data shown, actions available, gating, confirmations, post-mutation refresh).

### Key Entities *(include if feature involves data)*

- **Platform Admin (actor)**: A user holding the platform-admin privilege (and possibly higher global roles). Determines access to the admin area and to role-gated actions.
- **Global Role**: A platform-wide role (Global Admin, Global Support, Global License Manager, Global Community Reader, Global Spaces Reader, Global Platform Manager, Global Support Manager, Platform Beta Tester, Platform VC Campaign) with a membership set of users.
- **User (admin view)**: A platform user with profile fields, email, email-change history/outcomes, and an account that can hold license plans.
- **Organization (admin view)**: An organization with identity/contact/legal/profile fields, a verification status, and an account that can hold license plans.
- **Space (admin view)**: A space with visibility (active/archived), privacy mode (public/private), an account owner, and license plans.
- **Innovation Pack / Innovation Hub / Virtual Contributor (admin view)**: Store-listable entities with a name, "listed in store" flag, search visibility (public/internal), and account owner.
- **License Plan**: A plan that can be assigned to or revoked from a user/organization/space account.
- **Authorization Policy**: A policy identified by ID, composed of a type, credential rules, and privilege rules, against which a user's effective privileges can be inspected.
- **Transfer/Conversion Operation**: A destructive operation moving or converting an entity (space, innovation hub, innovation pack, virtual contributor, callout) between accounts or types, using an account picker.
- **Design Version Preference**: The per-user setting (MUI vs CRD) that selects which admin implementation renders at `/admin`.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of the admin sections present in the MUI admin (Spaces, Users, Organizations, Innovation Packs, Innovation Hubs, Virtual Contributors, Global Authorization, Authorization Policies, Transfer, Layout) are available and reachable in the CRD admin at the same URLs.
- **SC-002**: 100% of the admin actions available in MUI (list, search, paginate, open/edit, create, delete, verify, change email, view/resolve email history, manage license plans, manage role members, inspect policies, look up user privileges, transfer, convert) are available in the CRD admin and produce the same server outcome.
- **SC-003**: For every list section, the data shown (columns, values, ordering) and search/pagination behavior match the MUI admin for the same inputs.
- **SC-004**: Access control parity is exact: every user who can/cannot reach the MUI admin (or a role-gated action within it) has the identical ability in the CRD admin.
- **SC-005**: A user on the CRD design version never sees an MUI-rendered admin screen, and a user on the MUI design version never sees a CRD-rendered admin screen, across all `/admin/*` routes including detail/edit/history.
- **SC-006**: Every destructive admin action requires an explicit CRD confirmation, and cancelling it results in zero server mutations (verified for each destructive action).
- **SC-007**: All admin user-visible text renders translated in every supported CRD language with no missing keys and no hardcoded strings.
- **SC-008**: Automated tests cover behavioral parity for every section and action, and the full test suite passes; linting passes with zero MUI/Emotion imports in the new CRD admin code.
- **SC-009**: After any admin mutation, the relevant view reflects the new server state without a manual reload, matching MUI.
- **SC-010**: The legacy MUI admin remains fully functional for MUI-design-version users (no regression) throughout and after the migration.

## Assumptions

- **Visual-only migration**: All business logic, GraphQL operations, validation, authorization, and server-side effects are preserved unchanged; only the presentation layer is reimplemented in CRD. The existing data hooks/queries/mutations are reused as-is.
- **Coexistence model**: The CRD admin follows the same coexistence/toggle pattern as other migrated pages — the MUI admin files stay in place and remain the default for MUI-design-version users; CRD admin renders only when the design version is CRD. No removal of legacy files is in scope for this feature.
- **Reused CRD patterns**: The implementation builds on the existing CRD settings shell, section/tab navigation, searchable tables, form fields, and confirmation dialogs already used by Space Settings, User Settings, and Organization Settings, rather than inventing new layout paradigms.
- **i18n**: Admin strings are added to the CRD (manually/AI-maintained) translation namespaces for all supported languages (en, nl, es, bg, de, fr), following the CRD i18n conventions; they are not managed via Crowdin. The do-not-translate platform-term glossary applies where relevant.
- **Section set is "as-is"**: The CRD admin replicates exactly the sections and behaviors that exist in the MUI admin today (including the Layout placeholder). New admin capabilities are out of scope.
- **Detail pages count as part of their section**: Sub-routes such as user detail/edit, user email-change history, and organization create/edit are migrated together with their parent section, not as separate stories.
- **Default design version**: Because the platform default design version is CRD, the CRD admin becomes the experience most admins see once shipped; this raises the bar for parity and test coverage but does not change the toggle mechanics.
- **Out of scope**: Removing the toggle, deleting MUI admin files, and any redesign or new functional capability beyond what MUI admin offers today.
