# Feature Specification: Organization Types & User Associations

**Feature Branch**: `005-organization-types-associations`
**Created**: 2026-02-17
**Status**: Draft
**Related Spec**: [004-org-resource-management](../004-org-resource-management/spec.md) (Admin Dashboard Resources)

## Overview

This specification focuses on creating a distinction between **lightweight (non-verified)** and **verified organizations**, and enabling users to easily associate with and disassociate from organizations, particularly lightweight ones that don't require full account management.

**Problem Statement**: "As a product owner, I don't want single users to have to manage organisation accounts of a whole municipality. It must be a more lightweight association." Organizations need two tiers: basic profiles for simple organizational identity, and verified accounts for resource management.

---

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Platform Admin Creating Organizations (Priority: P1)

As a platform administrator, I want to create organizations (both lightweight and verified), so that they exist in the platform for users to associate with.

**Why this priority**: Foundational capability that enables the platform to have organizations for users to associate with. Platform control ensures quality and prevents spam/duplicate organizations.

**Independent Test**: Can be tested by platform admin accessing organization creation and creating both lightweight and verified organizations.

**Acceptance Scenarios**:

1. **Given** I am a platform administrator, **When** I access organization creation, **Then** I see both "Basic Profile" and "Verified Organization" options
2. **Given** I am creating a lightweight organization, **When** I fill out the creation form, **Then** I only need to provide display name, tagline, and description (no legal entity, domain, or contact info required)
3. **Given** I create a lightweight organization, **When** the organization is created, **Then** it has verification status "Not Verified" and no associated account for resource management
4. **Given** I create a lightweight organization, **When** I view its capabilities, **Then** it can lead or be a member of spaces/subspaces but cannot host/own resources
5. **Given** I am creating a verified organization, **When** I fill out the creation form, **Then** I must provide full organizational details including nameID, legal entity, contact email, domain, and website
5. **Given** I am creating a verified organization, **When** I fill out the creation form, **Then** I must provide full organizational details including nameID, legal entity, contact email, domain, and website
6. **Given** I create a verified organization, **When** the organization is created, **Then** it has an associated account that can own/host resources (spaces, innovation packs, hubs) and can also lead or be a member of other spaces
7. **Given** I am a regular contributor (not platform admin), **When** I try to access organization creation, **Then** I am prevented from doing so (no access to creation interface)

---

### User Story 2 - Associating with Organizations via Profile (Priority: P1)

As a contributor, I want to search for and associate myself with any existing organization (basic or verified) from my profile, so that my profile reflects my professional affiliations and organizational memberships.

**Why this priority**: Core user-facing feature that enables the primary use case of showing organizational affiliations on user profiles. Users can affiliate with both lightweight (basic profile) and verified organizations. Search-first approach prevents duplicate organizations.

**Independent Test**: Can be tested by navigating to user profile, initiating the association flow, searching for both lightweight and verified organizations, and associating with them. Verify associations appear on user profile and organization member list.

**Acceptance Scenarios**:

1. **Given** I am viewing my profile, **When** I want to add an organization affiliation, **Then** I see an "Add Organization" button or section to start the association flow
2. **Given** I start the association flow from my profile, **When** the search interface opens, **Then** I see a search field showing both verified and lightweight organizations from the platform
3. **Given** I am searching for an organization, **When** I type in the search field, **Then** I see matching organizations from the entire platform (both types) with clear verification indicators
4. **Given** I find a lightweight (basic) organization in the search, **When** I select it and confirm, **Then** I am associated with that organization and it appears on my profile with a "Not Verified" indicator
5. **Given** I find a verified organization in the search, **When** I select it and confirm, **Then** I am associated with that organization and it appears on my profile with a "Verified" badge
6. **Given** I cannot find the organization I'm looking for, **When** I review the search results, **Then** I see a message to contact platform administrators to have the organization added
7. **Given** I am now associated with a lightweight organization, **When** I view the organization page, **Then** I see basic profile information (Profile, Community tabs) but no resource hosting sections or Authorization tab
8. **Given** I am now associated with a verified organization (but not an admin), **When** I view the organization page, **Then** I see the organization's resources and activity but cannot manage them, and I see Profile, Community, and Authorization tabs (Authorization only accessible to admins)

---

### User Story 3 - Disassociating from Organizations (Priority: P1)

As a user, I want to easily disassociate from organizations I'm associated with, so that I can manage my organizational memberships autonomously without admin intervention.

**Why this priority**: Enables users to manage their organizational memberships autonomously. Critical for the "lightweight association" model where users aren't forced into admin/account management roles.

**Independent Test**: Can be tested by associating with an organization, then using the leave/disassociate option. Verify the process is simple and doesn't require admin intervention.

**Acceptance Scenarios**:

1. **Given** I am an associate of any organization (lightweight or verified), **When** I view the organization profile, **Then** I see my association status clearly indicated
2. **Given** I am viewing my association with an organization, **When** I want to leave the organization, **Then** I can access a clearly marked "Leave" or "Disassociate" option
3. **Given** I choose to leave an organization, **When** I confirm the action, **Then** my association is removed immediately and I no longer appear in the associates list
4. **Given** I am an associate (not admin) of a lightweight organization, **When** I view the organization, **Then** I do NOT see administrative controls, settings, or resource management options
5. **Given** I have left an organization, **When** I view my profile, **Then** that organization no longer appears in my associations list

---

### User Story 4 - Organization Type Distinction in UI (Priority: P1)

As a user viewing organization profiles, I want to clearly see whether an organization is verified or not, so that I can understand the organization's credibility and capabilities.

**Why this priority**: Provides transparency and helps users understand which organizations are official/verified entities vs. basic profiles.

**Independent Test**: Can be tested by viewing various organization profiles and verifying the verification badge appears correctly with appropriate tooltips.

**Acceptance Scenarios**:

1. **Given** I view a verified organization profile, **When** I look at the organization header, **Then** I see a "Verified" badge with an icon
2. **Given** I view a lightweight (non-verified) organization profile, **When** I look at the organization header, **Then** I see "Not Verified" status (without the verification icon)
3. **Given** I view a verified organization profile, **When** I scroll down, **Then** I see sections for owned resources (account resources, contributions) and tabs including Profile, Community, and Authorization
4. **Given** I view a lightweight organization profile, **When** I scroll down, **Then** I do NOT see owned resource sections but I MAY see spaces where the organization is a leader or member; tabs include Profile and Community only
5. **Given** I am on an organization card in a list view, **When** I examine the card, **Then** verified organizations display a verification badge

---

### User Story 5 - Organization Verification Display & Department/Team Affiliation (Priority: P1)

As a contributor, I want to see clear visual distinction between verified and non-verified organizations on my profile, and I want to add optional department or team information for each organization, so that my profile accurately reflects my specific role and affiliation context.

**Why this priority**: Essential for user profile credibility and professional context. Verification status indicators help users distinguish between official/verified organizations and basic profiles. Department/team context allows users to accurately represent their specific role within an organization, which is critical for professional identity on the platform.

**Independent Test**: Can be tested by editing user profile to add department/team text for an organization association, then viewing the profile to verify verification badges and department/team text display correctly.

**Acceptance Scenarios**:

1. **Given** organizations are already displayed on my profile, **When** I view my profile, **Then** I see clear visual distinction between verified organizations (with badge) and non-verified organizations (with "Not Verified" indicator or no badge)
2. **Given** I am editing my profile, **When** I view my organization associations, **Then** I can add or edit optional department/team text for each organization (e.g., "Engineering Department", "Product Team", "Municipal Planning")
3. **Given** I have added department/team text for an organization, **When** I save my profile, **Then** the department/team text appears below or next to the organization name on my profile
4. **Given** I am associated with both verified and lightweight organizations, **When** viewing my profile, **Then** each organization displays its verification status consistently with clear visual differentiation
5. **Given** another user views my profile, **When** they see my organization associations, **Then** they immediately see which organizations are verified (badge) vs non-verified, and any department/team context I've added

**Implementation Note**: Organization associations display already exists. This story focuses on: (1) adding clear verification status indicators, and (2) enabling department/team text entry within the user profile editing flow.

---

### User Story 6 - User-Created Lightweight Organizations (Priority: P3, Optional)

As a contributor, I want to create a lightweight organization if it doesn't exist in the platform, so that I can associate with it without waiting for platform administrator intervention.

**Why this priority**: Optional feature that reduces friction for users. Marked P3 because platform-admin-only creation (User Story 1) is the baseline. This user story can be enabled later if desired.

**Independent Test**: Can be tested by enabling the feature flag/permission and allowing regular contributors to create lightweight organizations during the association flow.

**Acceptance Scenarios**:

1. **Given** the user-creation feature is enabled, **When** I search for an organization and cannot find it, **Then** I see an option to "Create new lightweight organization"
2. **Given** I choose to create a new lightweight organization, **When** I fill out the creation form, **Then** I only need to provide display name, tagline, and description (no verified org option available)
3. **Given** I create a lightweight organization, **When** the organization is created, **Then** I am automatically associated with it and it appears on my profile
4. **Given** I create a lightweight organization, **When** it is created, **Then** it has verification status "Not Verified" and no associated account
5. **Given** the user-creation feature is disabled (default), **When** I cannot find an organization, **Then** I see instructions to contact platform administrators instead of a creation option

**Note**: This is an optional enhancement. The default behavior is platform-admin-only organization creation (User Story 1).

---

### User Story 6 - Upgrading Lightweight to Verified Organization (Priority: P2)

As the creator or associate of a lightweight organization, I want to upgrade it to a verified organization, so that the organization can gain resource management capabilities and official verification status.

**Why this priority**: Provides a clear path for organizations to grow from basic profiles to full-featured accounts. Essential for organizations that start simple but later need resource management.

**Independent Test**: Can be tested by initiating an upgrade process on a lightweight organization and verifying that proper verification and owner assignment occurs.

**Acceptance Scenarios**:

1. **Given** I am associated with a lightweight organization, **When** I want to upgrade it to verified status, **Then** I can access an "Upgrade to Verified" option in the organization settings
2. **Given** I initiate an upgrade to verified, **When** I proceed with the upgrade, **Then** I must provide additional required information (legal entity name, contact email, domain, website, nameID)
3. **Given** I am upgrading a lightweight organization, **When** I complete the additional information, **Then** I must designate at least one owner/admin for the organization
4. **Given** the upgrade process is complete, **When** the organization becomes verified, **Then** an account is created for the organization and it can now own resources
5. **Given** a lightweight organization has been upgraded to verified, **When** I view the organization profile, **Then** it displays the verification badge and resource management sections
6. **Given** I am an associate of a lightweight organization that gets upgraded, **When** the upgrade completes, **Then** I remain an associate unless designated as an admin during the upgrade

**Note**: For the initial implementation, this can be a manual process handled by platform administrators, but the capability must be explicitly supported.

---

### Edge Cases

- What happens if an upgrade from lightweight to verified fails partway through?
- Can multiple people initiate an upgrade for the same lightweight organization?
- What happens when a verified organization is de-verified (downgraded to lightweight)?
- What happens when an organization is deleted while users have associations (and their department/team text)?
- How many organizations can a user associate with?
- What happens if someone tries to host/own resources under a lightweight organization?
- Can a lightweight organization have admins, or only associates? (Answer: Optional - they MAY have admins)
- If a lightweight org has no admin, who can edit profile and community settings?
- How does a lightweight organization become a leader of a space without owning it?
- Can a lightweight organization be a member of multiple spaces simultaneously?
- What happens when a lightweight organization leads a space and then upgrades to verified?
- What character limit should department/team text have? Should it be validated?
- What happens if department/team text contains special characters or very long text?
- Is department/team text visible to all users viewing the profile, or only certain roles?
- If user-creation is enabled: How do we prevent duplicate organizations from being created?
- If user-creation is enabled: What happens if a user creates a duplicate of an existing organization?
- What happens when a user cannot find their organization and creation is disabled? (UX for requesting admin help)

---

## Requirements *(mandatory)*

### Functional Requirements

**Organization Types:**
- **FR-001**: System MUST support two types of organizations: Lightweight (non-verified) and Verified
- **FR-002**: Lightweight organizations MUST require only: displayName, tagline (optional), description (optional), and avatar (optional)
- **FR-003**: Verified organizations MUST require: nameID, displayName, legal entity name, contact email, domain, website, and full profile information
- **FR-004**: Lightweight organizations MUST NOT have an associated account for resource management
- **FR-004a**: Lightweight organizations MUST NOT be able to host/own resources (spaces, innovation packs, innovation hubs)
- **FR-004b**: Lightweight organizations MUST be able to lead or be members of spaces and subspaces (participation without ownership)
- **FR-005**: Verified organizations MUST have an associated account that can own/host resources (spaces, innovation packs, innovation hubs)
- **FR-005a**: Verified organizations MUST be able to lead or be members of spaces and subspaces
- **FR-006**: Platform administrators MUST be able to create both lightweight and verified organizations
- **FR-007**: Regular contributors MUST NOT be able to create organizations by default (platform-admin-only creation is the baseline)
- **FR-008**: IF user-creation feature is enabled (optional), regular contributors MAY create lightweight organizations only (not verified)
- **FR-008a**: Lightweight organizations MAY have an owner/admin (optional), while verified organizations MUST have at least one owner/admin
- **FR-008b**: Lightweight organization profile settings MUST include tabs for: Profile, Community
- **FR-008c**: Verified organization profile settings MUST include tabs for: Profile, Community, Authorization

**User Associations:**
- **FR-009**: Users MUST be able to initiate the association flow from their profile page ("Add Organization" button or similar)
- **FR-010**: Users MUST be able to search and select from all existing organizations (both lightweight and verified) when adding an association
- **FR-011**: The association search interface MUST display verification status clearly for each organization (verified badge or "Not Verified" indicator)
- **FR-012**: Users MUST be able to associate with any existing organization, regardless of type (lightweight or verified)
- **FR-013**: Association MUST work identically for both lightweight and verified organizations from the user's perspective
- **FR-014**: By default, if an organization doesn't exist, users MUST see instructions to contact platform administrators to have it added
- **FR-015**: IF user-creation feature is enabled (optional), users MAY create lightweight organizations during association and MUST be automatically associated upon creation
- **FR-016**: Users MUST be able to disassociate (leave) from organizations they are associated with
- **FR-017**: Disassociation MUST be accessible within 3 clicks from the organization profile page
- **FR-018**: Associates of lightweight organizations MUST NOT see or access administrative functions
- **FR-019**: When a user disassociates from an organization, the system MUST remove the association immediately and update all relevant views
- **FR-020**: System MUST prevent the last admin of a verified organization from leaving without transferring admin rights or dissolving the organization

**Organization Upgrade:**
- **FR-033**: System MUST support upgrading lightweight organizations to verified status
- **FR-034**: Upgrade to verified MUST require providing all verified organization fields (legal entity, contact email, domain, website, nameID)
- **FR-035**: Upgrade to verified MUST require designation of at least one owner/admin
- **FR-036**: Upon upgrade, system MUST create an associated account for the organization
- **FR-037**: Existing associates of a lightweight organization MUST remain associated after upgrade (unless designated as admins)
- **FR-038**: Upgrade process MUST be initiated by platform administrators (not regular users)
- **FR-039**: Upgrade process MAY be manual (admin-initiated) in initial implementation, but system MUST support the capability

**UI Display:**
- **FR-021**: User profiles MUST display an "Add Organization" or "Organizations" section where users can manage associations
- **FR-022**: User profiles MUST display all associated organizations with clear verification status indicators (verified badge or "Not Verified")
- **FR-022a**: User profile editing MUST allow users to add optional department/team text for each organization association (free-form text field)
- **FR-022b**: User profiles MUST display the department/team text (if provided) alongside or below the organization name
- **FR-022c**: Department/team text input MUST be accessible within the user profile editing interface for each organization association
- **FR-023**: Organization profiles MUST display verification status (verified/not verified) prominently
- **FR-024**: Verified organizations MUST display a verification badge with icon
- **FR-025**: Lightweight organization profiles MUST NOT display owned resource sections (account resources, contributions) but MAY display spaces where the organization is a leader or member
- **FR-025a**: Lightweight organization profile settings MUST show tabs: Profile, Community (no Authorization tab)
- **FR-026**: Verified organization profiles MUST display owned resource sections when resources exist
- **FR-026a**: Verified organization profile settings MUST show tabs: Profile, Community, Authorization
- **FR-027**: Organization cards in list/search views MUST indicate verification status
- **FR-028**: Organization search/selection interface MUST show organization type and verification status for each result
- **FR-029**: The association flow (search/select interface) MUST be accessible directly from the user's profile editing interface

**Permissions:**
- **FR-030**: Lightweight organizations MUST NOT be able to host/own resources (spaces, innovation packs, innovation hubs)
- **FR-030a**: Lightweight organizations MUST be able to lead or participate as members in spaces and subspaces
- **FR-030b**: Associates of lightweight organizations MUST be able to collaborate in spaces where the organization is a member or leader
- **FR-031**: Only admins of verified organizations MUST be able to manage owned resources
- **FR-032**: Associates (of any organization type) MUST NOT have access to organization settings or administrative interfaces
- **FR-032a**: Authorization settings tab MUST only be available for verified organizations
- **FR-032b**: Lightweight organizations MAY designate admins optionally; if no admin exists, profile and community settings remain manageable by platform administrators

---

### Key Entities

**Lightweight Organization (Non-Verified)**:
- `id`: Unique identifier
- `profile`: { displayName, tagline, description, avatar }
- `verification.status`: `NOT_VERIFIED`
- No `account` property
- **Cannot host/own resources** (spaces, innovation packs, hubs)
- **Can lead or be members of spaces/subspaces** (participation without ownership)
- Associates (no formal admin structure required; owner/admin is optional)
- Profile settings tabs: Profile, Community
- Simplified creation process

**Verified Organization**:
- `id`: Unique identifier
- `nameID`: Unique URL-safe identifier
- `profile`: Full profile including location, references, tagsets
- `contactEmail`, `domain`, `legalEntityName`, `website`
- `verification.status`: `VERIFIED_MANUAL_ATTESTATION`
- `account`: Associated account for resource ownership
- **Can host/own resources**: Spaces, Innovation Packs, Innovation Hubs
- **Can lead or be members of spaces/subspaces**
- Both admins (with full management rights) and associates (required: at least one admin)
- Profile settings tabs: Profile, Community, Authorization
- Complex creation with verification workflow

**User Association**:
- Relationship between User and Organization
- Type: Admin (optional for lightweight, required for verified) or Associate (any org)
- Optional: Department/team designation (free-form text, editable by user in their profile)
- Example department/team text: "Engineering Department", "Product Team", "Municipal Planning"
- Determines visibility and access rights
- Displays on user profile with organization name and verification indicator

---

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Platform administrators can create a lightweight organization in under 1 minute with only 3 required fields
- **SC-002**: Users can initiate organization association from their profile in 1 click ("Add Organization" button)
- **SC-003**: Users can find and associate with an existing organization within 5 actions from their profile (click add, search, select, confirm)
- **SC-004**: Users can associate with BOTH lightweight and verified organizations using the same flow
- **SC-005**: Users can disassociate from an organization within 3 clicks from the organization profile page
- **SC-006**: 100% of lightweight organizations display "Not Verified" status without owned resource sections
- **SC-006a**: Lightweight organizations can be shown as leaders or members of spaces (participation) but never as hosts/owners
- **SC-007**: 100% of verified organizations display verification badge with owned resource sections (when resources exist)
- **SC-008**: Users can identify organization type (lightweight vs verified) within 2 seconds of viewing any organization
- **SC-009**: Zero instances of associates accessing admin functions on lightweight organizations
- **SC-010**: User profile correctly displays all associated organizations with verification indicators
- **SC-010a**: Users can add and edit department/team text for each organization from their profile editing interface
- **SC-010b**: Department/team text (if provided) displays on user profile alongside organization name
- **SC-011**: Regular contributors cannot access organization creation interface (platform-admin-only by default)
- **SC-012**: Lightweight organization settings display Profile and Community tabs only (no Authorization tab)
- **SC-013**: Verified organization settings display Profile, Community, and Authorization tabs

### User Experience Goals

- Users can easily add organizations to their profile from the profile page itself
- Users can associate with both lightweight (basic) and verified organizations using the same simple flow
- Searching for and associating with organizations is quick and straightforward
- Organization search results clearly indicate verification status (verified badge vs "Not Verified")
- Associating with organizations provides identity without admin burden
- Leaving organizations is straightforward with clear confirmation
- Verification status is immediately obvious to all users in all views (verified badge for verified orgs, "Not Verified" or no badge for lightweight)
- Users can easily add department/team context to their organization affiliations from their profile editing
- Department/team text displays naturally alongside organization names, providing professional context
- Lightweight organizations serve as organizational identity markers that can participate in spaces without owning resources
- Clear distinction: lightweight orgs can lead/be members of spaces but cannot host/own them
- Organization profile settings are appropriately scoped: lightweight orgs have Profile and Community tabs; verified orgs add Authorization
- No confusion between lightweight participation (membership/leadership) and verified ownership (hosting resources)
- When an organization doesn't exist, users understand how to request it be added (contact administrators)
- IF user-creation is enabled (optional): Creating lightweight organizations feels quick and barrier-free

---

## Assumptions

1. **Backend Support**: The backend API already supports `OrganizationVerificationEnum` with `NOT_VERIFIED` and `VERIFIED_MANUAL_ATTESTATION` statuses
2. **Account Creation**: Verified organizations automatically get an associated account; lightweight ones don't
3. **Association Model**: The platform supports user-organization associations (existing functionality)
4. **Existing Organization Display**: User profiles already display organization associations; this spec adds verification status indicators and department/team text
5. **Platform Admin Role**: The platform has a way to identify platform administrators vs regular contributors
6. **Upgrade Implementation**: Upgrade from lightweight to verified may be initially implemented as a manual process (admin/platform-initiated) but the data model and workflow must support it
7. **No Invitations**: This spec doesn't cover how users become associates (assumed to be handled separately)
8. **Optional Admins for Lightweight Orgs**: Lightweight organizations MAY have admins/owners (optional), while verified organizations MUST have at least one admin/owner
9. **Space Participation**: The platform supports organizations (all types) being members or leaders of spaces/subspaces, separate from resource ownership
10. **Platform-Admin Creation**: By default, only platform administrators can create organizations (both types). User creation is an optional enhancement.

---

## Constraints

- Must work with existing `OrganizationVerificationEnum` from GraphQL schema
- Must maintain backward compatibility with existing verified organizations
- Cannot modify existing resource ownership models for verified organizations (spaces, packs, hubs remain owned by account holders)
- Lightweight organizations cannot own/host resources but can participate in spaces as leaders or members
- Must work within existing authentication and authorization frameworks
- Upgrade process must ensure data integrity (no orphaned organizations or associations)
- Organization creation must be restricted to platform administrators by default (baseline security posture)
- User creation of organizations (if enabled) can only create lightweight organizations, never verified

---

## Out of Scope

- Organization invitation workflows (inviting users to become associates)
- Automated/self-service upgrade UI (manual admin process acceptable initially)
- Organization hierarchy (parent/child relationships)
- Department/team structure within organizations
- Organization-wide settings or preferences
- Billing or payment management
- Advanced organization analytics
- Bulk association management
- Downgrading from verified to lightweight (one-way upgrade only)
- Resource transfer between organizations
- User onboarding flow for requesting new organizations from admins
- Mechanism for designating organizations as space leaders or members (handled by space management, not org creation)

---

## Implementation Notes

### Completed Components

1. **Organization Model** - `OrganizationModelLightweight.ts`
   - Type definitions for lightweight vs verified organizations
   - Type guards: `isLightweightOrganization()`, `isVerifiedOrganization()`
   - Utility functions for verification status display

2. **Lightweight Organization Form** - `LightweightOrganizationForm.tsx`
   - Simplified form requiring only displayName, tagline, description
   - Auto-generates nameID from displayName
   - No avatar selection (optional enhancement)
   - Used by platform admins (and optionally by users if feature enabled)

3. **Create Organization Dialog** - `CreateOrganizationDialog.tsx`
   - Toggle between "Basic Profile" and "Verified Organization" (for platform admins)
   - Platform-admin-only access by default
   - Conditional rendering of appropriate form based on selection
   - Optional: Can be made available to regular contributors for lightweight org creation only (if user-creation feature is enabled)

4. **Organization Page View** - `OrganizationPageView.tsx`
   - Conditionally hides owned resource sections for non-verified orgs
   - Shows Profile and Community tabs for lightweight orgs
   - Shows Profile, Community, and Authorization tabs for verified orgs
   - May display spaces where lightweight org is leader/member (participation without ownership)

5. **Internationalization** - Added translations for type selection UI

### Key Implementation Notes

- **Lightweight Organization Admin (Optional)**: Lightweight organizations MAY designate an owner/admin. If no admin is designated, profile and community settings should be manageable by platform administrators or through a designated process.
- **Space Participation vs Ownership**: Lightweight organizations can lead or be members of spaces/subspaces (participation/collaboration) but cannot host/own resources. This distinction must be clear in the UI.
- **Profile Settings Structure**: Lightweight orgs show Profile and Community tabs; verified orgs add Authorization tab for access control management.

### Components to Build

6. **Organization Search/Selection Component** - `OrganizationSelector.tsx` (new)
   - Search interface for finding existing organizations
   - Display both verified and lightweight organizations with indicators
   - "Contact admin to add organization" message when search yields no results (default behavior)
   - Optional: "Create new lightweight organization" action (if user-creation feature is enabled)
   - Used in user profile editing and association flows

### Remaining Work

1. **Organization search/selection component (OrganizationSelector)**
   - Autocomplete-style search showing all existing orgs (verified and lightweight)
   - Display verification indicators in search results
   - Default: Show "Contact administrator" message when desired org not found
   - Optional (if enabled): Show "Create new lightweight organization" action

2. **Integration into user profile editing/association flow**
   - Add "Add Organization" button/section to user profile page
   - Clicking opens OrganizationSelector modal/dialog for search/selection
   - Users can search for and select any organization (lightweight or verified)
   - On selection and confirmation, creates association and updates profile immediately
   - Profile displays all associations with verification indicators
   - No creation option by default (search and associate with existing orgs only)

3. **Platform admin organization creation interface**
   - Standalone creation interface accessible only to platform admins
   - Choice dialog: "Basic Profile" or "Verified Organization"
   - Both form types available to platform admins
   - Used to pre-populate organizations before users associate with them

4. **Platform admin role check**
   - Implement role check to restrict creation interface access
   - Regular contributors cannot access organization creation at all
   - Platform admins see both lightweight and verified options

5. **User disassociation (leave organization) functionality**
   - "Leave organization" button on organization profile page
   - Confirmation dialog with explanation
   - Prevent last admin from leaving verified org without transfer

6. **User profile organization associations display with verification and department/team**
   - Organization display already exists; enhance with clear verification indicators
   - Add verification badge for verified organizations
   - Add "Not Verified" indicator or omit badge for lightweight organizations
   - Add department/team text input field for each organization in profile editing
   - Display department/team text alongside or below organization name on profile view
   - Clickable links to organization pages
   - Allow users to edit department/team text from their profile editing interface

7. **Organization list cards with verification indicators**
   - Badge/icon showing verified status on organization cards
   - Consistent visual distinction in all list views

8. **Permission checks for resource hosting vs space participation**
   - Backend validation that lightweight orgs cannot host/own resources
   - Frontend UI prevents resource creation/hosting under lightweight orgs
   - Allow lightweight orgs to be designated as leaders or members of spaces without ownership
   - Backend validation that only verified orgs with accounts can host resources

9. **Organization profile settings tabs structure**
   - Lightweight orgs: Display Profile and Community tabs only
   - Verified orgs: Display Profile, Community, and Authorization tabs
   - Authorization tab restricted to admins of verified organizations
   - If lightweight org has no admin, platform admin access for profile/community editing

10. **Space participation display for lightweight organizations**
   - Show spaces where lightweight org is a leader or member
   - Clear visual distinction between "participating in" vs "owning/hosting" resources
   - Lightweight org profile shows participated spaces (not owned)
   - Verified org profile shows both owned resources and participated spaces

11. **Admin-only access to organization settings**
   - Settings/management UI visible to admins (optional for lightweight, required for verified)
   - Associates see read-only views only
   - Handle edge case: lightweight org with no designated admin

12. **Organization upgrade flow (platform admin only)**
   - Admin-initiated process to upgrade lightweight to verified
   - Collect additional required fields (legal entity, domain, etc.)
   - Require owner/admin designation
   - Create associated account for resource management
   - Handle transition of space participation/leadership to verified status

13. **Optional: User-created lightweight organizations (P3)**
   - Feature flag/permission to enable user creation of lightweight orgs
   - When enabled: Add "Create new" option to OrganizationSelector
   - Opens lightweight org creation form for regular contributors
   - Auto-associates creator with newly created org
   - Only lightweight orgs (verified creation remains admin-only)

---

## Related Specifications

- [004-org-resource-management](../004-org-resource-management/spec.md) - Admin dashboard resource management for verified organizations
