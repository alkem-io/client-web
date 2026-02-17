# Feature Specification: Organization Admin Dashboard Resource Management

**Feature Branch**: `004-org-resource-management`
**Created**: 2026-02-17
**Status**: Draft
**Related Spec**: [005-organization-types-associations](../005-organization-types-associations/spec.md) (Organization Types & Associations)

## Overview

This specification focuses on enabling **organization admins** to view and manage their organization's resources directly from the dashboard, eliminating the need to navigate through multiple pages to access organizational content.

**Problem Statement**: "As a facilitator, I want to easily manage the resources of the organisation I am an admin of. Most resources I create are under an organisation profile, not my personal profile. However, this is not easy to use." Organization admins need a centralized dashboard view that shows both personal and organizational resources.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Dashboard Organization Resource Overview (Priority: P1)

As a facilitator who is an organization admin, I want to view my organization's resources directly on my dashboard alongside my personal resources, so that I can quickly access and manage all my content in one place.

**Why this priority**: This addresses the core pain point that organization admins currently have to navigate away from their dashboard to manage organizational resources. Without this, the primary workflow is inefficient.

**Independent Test**: Can be fully tested by logging in as an organization admin, navigating to the dashboard, and verifying that organization resources (spaces, innovation packs, hubs) are visible alongside personal resources. Delivers immediate value by reducing navigation overhead.

**Acceptance Scenarios**:

1. **Given** I am an admin of one or more organizations, **When** I access my dashboard, **Then** I see resources from both my personal account and all organizations I administer
2. **Given** I am viewing my dashboard, **When** I look at the resources section, **Then** I can clearly distinguish between personal resources and resources from each organization (visual separation/grouping)
3. **Given** I have more than 5 resources from any single source, **When** I am on the dashboard, **Then** an expand/collapse button is shown for that section
4. **Given** I am viewing organization resources on my dashboard, **When** I click on a resource, **Then** I am taken to that resource's page (same behavior as personal resources)

---

### User Story 2 - Dashboard Organization Account Access (Priority: P1)

As an organization admin, I want to see which organizations I administer and access their account details directly from my dashboard, so that I can manage organizational configuration without multiple navigation steps.

**Why this priority**: Enables quick access to organization account management, reducing friction for common administrative tasks. Essential for admins who manage multiple organizations.

**Independent Test**: Can be tested by viewing the dashboard as an admin of one or more organizations and verifying that the organizations are listed and clickable for account access.

**Acceptance Scenarios**:

1. **Given** I am an admin of one or more organizations, **When** I view my dashboard, **Then** I see a clear list or section showing all organizations I administer
2. **Given** I see my list of administered organizations on the dashboard, **When** I click on an organization, **Then** I can access that organization's account page (with settings, profile, and resource management)

---

### Edge Cases

- What happens when an admin manages 10+ organizations with many resources each? (Performance)
- How are resources displayed when a user has admin rights to multiple organizations but is an associate of others?
- What if an organization has zero resources? (Empty state)
- Should archived or deleted resources appear on the dashboard?
- How does the dashboard handle real-time updates when organization resources change?
- What happens when admin rights are revoked while viewing the dashboard?

---

## Requirements *(mandatory)*

### Functional Requirements

**Dashboard Resource Display:**
- **FR-001**: Dashboard MUST display resources from both the user's personal account and all organizations where the user has admin rights
- **FR-002**: Dashboard MUST clearly separate personal resources from organization resources visually (grouping, headers, badges)
- **FR-003**: Dashboard MUST display organization name/identifier for each organizational resource
- **FR-004**: Dashboard MUST support viewing resources from multiple organizations when user is admin of multiple orgs
- **FR-005**: When displaying >5 resources from a single source, dashboard MUST provide expand/collapse functionality

**Organization Account Access:**
- **FR-006**: Dashboard MUST show a distinct list or section of organizations where the user is an admin
- **FR-007**: Dashboard MUST provide direct navigation from organization indicators to organization account/profile pages
- **FR-008**: Dashboard organization sections MUST link to the corresponding organization's management pages

**Permissions & Access:**
- **FR-009**: Dashboard MUST only show organization resources for organizations where the user has admin rights
- **FR-010**: Users who are only associates (not admins) MUST NOT see organization resource management on their dashboard
- **FR-011**: Dashboard MUST respect resource-level permissions (user can only see/manage resources they have access to)

**Performance:**
- **FR-012**: Dashboard MUST load efficiently even when user is admin of multiple organizations with many resources
- **FR-013**: Dashboard MUST use pagination or lazy loading for organization resource lists with >20 items
- **FR-014**: Dashboard MUST cache organization resource data appropriately to avoid repeated API calls

---

## Key Entities

**Dashboard**:
- Central user interface showing aggregated content
- Displays personal and organizational resources
- Provides quick action buttons for common tasks
- Organized by sections/widgets

**Organization Admin Role**:
- User with administrative rights to an organization
- Can manage organization resources
- Can access organization account and settings
- Can create resources under organization ownership

**Organizational Resource**:
- Content owned by an organization account (not personal)
- Types: Space, Innovation Pack, Innovation Hub
- Created and managed by organization admins
- Attributed to the organization, not individual users

**Resource Ownership**:
- Determines who can manage and modify a resource
- Two types: Personal (owned by user) vs Organizational (owned by organization account)
- Affects visibility, permissions, and attribution

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Organization admins can access their organization's resources within 2 clicks from the dashboard (down from 4+ clicks currently)
- **SC-002**: Users can navigate from dashboard to any organization's account page within 1 click
- **SC-003**: 90% of organization admins successfully locate and manage their organization resources from the dashboard without external guidance (usability testing)
- **SC-004**: Clear visual distinction between personal and organization resources results in zero reported confusion about resource ownership
- **SC-005**: Dashboard page load time remains under 2 seconds even for admins of 5+ organizations with 50+ total resources
- **SC-006**: Dashboard correctly displays resources from all administered organizations without missing any

### User Experience Goals

- Dashboard serves as the central hub for both personal and organizational work
- Organization resource management feels seamless and requires minimal context switching
- Admins can quickly identify which resources belong to which organization
- Managing multiple organizations doesn't feel overwhelming or confusing
- The dashboard provides an at-a-glance overview of all work, regardless of ownership

---

## Assumptions

1. **Verified Organizations Only**: This feature applies only to verified organizations with accounts (see [005-organization-types-associations](../005-organization-types-associations/spec.md) for org types)
2. **Dashboard Existence**: Users already have access to a dashboard interface that can be extended
3. **Admin Role**: The platform already has a permission system that distinguishes organization admins from associates
4. **Resource Types**: All existing resource types (spaces, innovation packs, hubs) support organization ownership
5. **Account Model**: Organizations have associated accounts that own resources (distinct from user accounts)
6. **Single Organization Context**: Each resource is owned by exactly one entity (user or organization), no shared ownership
7. **Real-time Updates**: Dashboard can receive updates when resources are created/modified

---

## Constraints

- Must not require major restructuring of existing resource ownership models
- Must maintain backward compatibility with existing admin functionality
- Dashboard performance must not degrade significantly when displaying resources from multiple organizations
- Must work within existing authentication and authorization frameworks
- Cannot show resources from organizations where user is only an associate (not admin)
- Must respect existing privacy and visibility settings for resources

---

## Out of Scope

- Resource creation from dashboard (create resources from organization or space pages)
- Organization filtering/switching on dashboard (always show all)
- Resource transfer between personal and organization ownership
- Bulk resource management operations
- Advanced organization analytics or reporting on dashboard
- Organization-wide notification settings on dashboard
- Dashboard customization (user can't reorder or hide sections)
- Resources from organizations where user is an associate (only admin orgs)
- Lightweight (non-verified) organization resources (they don't have accounts/resources)
- Organization invitation workflows
- Organization billing or subscription management

---

## Implementation Notes

### Required Components

1. **Dashboard Resource Query** - GraphQL query to fetch resources from user account + all admin organizations
2. **Dashboard Organization Section** - UI component to display grouped organizational resources
3. **Organization Navigation Links** - Direct links from dashboard to organization account/settings pages
4. **Permission Checks** - Verify user is admin of organization before showing resources

### API Considerations

- Existing `Account` type has `spaces`, `innovationPacks`, `innovationHubs` fields
- Need to query user's personal account + all organization accounts where user is admin
- Potential performance concern: multiple account queries if user is admin of many orgs
- Consider single aggregated query endpoint for dashboard data

### Related Work

- Depends on [005-organization-types-associations](../005-organization-types-associations/spec.md) for organization type distinction (only verified orgs have resources)
- Requires existing admin role/permission system to be in place
- Builds on existing resource ownership model

---

## Related Specifications

- [005-organization-types-associations](../005-organization-types-associations/spec.md) - Organization types (verified orgs have resources, lightweight don't)
