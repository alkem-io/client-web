# Feature Specification: Account Templates in Template Picker Dialog

**Feature Branch**: `041-account-templates-dialog`  
**Created**: 2026-04-03  
**Status**: Draft  
**Input**: GitHub Issue [#9476](https://github.com/alkem-io/client-web/issues/9476) — "Using templates that are only visible in the account"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See Account Templates When Creating a Space (Priority: P1)

As a facilitator, I want to see my account's private templates when creating a new Space, so that I can use templates I created without making them public.

Currently, when a facilitator creates a Space and opens the templates picker, only Space-level and Platform-level templates are shown. Private templates belonging to the facilitator's account are invisible, forcing users to make templates public before they can be used — which defeats the purpose of having private template packs.

**Why this priority**: This is the core problem described in the issue. Facilitators creating new communities are blocked because they cannot access their own private templates. This directly impacts onboarding of new communities.

**Independent Test**: Can be fully tested by creating a private template pack with a Space template in an account, then starting the "Create Space" flow and verifying the template appears in the picker dialog under an "Account templates" section.

**Acceptance Scenarios**:

1. **Given** a facilitator has a private template pack in their account containing a Space template, **When** they open the templates picker during Space creation, **Then** they see an "Account templates" section at the top of the dialog displaying their account's Space templates.
2. **Given** a facilitator's account has no Space templates (or no template packs), **When** they open the templates picker during Space creation, **Then** the "Account templates" section is not shown at all.
3. **Given** a facilitator has both Account-level and Platform-level Space templates available, **When** they open the templates picker during Space creation, **Then** the "Account templates" section appears first, followed by "Platform templates" below.

---

### User Story 2 - See Account Templates When Creating a Post from Template (Priority: P1)

As a facilitator, I want to see my account's Post templates in the template picker when creating a Post in a Space, so that I can apply consistent formatting using templates I manage at the account level.

**Why this priority**: The issue explicitly calls out Post template selection as a use case with a defined section order. This is equally critical as Space template selection since post creation from templates is a frequent facilitator action.

**Independent Test**: Can be fully tested by creating a private template pack with a Post template, then creating a Post in a Space and verifying the template picker shows "Space templates", "Account templates", and "Platform templates" sections in that order.

**Acceptance Scenarios**:

1. **Given** a facilitator creates a Post in a Space and opens the template picker, **When** account-level Post templates exist, **Then** the dialog shows three sections in order: "Space templates" (top), "Account templates" (middle), "Platform templates" (bottom).
2. **Given** no account-level Post templates exist, **When** the facilitator opens the Post template picker, **Then** only "Space templates" and "Platform templates" sections are shown (the "Account templates" section is hidden).
3. **Given** the facilitator selects an account-level Post template, **When** they confirm the selection, **Then** the Post is pre-filled with the selected template's content, identical to how Space or Platform templates work today.

---

### User Story 3 - Account Templates for All Template Types (Priority: P2)

As a facilitator, I want the account templates section to work consistently across all template types (Space, Post, Whiteboard, Callout, Community Guidelines), so that the template picking experience is uniform regardless of what I'm creating.

**Why this priority**: While the issue specifically mentions Space and Post templates, the template picker dialog is shared across all template types. Implementing account templates only for some types would create an inconsistent experience and require rework later.

**Independent Test**: Can be tested by creating account-level templates of different types and verifying the "Account templates" section appears in each respective template picker dialog.

**Acceptance Scenarios**:

1. **Given** a facilitator opens any template picker dialog (Space, Post, Whiteboard, Callout, Community Guidelines), **When** account-level templates of that type exist, **Then** the "Account templates" section is shown with the relevant templates.
2. **Given** a template type has no account-level templates, **When** the picker for that type is opened, **Then** the "Account templates" section is hidden for that type only.

---

### Edge Cases

- What happens when a facilitator is a member of a Space owned by a different account? Each user has one account, but they may be a member of Spaces owned by other accounts. The system shows templates from the account that owns the current Space — not the facilitator's personal account. During Space creation, the account is determined by the `CreateSpace` component's resolution logic (explicit `accountId` prop or fallback to `useCurrentUserContext().accountId`). Within an existing Space (Post, Callout, Whiteboard creation), this is the Space's owning `account.id` from `SpaceContext`, which may differ from the current user's personal account.
- What happens when account templates are loading? A loading indicator should be shown in the "Account templates" section while data is being fetched, consistent with how Platform templates currently load.
- What happens when a template pack is toggled from private to public (or vice versa) while the dialog is open? The dialog should reflect the state at the time it was opened; no live-refresh is required.
- What happens when there are many account templates? The section should be scrollable, consistent with how Space and Platform template sections handle overflow.
- What happens when a public account template also appears in Platform templates? Both sections show it independently — no deduplication is performed.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The template picker dialog MUST display an "Account templates" section showing templates from the user's account that match the requested template type.
- **FR-002**: The "Account templates" section MUST only be displayed when there is at least one template of the relevant type in the account.
- **FR-003**: The section order in the template picker dialog MUST be context-dependent:
  - **Space creation**: "Account templates" (top), "Platform templates" (bottom).
  - **Post, Callout, Whiteboard, and other template types**: "Space templates" (top), "Account templates" (middle), "Platform templates" (bottom).
- **FR-004**: Account templates MUST be selectable and apply their content identically to how Space and Platform templates work today.
- **FR-005**: The account templates section MUST include templates from all template packs (innovation packs) within the account, regardless of whether those packs are public or private. Templates from multiple packs MUST be merged into a single flat list (no grouping by pack).
- **FR-006**: Account templates MUST be filterable by template type, consistent with the existing filtering for Space and Platform templates.
- **FR-007**: The template picker MUST show a loading state while account templates are being fetched.
- **FR-008**: Account templates MUST load eagerly when the dialog opens (same behavior as Space templates), not lazily behind a user action like Platform templates.

### Key Entities

- **Account**: The organizational container that owns template packs. Each account can have multiple innovation packs, each containing a templates set.
- **Innovation Pack**: A grouping of templates within an account. Can be public or private. Contains a templates set with various template types.
- **Templates Set**: A collection of templates of various types (Space, Post, Whiteboard, Callout, Community Guidelines) belonging to an innovation pack.
- **Template**: An individual template of a specific type, used to pre-fill content when creating Spaces, Posts, Whiteboards, etc.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Facilitators with private account templates can see and select those templates in the template picker without making them public — 100% of account templates of the relevant type are displayed.
- **SC-002**: The template picker dialog presents all three sections (Space, Account, Platform) in the correct order when all are available.
- **SC-003**: The "Account templates" section is hidden when no account templates of the relevant type exist — no empty sections are shown.
- **SC-004**: Selecting an account template produces the same result as selecting a Space or Platform template — template content is applied correctly with no difference in behavior.
- **SC-005**: Account templates load eagerly and render within the same timeframe as existing Space templates — no additional user-perceived latency compared to the current template picker experience (verified by FR-008 eager loading strategy).

## Clarifications

### Session 2026-04-03

- Q: Should account templates load eagerly (with dialog open) or lazily (behind a link click like Platform templates)? → A: Eager — load and display immediately when the dialog opens.
- Q: When an account has multiple innovation packs, should templates be shown as a flat list or grouped by pack? → A: Flat list — merge all templates from all account packs into one "Account templates" section.
- Q: If a template exists in both a public account pack and the Platform library, should it appear in both sections or be deduplicated? → A: No dedup — show in both sections; each section represents an independent data source.

## Assumptions

- The backend GraphQL API already supports (or will support) querying account-level templates from innovation packs. If a new query or field is needed, that is a backend dependency outside the scope of this client-side specification.
- The "account" in context is the Space's owning account: for Space creation, this equals the user's own account (obtained via `useCurrentUserContext().accountId`); for within-Space operations (Post, Callout, Whiteboard, etc.), this is the Space's owning `account.id` exposed via `SpaceContext`. The `SpaceAboutBase` query must be extended to include `account { id }` so this field is available.
- Template packs within an account may be public or private; both should be included in the "Account templates" section since the user is the account owner/member.
- The existing template card display (preview, selection behavior) is reused for account templates — no new card design is needed.
