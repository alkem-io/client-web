# Feature Specification: Default Post Template for Flow Steps

**Feature Branch**: `001-flow-post-template`
**Created**: 2026-01-09
**Status**: Draft
**Input**: User description: "Configure a default post template for a flow so that every new post starts from a consistent structure chosen by the admin. Add functionality in Layout Settings to let admins define a default post template for a flow. The option appears under the three-dot menu in the Layout section and opens a dialog where the admin can view, add, remove, or update the selected template. When set, this template automatically loads in the 'Add Post' dialog for members in the exact flow step, ensuring consistent post structure across the flow."

## User Scenarios & Testing _(mandatory)_

### User Story 1 - Admin Sets Default Template for Flow Step (Priority: P1)

As a Space admin, I want to set a default post template for a specific flow step (e.g., "Ideation" phase), so that all posts created in that step automatically start with a consistent structure, ensuring quality and completeness across all contributions.

**Why this priority**: This is the core value proposition - enabling admins to enforce consistency. Without this, the feature delivers no value.

**Independent Test**: Can be fully tested by navigating to Layout Settings, opening a flow step's menu, selecting a template, and verifying it's saved. Delivers immediate value by establishing the template configuration.

**Acceptance Scenarios**:

1. **Given** I am an admin viewing Layout Settings with innovation flow steps displayed, **When** I click the three-dot menu on any flow step, **Then** I see an option "Set Default Post Template"
2. **Given** I click "Set Default Post Template", **When** the dialog opens, **Then** I see the Template Library dialog showing available callout templates
3. **Given** no template is currently set for this flow step, **When** the template dialog opens, **Then** I see a message indicating "No default template set" and a list of available templates
4. **Given** a template is already set for this flow step, **When** the template dialog opens, **Then** I see the currently selected template clearly displayed at the top with label "Current template: [Template Name]"
5. **Given** I am viewing available templates in the dialog, **When** I select a template, **Then** the template is set as the default for this flow step and the dialog closes
6. **Given** I select the same template that is already set as default, **When** I click it, **Then** nothing happens - the "Preview - ..." dialog is closed and "Template Library: Collaboration Tool Template" dialog remains open, no API request is made
7. **Given** I have set a default template, **When** I reopen the flow step's template dialog, **Then** I can see and verify which template is currently selected

---

### User Story 2 - Member Creates Post with Default Template (Priority: P1)

As a Space member, when I create a new post in a flow step that has a default template configured, I want the post creation dialog to automatically pre-fill with the template content, so I can quickly create a well-structured post without starting from scratch.

**Why this priority**: This is the user-facing benefit and the reason the feature exists. Without this, setting templates has no impact on members.

**Independent Test**: Can be fully tested by creating a post in a flow step with a configured template and verifying the content is pre-filled. Delivers immediate value to members through improved post creation experience.

**Acceptance Scenarios**:

1. **Given** a flow step has a default template configured by an admin, **When** I click "Add Post" in that flow step, **Then** the post creation dialog opens with the template content pre-filled in all fields and selections pre-set where relevant
2. **Given** the post creation dialog has opened with template content, **When** I review the pre-filled content, **Then** I can see the full template structure including any formatting, headings, or placeholder text
3. **Given** template content is pre-filled, **When** I edit the content, **Then** I can freely modify, add, or remove any part of the template
4. **Given** I have modified the template content, **When** I create the post, **Then** my modifications are saved (the post is not linked to the template, just initialized from it)
5. **Given** a flow step has no default template configured, **When** I click "Add Post", **Then** the dialog opens with an empty description field (or any other existing default from callout settings)

---

### User Story 3 - Admin Manages Templates (Remove/Change) (Priority: P2)

As a Space admin, I want to remove or change the default template for a flow step, so I can update the post structure as our space's needs evolve or remove it entirely if no longer needed.

**Why this priority**: Important for maintenance and flexibility.

**Independent Test**: Can be fully tested by setting a template, then removing or changing it, and verifying posts created afterward reflect the change. Delivers value through template lifecycle management.

**Acceptance Scenarios**:

1. **Given** a flow step has a default template set, **When** I open the template dialog and select a different template, **Then** the new template replaces the old one as the default
2. **Given** a flow step has a default template set, **When** I want to remove it, **Then** I see a "Remove Template" button in the dialog
3. **Given** I click "Remove Template", **When** the removal is confirmed, **Then** the default template is cleared from this flow step and future posts will not be pre-filled
4. **Given** I have removed or changed a template, **When** members create new posts in that flow step, **Then** they see the updated behavior (new template or no template)
5. **Given** I have changed a template, **When** I view existing posts created with the old template, **Then** they remain unchanged (posts are not linked to templates)

---

### Edge Cases

- **What happens when a template that is set as default is deleted from the system?** The flow step's default template reference becomes null, and posts in that flow step revert to no-template behavior (empty form or callout defaults). No error is shown to users.
- **What happens when creating a space template from a space with flow steps that have default templates configured?** The space template does not preserve the default template references. Default template configuration is instance-specific, not part of the template structure.
- **What happens if a flow step has both a default template AND a callout-level default description?** The template takes precedence. If no template is set, the callout-level default is used (existing fallback behavior).
- **What happens when multiple flow steps use the same template?** They all reference the same template. Changing the template content affects all flow steps using it, but each flow step can independently change which template it references.
- **What happens if someone tries to set a non-callout template (e.g., whiteboard template) as a default?** The dialog only shows callout templates - other template types are filtered out and cannot be selected.

## Requirements _(mandatory)_

### Functional Requirements

#### Admin Configuration

- **FR-001**: System MUST add a "Set Default Post Template" option to the three-dot menu of each flow step in Layout Settings
- **FR-002**: System MUST open the existing Template Library dialog when admin clicks "Set Default Post Template"
- **FR-003**: Template Library dialog MUST filter to show only CALLOUT type templates (no POST, WHITEBOARD, SPACE, or other types)
- **FR-004**: Template Library dialog MUST display templates from both the space's template library AND the platform library (public templates)
- **FR-005**: Dialog MUST clearly indicate if a template is already set as the default for this flow step with message "Current template: [Template Name]"
- **FR-006**: Dialog MUST display a "No default template set" message when no template is currently configured
- **FR-007**: System MUST prevent duplicate selection: if admin selects the same template that is already set, no action occurs (dialog stays open, no API calls)
- **FR-008**: System MUST provide a way to remove the default template (e.g., "Remove Template" button visible when a template is set)
- **FR-009**: System MUST allow each flow step to have its own independent default template (different steps can use different templates)
- **FR-010**: System MUST allow multiple flow steps to share the same template (if desired)

#### Member Experience

- **FR-011**: System MUST load the default template content when a member opens the "Add Post" dialog in a flow step with a configured template
- **FR-012**: Template content MUST pre-fill the post description field in the creation dialog
- **FR-013**: Members MUST be able to freely edit, modify, or delete the pre-filled template content before creating the post
- **FR-014**: System MUST NOT create a persistent link between the created post and the template (post is initialized from template but not bound to it)
- **FR-015**: When no default template is set, system MUST fall back to existing behavior (empty post or callout-level contributionDefaults)

#### Data & Persistence

- **FR-016**: System MUST store the default template reference on each InnovationFlowState entity
- **FR-017**: Default template reference MUST be optional (nullable) - flow steps can exist without a default template
- **FR-018**: When a template used as a default is deleted, system MUST set the referencing flow state's defaultTemplate to null (no orphaned references)
- **FR-019**: When creating a space template from a space, system MUST NOT preserve default template references in flow states (they should be null in the template)
- **FR-020**: System MUST support templates from any accessible library (space-specific or platform-wide), following existing template visibility rules

### Key Entities

- **InnovationFlowState**: Represents a phase/step in an innovation flow (e.g., "Ideation", "Development", "Testing"). Each state can have an optional reference to a default callout template.
- **Template (Callout Type)**: A reusable structure for posts that includes a default description with formatting, placeholders, and guidance. Can be from space library or platform library.
- **Post**: A contribution created by a member within a callout. When created in a flow step with a default template, it is initialized with the template content but not persistently linked to it.
- **Callout**: A framing element that groups posts. Has contribution defaults that serve as fallback when no flow-level template is set.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: Admins can configure a default template for a flow step in under 60 seconds
- **SC-002**: When a default template is set, 95% of posts created in that flow step use the template (measured by posts that contain template structure markers)
- **SC-003**: Template selection dialog responds in under 500ms from menu click to fully rendered dialog
- **SC-004**: Members creating posts in templated flow steps report improved post quality and reduced time to create well-structured posts (measured through user feedback or surveys)
- **SC-005**: Zero errors or broken references when templates used as defaults are deleted from the system
- **SC-006**: Duplicate template selection attempts result in zero unnecessary API calls (verified through monitoring)

## Assumptions

- The backend has already implemented the necessary schema changes to support `defaultCalloutTemplate` field on `InnovationFlowState`
- The backend has implemented mutations `setDefaultCalloutTemplateOnInnovationFlowState` and `removeDefaultCalloutTemplateOnInnovationFlowState`
- The existing Template Library dialog (`ImportTemplatesDialog`) can be reused with minor modifications for the subtitle/current template display
- Callout templates have a `contributionDefaults.postDescription` field that contains the template content
- Authorization for setting templates follows the same rules as editing flow states (requires UPDATE privilege on innovation flow)
- Template content is markdown-formatted text
- The "Add Post" dialog has access to flow step context (either directly or through parent components)

## Out of Scope

- Setting default templates for other contribution types (whiteboards, links, memos) - only posts are supported
- Template versioning or tracking changes to template content
- Automatically updating existing posts when a template is modified
- Bulk setting templates for multiple flow steps at once
- Template preview before setting as default
- Analytics or reporting on template usage
- Template inheritance between parent/child spaces
- Setting different templates for different user roles within the same flow step
