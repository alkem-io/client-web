# Feature Specification: Streamlined Template Pack Experience

**Feature Branch**: `001-template-pack-ux`
**Created**: 2026-02-16
**Status**: Draft
**Input**: User description: "As a facilitator I want to easily use templates across various spaces. This is currently not a smooth process. Currently, they need to create a post with whiteboard, then go to their org profile, go to the template pack, add a post, copy everything, then create, then go to Space B and use the template. Also for new facilitators, it is not easy to use the templates shown in the platform library in the space. Also for methodology providers, they point people to the library to see their templates, but then the user can't do anything with it. They have to go to the Space and find the template."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Direct Template Pack Addition (Priority: P1)

As a facilitator working in a space, I want to add posts and subspace templates directly to my organization's template pack without leaving my current context, so I can build reusable template collections efficiently.

**Why this priority**: This is the core pain point blocking facilitators from creating template packs. Currently requires navigating away from the creation context, causing friction and lost productivity. Addresses the primary user complaint about the cumbersome workflow.

**Independent Test**: Can be fully tested by creating a post/subspace with template option, selecting "Save as template to template pack", choosing a pack from the dialog, and verifying the template appears in the selected pack with success confirmation.

**Acceptance Scenarios**:

1. **Given** I am a facilitator creating a post with a whiteboard in Space A, **When** I choose "Save as template", **Then** I see two options: "Save to space library" and "Save to template pack"
2. **Given** I select "Save to template pack", **When** the dialog opens, **Then** I see a list of all template packs I have admin rights to, with clear pack names and descriptions (truncated)
3. **Given** I select a template pack from the dialog and confirm, **When** the save completes, **Then** I see a success message "Successfully saved to [Pack Name]" with options to "View template pack" or "Close"
4. **Given** I click "View template pack" after saving, **When** the navigation completes, **Then** I see the template pack details page with my newly added template visible
5. **Given** I click "Close" after saving, **When** the dialog closes, **Then** I remain in my current context (the space where I created the template)
6. **Given** I am creating a subspace template in Space A, **When** I choose "Save as template to template pack", **Then** I follow the same dialog flow as with post templates
7. **Given** I do not have admin rights to any template packs, **When** I choose "Save as template", **Then** the "Save to template pack" option is greyed out with a message "You don't have admin rights to any template packs"
8. **Given** saving a template to a pack fails (e.g., due to size limits, network error, permission issue), **When** the error occurs, **Then** I see a specific error message explaining the issue with options to "Retry" or "Cancel"
9. **Given** I encounter an error saving a template with large embedded content, **When** I choose "Retry" after the error, **Then** the system attempts the save operation again without requiring me to restart the entire process

---

### User Story 2 - Template Pack Import to Space Library (Priority: P2)

As a space admin setting up a new space, I want to import an entire template pack into my space library in one action, so I can quickly enable my team to use a curated set of templates without manually copying each one.

**Why this priority**: Enables rapid space setup with proven template collections. Particularly valuable for methodology providers and organizations scaling their approach across multiple spaces. Reduces setup time from hours to minutes. Admin-focused to ensure proper governance.

**Independent Test**: Can be tested by logging in as a space admin, navigating to space library settings, selecting "Import template pack", choosing a pack from the available list, and verifying all templates from that pack appear in the space library.

**Acceptance Scenarios**:

1. **Given** I am a space admin in Space B's library settings, **When** I select "Import template pack", **Then** I see a list of available template packs from both the global library and my organization account
2. **Given** I am viewing the template pack selection dialog, **When** the list loads, **Then** I can clearly distinguish between global library packs and organization-specific packs (e.g., via visual indicators or grouped sections)
3. **Given** I select a template pack and choose "[Pack Name]", **When** I confirm the import, **Then** all templates in that pack are added to Space B's library
4. **Given** I import a template pack that contains both post and subspace templates, **When** the import completes, **Then** I see all template types organized appropriately in my space library
5. **Given** some templates from a pack have the same name as templates already in my space library, **When** I import the pack, **Then** the imported templates are added with "(1)" appended to their titles (e.g., "Retrospective Template" becomes "Retrospective Template (1)")
6. **Given** I am a space admin, **When** I complete the import, **Then** I see a confirmation showing how many templates were added, including how many were renamed due to title conflicts
7. **Given** an error occurs during template pack import (e.g., network failure, storage limit, permission error), **When** the error is detected, **Then** the import operation pauses and displays a specific error message with options to "Retry" or "Skip" the failed template
8. **Given** I choose to skip a failed template during import, **When** the import continues, **Then** the remaining templates are imported successfully and I see a summary including which templates were skipped

---

### User Story 3 - Direct Space Creation from Global Library (Priority: P1)

As a facilitator browsing the global template library, I want to instantly create a new space based on a space template without first adding it to my space library, so I can rapidly experiment with different methodologies without administrative overhead.

**Why this priority**: Eliminates the dead-end experience that blocks methodology adoption. Currently, users discover templates but cannot act on them. This is critical for methodology providers whose users hit this wall immediately after discovery. Focused on space templates as the primary use case.

**Independent Test**: Can be tested by browsing the global library, selecting a space template, clicking "Create space from this template", and verifying a new space is created without requiring the template to be added to any library first.

**Acceptance Scenarios**:

1. **Given** I am browsing the global template library, **When** I click "Create space from this template" on a space template, **Then** a new space is created based on that template without adding it to any library
2. **Given** I am viewing a space template in the global library, **When** I initiate space creation, **Then** I am guided through the space creation flow with the template structure pre-populated
3. **Given** I successfully create a space from a global library template, **When** the creation completes, **Then** I am navigated to the newly created space

---

### User Story 4 - Direct Subspace/Post Template Usage from Global Library (Optional - Requires Design Discussion)

As a facilitator browsing the global template library, I want to use subspace and post templates directly in my spaces without first adding them to my space library, so I can directly see it in practice.

**Why optional**: Requires additional design discussion around the best UX pattern (quick copy, clipboard-style, or direct instantiation).

**Potential Acceptance Scenarios** (subject to design decisions):

1. **Given** I am viewing a subspace template in the global library, **When** I select "Create subspace from this template", **Then** I receive a dialog showing me the Spaces where I have the rights to create a Subspace.
2. **Given** I have chosen a Space for the Subspace, **When** I have filled in the questions in the subspace create dialog, **Then** I am directly navigated to the subspace after creation.
3. **Given** I am viewing a post template in the global library, **When** I click "Quick copy", **Then** I receive guidance to navigate to my desired location and can paste/instantiate the template

---

### User Story 5 - Template Discovery and Access for Space Members (Optional - Requires Design Discussion)

As a space member, I want to see available and selected templates by admins in the Space, so I have an easier way to start.
As a facilitator, I want to show the available templates to members, so I can share the available knowledge and inspire them to use it.

**Why optional**: Requires design discussion around member permissions, template information, position of space library in the Space.

**Design Questions to Resolve**:
- How should template sources (local, imported from packs, global) be visually distinguished?
- What level of template metadata (author, source, usage stats) should be exposed to members?

**Potential Acceptance Scenarios** (subject to design decisions):

1. **Given** I am a member of Space A, **When** I enter the Space, **Then** I want to see the best practices used and available in this Space
2. **Given** my space admin has imported template packs, **When** I view template options in my space, **Then** I can see and use all templates from those packs without needing to know they came from a pack
3. **Given** I am exploring templates as a new facilitator, **When** I access the template browsing interface, **Then** I see clear categories: "Space Library", "Organization Packs", and "Platform Library"
4. **Given** I am a space member without admin privileges, **When** I view the space library, **Then** I can view available templates and use them, but I cannot import template packs or modify the library collection
5. **Given** templates in my space library came from different sources (locally created, imported from packs), **When** I browse them, **Then** I see clear visual indicators of the source but can use them all equally

---

### User Story 6 - Advanced Duplicate Template Management (Optional - Future Enhancement)

As a space admin importing template packs, I want intelligent duplicate detection and resolution options, so I can manage conflicts between existing templates and imported templates based on actual content changes rather than just title matches.

**Why optional**: Requires complex content comparison logic to detect whether templates have truly changed versus just having the same name. The automatic "(1)" suffix approach in User Story 2 provides a safe default that prevents data loss. This enhancement would add significant implementation complexity for what may be a rare edge case.

**Design Questions to Resolve**:
- What constitutes a "duplicate" - title match only, or content hash comparison?
- Should the system track template lineage/versioning to detect updates versus true duplicates?
- How should the UI present conflict resolution choices without overwhelming users with too many decisions?
- Should there be a "preview changes" mode showing diffs between existing and imported templates?

**Potential Acceptance Scenarios** (subject to design decisions):

1. **Given** I am importing a template pack with templates matching existing names, **When** the system detects potential duplicates, **Then** I see a conflict resolution dialog showing each conflict with options: skip (keep existing), replace (use pack version), or keep both (rename imported)
2. **Given** I am reviewing duplicate conflicts during import, **When** I view a conflict, **Then** I can see metadata differences (author, last modified, description) to help me decide
3. **Given** I choose to replace existing templates with pack versions, **When** the import completes, **Then** the system maintains usage history and allows rollback to previous versions
4. **Given** I am a space admin, **When** I set import preferences, **Then** I can configure a default duplicate handling strategy (always skip / always replace / always ask) for future imports

---

### Edge Cases

- What happens when a template pack is updated after being imported into a space library? Should space libraries receive updates, or are they snapshots?
- How does the system handle template dependencies (e.g., a subspace template that references specific post templates)?
- What happens if a user attempts to use a template requiring permissions they don't have in the target space?
- How are template versioning and conflicts managed when the same template exists in multiple packs?
- What happens when a template pack is deleted or made private after spaces have imported it?
- How does the system handle very large embedded content (e.g., whiteboards with hundreds of elements, large file attachments) when deep copying templates? Are there size limits?
- What happens to references to platform entities (users, tags, external links) within template content during deep copy operations?

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST provide two distinct "Save as template" options: "Save to space library" and "Save to template pack" for both post and subspace templates
- **FR-002**: System MUST display a dialog showing all template packs where the user has admin rights in the owning organization account when "Save to template pack" is selected
- **FR-003**: System MUST show a success confirmation dialog after saving to a template pack with options to "View template pack" or "Close"
- **FR-004**: System MUST navigate to the template pack details page when user selects "View template pack" from the success dialog
- **FR-005**: System MUST maintain user context (remain in current space) when user selects "Close" from the success dialog
- **FR-006**: System MUST grey out the "Save to template pack" option with the message "You don't have admin rights to any template packs" when the user is not an admin of any organization accounts that own template packs
- **FR-007**: System MUST provide a single-action "Import template pack" function that displays template packs that are either publicly visible (global library) or public within the user's account, allowing space admins to select and import any available pack to their space library
- **FR-008**: System MUST provide visual distinction between publicly visible template packs and account-specific template packs in the import selection interface (e.g., via icons, labels, or grouped sections)
- **FR-009**: System MUST allow users browsing the global template library to directly create a new space from a space template without adding it to any library first
- **FR-010**: System MUST guide users through the space creation flow with template structure pre-populated when creating from a global library space template
- **FR-011**: System MUST enforce authorization rules when adding templates to packs: only users with admin rights in the owning organization account can add templates to that pack
- **FR-012**: System MUST automatically rename imported templates that have title conflicts with existing space library templates by appending "(1)" to the imported template title (e.g., "Template Name" becomes "Template Name (1)")
- **FR-013**: System MUST provide visual distinction between templates in space library, organization template packs, and global platform library
- **FR-014**: System MUST display clear feedback when authorization prevents a template operation (view, use, or modify)
- **FR-015**: System MUST consolidate the template experience to eliminate inconsistencies between whiteboard templates and collaboration tool templates with whiteboards
- **FR-016**: System MUST provide a contextual template selection interface when creating new posts or subspaces that shows relevant templates based on user's current location
- **FR-017**: System MUST maintain referential integrity when templates are moved, copied, or deleted across packs and libraries
- **FR-018**: System MUST enforce the platform's existing three-tier visibility model for template packs: publicly visible (global library access), public within account (account members only), or hidden (not discoverable)
- **FR-019**: System MUST restrict template pack import operations to space administrators while allowing all members to view and use templates
- **FR-020**: System MAY provide a "quick copy" mechanism for subspace and post templates in the global library (pending design discussion)
- **FR-021**: System MUST support direct space creation from space templates in the global library without requiring library addition first
- **FR-022**: System MUST deep copy all embedded content (whiteboards, uploaded files, media) when saving a template to a pack, ensuring the template is fully self-contained
- **FR-023**: System MUST deep copy all embedded content when importing templates from packs to space libraries, ensuring templates work independently in their new context without broken references
- **FR-024**: System MUST pause template save/import operations on first error and display a specific error message indicating the issue type (size limit exceeded, permission denied, network failure, etc.)
- **FR-025**: System MUST provide "Retry" and "Cancel" (or "Skip" for multi-item imports) options when template operations encounter errors, allowing users to resolve issues without restarting the entire workflow
- **FR-026**: System MUST provide a summary after multi-template operations (e.g., pack imports) showing successful, failed, and skipped items with clear counts

### Key Entities

- **Template Pack**: A curated collection of reusable templates (posts, subspaces, etc.) owned by an organization or user account. Management rights (add, modify, delete templates) are granted to users with admin rights in the owning account. Has three visibility states: publicly visible (displayed in global library for all users), public within account (accessible only to members of the owning organization or user account), or hidden (not discoverable except by direct reference). Space admins can import packs that are either publicly visible or public within their account. Templates within packs contain deep copies of all embedded content (whiteboards, files) to ensure portability.
- **Space Library**: A space-specific collection of templates available to that space's facilitators and members. Can contain templates imported from packs or created locally. All templates are self-contained with deep-copied embedded content.
- **Global Template Library**: Platform-wide catalog of publicly available templates from methodology providers and featured content.
- **Template Instance**: A concrete post, subspace, or other entity created from a template. Maintains optional reference to source template for updates/versioning.
- **Template Type**: Classification of templates by their instantiation target (space template, subspace template, post template, whiteboard template, etc.).
- **Embedded Content**: Assets within a template such as whiteboards, uploaded files, images, or media that are deep-copied during template save and import operations to maintain self-containment.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Facilitators can add a template to a template pack in under 10 seconds from initial save action to confirmation, without navigating away from their current context
- **SC-002**: Time to set up a new space with a complete template pack is reduced from 20+ minutes to under 2 minutes
- **SC-003**: Users can discover a space template in the global library and create a new space from it in under 30 seconds
- **SC-004**: Number of "dead end" experiences (viewing space templates with no action available) is reduced to zero for authenticated users
- **SC-005**: Template usage across the platform increases by 50% within 3 months of release, measured by template instantiation events
- **SC-006**: Support requests related to "how do I use a template from the library" are reduced by 75%
- **SC-007**: 90% of new facilitators successfully use at least one template from the global library within their first session
- **SC-008**: Methodology providers report increased adoption of their template packs, with >80% of users who view a pack successfully using at least one template from it
- **SC-009**: 95% of users who save a template to a pack successfully complete the action without errors or confusion about which pack was selected

## Clarifications

### Session 2026-02-16

- Q: What is the authorization model for template pack management? → A: Owner only - Template packs are owned by organization accounts, and only users with admin rights within that organization account can add/modify templates in the pack. Multiple users can be admins of the organization, inheriting these rights.
- Q: How should duplicate templates be handled when importing template packs? → A: For User Story 2 (P2), always add duplicates with "(1)" suffix behind the title since checking for template changes is complex. Move advanced duplicate detection (skip, replace, keep both with choice) to a separate optional user story for future consideration.
- Q: What is the visibility model for template packs? → A: Platform already has existing three-tier visibility logic: template packs can be publicly visible (global library), public within the account (organization or user account), or hidden.
- Q: How should embedded content (whiteboards, files, references) be handled when saving templates to packs or importing? → A: Deep copy - Duplicate all embedded content (whiteboards, files) to make templates fully self-contained and portable across spaces.
- Q: What should happen when template save/import operations fail? → A: Show error with partial retry - Operation pauses on first error, shows specific issue (size limit, permission, network), and allows user to retry or skip that specific item.

## Assumptions

- Users are authenticated and have appropriate permissions for their roles (facilitator, member, admin)
- Template packs can be owned by organization or user accounts, with management rights granted to account admins only
- The platform supports contextual awareness (knows which space a user is currently operating in)
- The platform's existing three-tier visibility model (publicly visible, public within account, hidden) is already implemented and will be leveraged for template pack access control
- Template versioning and update mechanisms exist or will be addressed in a separate feature (marked as edge case for now)
- Whiteboard templates and collaboration tool templates can be reconciled through unified data modeling without breaking existing templates

## Out of Scope

This specification does NOT cover:
- **User Stories 4, 5 & 6 (Optional)**: Direct subspace/post template usage, member template discovery, and advanced duplicate management require design discussion before implementation scope is finalized
- Template versioning and automatic updates to derived instances
- Advanced template composition (templates that reference other templates)
- Template analytics and usage tracking dashboards
- Template marketplace or monetization features
- Collaborative template editing or version control workflows
- Migration of existing templates to the new unified model (separate data migration effort)
