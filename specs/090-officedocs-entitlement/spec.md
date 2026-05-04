# Feature Specification: Entitlement-Gated Visibility of Collabora Document Callout Type

**Feature Branch**: `090-officedocs-entitlement`
**Created**: 2026-04-23
**Status**: Draft
**Input**: User description: "I want to use the entitlement Space Flag OfficDocs to control whether the user sees the option to create a callout of type CollaboraDocs. If the entitlement is not there this option should not be shown. If it is there then we know that the mutation to create the post will succeed on the server i.e. we are trying prevent errors by giving the user just the options that they can execute. Note that as the feature is not fully released we want to hide the option, and not just disable it."

## Clarifications

### Session 2026-04-23

- Q: Does the entitlement gate also apply to the callout template picker (creating a callout from a saved template of type Collabora Document)? → A: No templates of type Collabora Document exist today (the type is unreleased), so the picker has no such entries to hide. The spec still requires the template-import path (`useCalloutTemplateImport` inside `CreateCalloutDialog`) to honour the gate defensively, so that if such a template is ever introduced it cannot be imported into an unentitled Collaboration.
- Q: Where is the Office Documents entitlement read from — the Space, the Collaboration, or the Account's license? → A: From the Collaboration object's license (not the Space). Each Collaboration carries its own license with entitlements, and the check evaluates the entitlement on the Collaboration that owns the callout being created.
- Q: Beyond the "create new callout" type selector, what other UI paths can create a Collabora Document callout, and must they also be gated? → A: Block any template-import path and any library-copy path (currently realised via `useCalloutTemplateImport` wired into `CreateCalloutDialog`). Callout duplication is not a feature in this codebase today (no `duplicateCallout`/`copyCallout` mutations or UI flows exist), so no gate is required there; should duplication be introduced in future, the same gate must apply.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Hide Collabora Document Option in Spaces Without the Entitlement (Priority: P1)

A space member with permission to create callouts is in a space that has **not** been granted the Office Documents entitlement. When they open the callout-type selector (the UI where they choose what kind of callout to create — posts, whiteboards, etc.), the Collabora Document option is not present. They see only the callout types the space is entitled to use, and the UI gives no indication that Collabora Documents exist as a possibility.

**Why this priority**: This is the core behaviour the feature exists to deliver. The Collabora Document callout type is not yet fully released, so it must be completely hidden — not merely disabled — in spaces that have not opted in. Showing a disabled or greyed-out option would leak the existence of an unreleased feature and invite support queries. Getting this wrong is the only way the feature can fail visibly to end users.

**Independent Test**: In a space whose Collaboration license does **not** include the Office Documents entitlement, open the callout-creation UI as a user with contribute permissions. Verify that no option, menu item, icon, label, tooltip, or placeholder referring to Collabora Documents is visible anywhere in that UI — including both the type selector and the template-import / library-copy path. If a Collabora Document template can be constructed in a test fixture, confirm it is not surfaced in the template picker either.

**Acceptance Scenarios**:

1. **Given** a space without the Office Documents entitlement, **When** a member with contribute permission opens the callout-type selector, **Then** the Collabora Document option is not rendered (not shown as disabled, not shown with a "coming soon" label — entirely absent).
2. **Given** a space without the Office Documents entitlement, **When** a member scans the list of callout types, **Then** the set of visible types matches what is available to the space today, with no gap, placeholder, or hidden-behind-a-flag hint indicating a missing option.
3. **Given** a space without the Office Documents entitlement, **When** a member completes callout creation, **Then** the resulting callout is one of the entitled types — the user could not have reached a state where a Collabora Document callout was creatable.

---

### User Story 2 - Show Collabora Document Option in Spaces With the Entitlement (Priority: P1)

A space member with permission to create callouts is in a space that **has** been granted the Office Documents entitlement. When they open the callout-type selector, the Collabora Document option appears alongside the other callout types. Selecting it and completing the creation flow succeeds — the entitlement guarantees the server will accept the creation request, so the user never sees a failure caused by an entitlement-based backend rejection.

**Why this priority**: Equal priority to Story 1 because the two together define the visibility rule. Without this story, entitled spaces would be wrongly prevented from using the feature they were provisioned for.

**Independent Test**: In a space whose license **does** include the Office Documents entitlement, open the callout-creation UI as a user with contribute permissions. Verify the Collabora Document option is present, selectable, and that completing the flow results in a successfully created callout of that type.

**Acceptance Scenarios**:

1. **Given** a space with the Office Documents entitlement, **When** a member with contribute permission opens the callout-type selector, **Then** the Collabora Document option is visible alongside the other entitled callout types.
2. **Given** a space with the Office Documents entitlement, **When** a member selects the Collabora Document option and submits the creation form, **Then** the server accepts the request and the new callout is created — the user does not encounter an entitlement-based error.
3. **Given** the same user has access to two spaces — one with the entitlement, one without — **When** they open the callout-type selector in each, **Then** the Collabora Document option appears only in the entitled space.

---

### Edge Cases

- **Entitlements still loading**: When the space's entitlement information has not yet resolved, the Collabora Document option MUST NOT appear. The default (and the state shown during loading) is "hidden" — the option only becomes visible once the entitlement is confirmed present. This fails safe: a user never briefly sees an option that later disappears.
- **Entitlement check fails or errors**: If the entitlement data cannot be retrieved, the Collabora Document option is treated as absent and hidden. The rest of the callout-type selector continues to function normally.
- **Existing Collabora Document callouts in a space that loses the entitlement**: Out of scope for this feature. This specification covers only whether the **creation option** is visible. Visibility, viewing, editing, or deletion of already-created Collabora Document callouts is governed by the callout feature itself (see `085-collabora-callout`) and is not changed by this spec.
- **Permission vs. entitlement distinction**: A user without contribute permission already does not see a callout-creation UI at all, so the entitlement check is only relevant for users who would otherwise be able to create callouts. This feature does not alter permission behaviour.
- **Entitlement toggled during a session**: If the entitlement changes while the user is on the space page, the visibility of the option SHOULD reflect the current entitlement state the next time the callout-type selector is opened. The feature does not require live push updates mid-interaction.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST determine, for each **Collaboration** the user interacts with (the entity that owns a space's callouts and carries its own license), whether that Collaboration has been granted the Office Documents (`SPACE_FLAG_OFFICE_DOCUMENTS`) entitlement on its license.
- **FR-002**: When a user opens any UI that offers a choice of callout types to create within a Collaboration, the system MUST include the Collabora Document option if and only if the Collaboration's license carries the Office Documents entitlement.
- **FR-003**: When the Office Documents entitlement is not present on the Collaboration, the system MUST omit the Collabora Document option entirely from the callout-type selector — the option MUST NOT appear as a disabled, greyed-out, "coming soon", or otherwise visible-but-unavailable control.
- **FR-004**: While the entitlement information for the Collaboration is still loading or cannot be determined, the system MUST behave as if the entitlement is absent (the option is hidden).
- **FR-005**: The entitlement gate MUST apply to every UI path that can initiate creation of a new Collabora Document callout in a Collaboration. Concretely, this covers:
  - **(a) The "create new callout" type selector** — any add-callout affordance on the space page, in a callout group header, etc. The Collabora Document option MUST be hidden when the Collaboration lacks the entitlement.
  - **(b) The callout template-import / library-copy path** — the flow that pre-fills a new-callout form from a saved callout template (currently realised via `useCalloutTemplateImport` wired into `CreateCalloutDialog`). Templates whose callout type is Collabora Document MUST NOT be presented as selectable options in an unentitled Collaboration, and MUST NOT be usable to create a callout there even if selected programmatically. This requirement is defensive: no such templates exist at the time of writing (the callout type is not fully released), but the path MUST be gated so that introducing such templates later cannot leak the feature retroactively.
  - There MUST NOT be any other path by which a user reaches the Collabora Document creation flow in an unentitled Collaboration.
- **FR-006**: The entitlement gate MUST NOT affect any behaviour outside of callout creation. Viewing, opening, editing, or deleting already-existing Collabora Document callouts is governed by the underlying callout feature and remains unchanged.
- **FR-007**: The entitlement check MUST be evaluated per Collaboration. A user who interacts with multiple Collaborations (e.g. a space and its sub-spaces, each with its own Collaboration) MUST see the option only in those whose Collaboration license individually carries the entitlement.
- **FR-008**: Callout duplication is not a feature of Alkemio at the time of writing — no `duplicateCallout`/`copyCallout` mutation or UI flow exists in the client codebase. No gating work is therefore required for duplication as part of this feature. Should callout duplication be introduced later, the same entitlement gate MUST apply so that a user cannot duplicate a Collabora Document callout into an unentitled Collaboration.

### Key Entities *(include if feature involves data)*

- **Space**: The user-facing container a member navigates to. A space references a Collaboration; it is not itself the carrier of the Office Documents entitlement for the purposes of this feature.
- **Collaboration**: The entity that owns a space's callouts and carries a License with a set of entitlements. This is the **source of truth** the client reads for the Office Documents gate — the check reads the entitlement from the Collaboration associated with the context in which callout creation is being offered. Each Collaboration carries its own license, so sub-spaces (each with their own Collaboration) are evaluated independently rather than inheriting from a parent.
- **Office Documents Entitlement (Space Flag)**: A boolean-style entitlement (server enum value `SPACE_FLAG_OFFICE_DOCUMENTS`, naming consistent with other `SPACE_FLAG_*` entitlements such as `SPACE_FLAG_WHITEBOARD_MULTI_USER` and `SPACE_FLAG_MEMO_MULTI_USER`) carried on a Collaboration's license, indicating that the license permits the creation and use of Collabora Document callouts within that Collaboration. Used here purely as the gate for surfacing the creation option; other consequences of the entitlement (such as enabling associated backend mutations) are out of scope for this spec.
- **Callout Type**: The kind of a callout (post, whiteboard, Collabora Document, etc.). This feature affects which callout types appear as selectable options in the creation UI; it does not introduce a new type.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In every space without the Office Documents entitlement, 0% of callout-creation UIs display the Collabora Document option (measured by manual verification in an unentitled test space and by unit/integration tests covering the selector component).
- **SC-002**: In every space with the Office Documents entitlement, 100% of callout-creation UIs display the Collabora Document option as selectable.
- **SC-003**: 0 user-facing errors caused by attempting to create a Collabora Document callout in an unentitled space are produced via the UI, because the creation flow is unreachable there. Any such error surfacing in telemetry after release indicates the gate is leaking.
- **SC-004**: A QA pass verifying the option is absent in an unentitled space (checking menus, tooltips, and placeholder text for any reference to Collabora or Office Documents) takes less than 5 minutes per space and passes on the first attempt.

## Assumptions

- The Office Documents entitlement is surfaced on the **Collaboration's License** in the same shape as the existing entitlement flags carried at that level (e.g. Memo Multi User, Whiteboard Multi User, Save As Template). This feature uses that existing mechanism; it does not define a new way of expressing entitlements.
- The entitlement is available to the client wherever the callout-type selector renders — the Collaboration (with its license/entitlements) is already fetched alongside the callouts it owns, so no new data-loading architecture is required.
- Callout creation is already permission-gated; this feature layers entitlement-gating on top of that existing permission check. Users without contribute permission continue to see no creation UI at all, regardless of entitlement.
- The backend is the source of truth for whether the Collabora Document mutation will succeed. The client's entitlement check is a UX-hygiene measure ("only show the user what they can do") and not a security boundary.
- "OfficDocs" in the user's input is understood to refer to the Office Documents space-flag entitlement carried on a Collaboration's license. The corresponding server enum value on the develop branch (added in server PR #5967) is `SPACE_FLAG_OFFICE_DOCUMENTS`, which the client codegen will surface as `LicenseEntitlementType.SpaceFlagOfficeDocuments`.

## Dependencies

- **Server schema availability**: The `SPACE_FLAG_OFFICE_DOCUMENTS` entitlement enum value exists on the server `develop` branch but is not yet present in this client's generated GraphQL types (`src/core/apollo/generated/`). Implementation of this spec depends on either (a) regenerating the client's GraphQL types against an updated backend, or (b) introducing a short-term placeholder constant that matches the server enum value and swapping to the generated enum once codegen is run. The planning phase must address this sequencing — the spec itself does not dictate which approach is taken.
- **Collaboration license reachability**: Any GraphQL query feeding the callout-type selector must ensure the relevant Collaboration's license entitlements are included in the response. If a selector is rendered in a context where the current query does not yet fetch `collaboration.license.availableEntitlements` (or the equivalent), the query will need to be extended. This is a planning concern; the spec mandates the result (gate works everywhere) but not the specific query changes.
- **Feature 085 (Collabora Document callout)**: This spec gates the creation option introduced by feature `085-collabora-callout`. It does not redefine or modify Collabora callout behaviour; it controls visibility only.
