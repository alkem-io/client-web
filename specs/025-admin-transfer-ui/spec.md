# Feature Specification: Admin UI for Space Conversions & Resource Transfers

**Feature Branch**: `025-admin-transfer-ui`
**Created**: 2026-03-23
**Updated**: 2026-03-24
**Status**: Draft
**Scope**: Frontend only — all GraphQL mutations already exist in the backend schema; this feature builds the admin UI that calls them.
**Input**: GitHub Issue [#9445](https://github.com/alkem-io/client-web/issues/9445) — Admin UI for Space Conversions & Resource Transfers
**Server Reference**: `specs/080-move-spaces/spec.md`, `docs/conversion-transfer-analysis.md` (server repo)

## User Scenarios & Testing *(mandatory)*

### User Story 1 — Space Hierarchy Conversions (Priority: P1)

As a **Platform Administrator**, I want to promote and demote spaces between hierarchy levels (L0, L1, L2) from a dedicated admin page so that I can restructure the platform's space hierarchy without making direct API calls.

The Conversions area provides a single entry point for space operations: the admin enters a space URL, the system resolves the space and displays its current state, then dynamically shows only the conversion operations applicable to that space's current level:

- **L1 space → shows**: "Promote to Space (L1 → L0)" and "Demote to Sub-subspace (L1 → L2)"
- **L2 space → shows**: "Promote to Subspace (L2 → L1)"
- **L0 space → shows**: No conversions available (informational message)

Operation details:
- **Promote subspace to top-level space** (L1 → L0): Elevates a subspace to become an independent space, inheriting the original L0's account. Innovation flow is reset to platform defaults. All L2 children are automatically promoted to L1.
- **Promote sub-subspace to subspace** (L2 → L1): Elevates a sub-subspace to become a direct child of its grandparent L0 space. Lightweight — community members and leads are preserved.
- **Demote subspace to sub-subspace** (L1 → L2): Nests a subspace under another subspace within the same L0 space. **Most destructive** — removes all community roles except user admins. The target parent L1 space is selected from a searchable picker showing only valid sibling L1 spaces within the same L0.

**Why this priority**: These are the most impactful structural operations. Space hierarchy changes are the primary reason admins currently need direct API access. Providing a UI eliminates the most common admin support burden.

**Independent Test**: Can be fully tested by navigating to the admin page, entering a space URL, seeing only the applicable operations based on level, confirming through the warning dialog, and verifying the space appears at its new level.

**Acceptance Scenarios**:

1. **Given** the admin is on the Conversions & Transfers page in the Conversions area, **When** they enter an L1 subspace URL, **Then** the system displays the space's current state (name, level, community size, account) and shows two available operations: "Promote to Space" and "Demote to Sub-subspace."
2. **Given** the admin selects "Promote to Space (L1 → L0)", **When** the confirmation dialog appears, **Then** it warns that innovation flow will be reset to platform defaults and all L2 children will be promoted to L1.
3. **Given** the admin enters an L2 sub-subspace URL, **When** it is resolved, **Then** only "Promote to Subspace (L2 → L1)" is available, and the confirmation dialog indicates community members and leads are preserved.
4. **Given** the admin selects "Demote to Sub-subspace (L1 → L2)", **When** the demotion form appears, **Then** a searchable picker shows only L1 spaces within the same L0 as valid targets, and the confirmation dialog clearly lists all community members, leads, organizations, and VCs that will be removed (only user admins kept).
5. **Given** the resolved space is L1 and the same L0 has no other L1 subspaces, **When** the admin opens the L1 → L2 picker, **Then** the picker is empty and the operation cannot proceed, with a message explaining no valid targets exist.
6. **Given** the admin enters an L0 space URL, **When** it is resolved, **Then** no conversion operations are shown and an informational message explains that L0 spaces cannot be converted.

---

### User Story 2 — Resource Transfers Between Accounts (Priority: P2)

As a **Platform Administrator**, I want to transfer resources (spaces, innovation hubs, innovation packs, virtual contributors) from one account to another so that I can handle organizational changes like mergers, restructuring, or license migrations without recreating content.

The Transfers area provides dedicated subsections for each resource type. For new transfer operations (Innovation Hub, Innovation Pack, Virtual Contributor), the admin enters the source resource URL, the system resolves it and shows details, then the admin selects the target account from a searchable picker and confirms. The existing Transfer Space subsection is preserved as-is with its current URL-based interaction pattern.

**Why this priority**: Account resource transfers are essential for platform operations but happen less frequently than hierarchy changes. They are simpler operations (only account reference and authorization updated — no community changes) but still require UI to avoid API calls.

**Independent Test**: Can be fully tested by entering a resource URL, selecting a target account from the picker (or URL for existing Transfer Space), confirming, and verifying the resource appears under the new account.

**Acceptance Scenarios**:

1. **Given** the admin is on the Transfer Space subsection (existing), **When** they enter a space URL and target account URL, **Then** the existing two-column URL-based workflow operates identically to the current implementation.
2. **Given** the admin is on the Transfer Innovation Hub subsection, **When** they enter a hub URL, **Then** the system resolves it and shows the hub name, current account, and a searchable picker for the target account.
3. **Given** the admin selects a target account from the picker for an innovation pack transfer, **When** they confirm, **Then** the pack is transferred and a success message is shown.
4. **Given** the admin enters a virtual contributor URL in the Transfer VC subsection, **When** it is resolved, **Then** the system shows the VC name, current account, and a searchable picker for the target account.
5. **Given** the admin lacks the required transfer privileges on either the source or target account, **When** they attempt a transfer, **Then** the operation is rejected with a clear authorization error.

---

### User Story 3 — Virtual Contributor Type Conversion (Priority: P3)

As a **Platform Administrator**, I want to convert a virtual contributor from space-based to knowledge-base-based so that the VC can operate independently from its source space while retaining its knowledge content.

This operation lives in the Conversions area as a dedicated subsection separate from space conversions, since it operates on a different entity type.

**Why this priority**: Specialized conversion for a specific administrative need. Less frequent than space hierarchy changes or account transfers, but important for VC lifecycle management.

**Independent Test**: Can be fully tested by entering a VC URL, viewing its current type and source space details (including callout count), confirming the conversion, and verifying the VC type changed and callouts moved from the source space to the VC's knowledge base.

**Acceptance Scenarios**:

1. **Given** the admin enters a space-based VC URL in the VC Conversion subsection, **When** it is resolved, **Then** the system displays the VC name, current type (Space-based), source space, and the number of callouts that will be moved.
2. **Given** the admin confirms the conversion, **When** the operation succeeds, **Then** the VC type changes to Knowledge Base-based and all callouts are moved (not copied) from the source space to the VC's knowledge base.
3. **Given** the VC and source space do not belong to the same account, **When** the admin attempts the conversion, **Then** the operation is rejected with a clear error explaining the same-account constraint.
4. **Given** the admin enters a VC that is already knowledge-base-based, **When** it is resolved, **Then** the conversion option is disabled with an explanation.

---

### User Story 4 — Callout Transfer Between Callouts Sets (Priority: P4)

As a **Global Administrator**, I want to transfer a callout from one callouts set to another so that I can reorganize content across spaces or collaborations.

This operation lives in the Transfers area. The existing Transfer Callout subsection is preserved as-is with its current URL-based interaction pattern.

**Why this priority**: Experimental operation restricted to Global Admins. Most granular transfer for edge-case content reorganization.

**Independent Test**: Can be fully tested using the existing Transfer Callout UI by entering a callout URL and target space URL, reviewing warnings, confirming, and verifying the callout moved.

**Acceptance Scenarios**:

1. **Given** the admin is on the Transfer Callout subsection (existing), **When** they enter a callout URL, **Then** the system displays the callout name, contribution count, and current location using the existing workflow.
2. **Given** the admin confirms a callout transfer, **When** the confirmation dialog appears, **Then** it warns that: the executing user becomes the new creator, non-default tagsets will be deleted, and classification values will be reset to the target's defaults.
3. **Given** the callout is a template callout, **When** the admin attempts to transfer it, **Then** the operation is rejected with a clear error.
4. **Given** the callout's nameID conflicts with an existing callout in the target set, **When** the admin attempts the transfer, **Then** the operation is rejected with a nameID collision error.

---

### Edge Cases

- **Invalid URL entry**: The system displays a clear "entity not found" error without crashing.
- **Insufficient privileges**: The operation button is disabled or the mutation returns an authorization error displayed inline.
- **Concurrent modification**: The mutation may fail with a conflict error, displayed to the admin with guidance to retry.
- **Already at target state**: Conversion options that are not applicable to the resolved entity's current level are hidden or disabled with an explanation.
- **Network/server failure during operation**: The admin sees an error message. Backend mutations are atomic — no partial state. Safe to retry.
- **Empty picker results**: When the searchable picker returns no results (e.g., no valid parent L1 spaces, no accessible accounts), the admin sees an explanatory message and the operation cannot proceed.

## Requirements *(mandatory)*

### Functional Requirements

#### Page & Navigation

- **FR-001**: System MUST provide a dedicated "Conversions & Transfers" page within the Platform Administration section, accessible only to users with Platform Admin privileges.
- **FR-002**: The page MUST be organized into two main areas by use case:
  - **Conversions area**: Space hierarchy conversions (single URL input with dynamic operation display based on resolved level) and VC type conversion (dedicated subsection with its own URL input).
  - **Transfers area**: Dedicated subsections per resource type — Transfer Space (existing, preserved as-is), Transfer Innovation Hub, Transfer Innovation Pack, Transfer Virtual Contributor, and Transfer Callout (existing, preserved as-is).

#### Entity Resolution & State Display

- **FR-003**: System MUST allow admins to identify source entities by URL and resolve them to display their current state.
- **FR-004**: Before any conversion or transfer, system MUST display the entity's current state: name, level (for spaces), community member count (for spaces with destructive community changes), account owner, and relevant attributes.
- **FR-005**: For L1 → L2 demotion, system MUST display the count of community members, leads, organizations, and virtual contributors that will be removed.
- **FR-006**: For VC type conversion, system MUST display the number of callouts that will be moved from the source space.
- **FR-025**: For space conversions, when a space URL is resolved, system MUST display only the conversion operations applicable to that space's current level (L0: none with informational message; L1: promote to L0 and demote to L2; L2: promote to L1).

#### Target Selection

- **FR-026**: For L1 → L2 demotion, the target parent L1 space MUST be selected from a searchable picker component showing only valid L1 spaces within the same L0 space, preventing invalid selections.
- **FR-027**: For new resource transfer operations (Innovation Hub, Innovation Pack, Virtual Contributor), the target account MUST be selected from a searchable picker component with search capability for larger lists.
- **FR-028**: The existing Transfer Space and Transfer Callout subsections MUST retain their current URL-based interaction pattern without modification.

#### Confirmation Dialogs

- **FR-007**: System MUST present a confirmation dialog before executing any conversion or transfer, clearly stating the operation and its consequences.
- **FR-008**: For L1 → L2 demotion (most destructive), the confirmation MUST explicitly list that all user members, user leads, organization members, organization leads, and virtual contributor members will be removed — only user admins are preserved.
- **FR-009**: For L1 → L0 promotion, the confirmation MUST warn that the innovation flow will be reset to platform defaults (custom states lost).
- **FR-010**: For VC type conversion, the confirmation MUST warn that callouts are moved (not copied) from the source space — the source space loses them.
- **FR-011**: For callout transfer, the confirmation MUST warn that: creator attribution changes to the executing user, non-default tagsets are deleted, and classification values are reset.

#### Conversion Operations

- **FR-012**: System MUST support promoting a subspace to a top-level space (L1 → L0), using the `convertSpaceL1ToSpaceL0` mutation.
- **FR-013**: System MUST support promoting a sub-subspace to a subspace (L2 → L1), using the `convertSpaceL2ToSpaceL1` mutation.
- **FR-014**: System MUST support demoting a subspace to a sub-subspace (L1 → L2), using the `convertSpaceL1ToSpaceL2` mutation.
- **FR-015**: System MUST support converting a space-based VC to knowledge-base-based, using the `convertVirtualContributorToUseKnowledgeBase` mutation.

#### Transfer Operations

- **FR-016**: System MUST support transferring a space to another account, using the `transferSpaceToAccount` mutation (existing functionality preserved).
- **FR-017**: System MUST support transferring an innovation hub to another account, using the `transferInnovationHubToAccount` mutation.
- **FR-018**: System MUST support transferring an innovation pack to another account, using the `transferInnovationPackToAccount` mutation.
- **FR-019**: System MUST support transferring a virtual contributor to another account, using the `transferVirtualContributorToAccount` mutation.
- **FR-020**: System MUST support transferring a callout between callouts sets, using the `transferCallout` mutation (existing functionality preserved).

#### Feedback & Error Handling

- **FR-021**: System MUST display a loading indicator during mutation execution and prevent duplicate submissions.
- **FR-022**: System MUST display clear success messages after successful operations, including the entity's new state or location.
- **FR-023**: System MUST display clear error messages when operations fail, including the reason (authorization failure, constraint violation, server error).
- **FR-024**: System MUST disable or hide conversion options that are not applicable to the resolved entity.

### Key Entities

- **Space**: Organizational unit at level 0 (space), 1 (subspace), or 2 (sub-subspace). Hierarchy level determines which conversions are available. Has a community with role assignments, collaboration with callouts, and belongs to an account.
- **Account**: Hosting entity for top-level spaces and other resources. Target for all resource transfer operations. Identified by its associated organization or user.
- **Virtual Contributor (VC)**: AI-powered contributor that can be either space-based (ALKEMIO_SPACE) or knowledge-base-based (KNOWLEDGE_BASE). Type conversion moves callouts from source space.
- **Innovation Hub**: Custom landing page resource owned by an account. Transferable between accounts.
- **Innovation Pack**: Collection of templates owned by an account. Transferable between accounts.
- **Callout**: Content container within a callouts set. Holds contributions (posts, links, whiteboards). Transferable between callouts sets with side effects on tagsets and creator attribution.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Platform admins can perform all 9 conversion/transfer operations from the UI without any direct API calls.
- **SC-002**: Every destructive operation (L1→L2, VC conversion, callout transfer) presents a confirmation dialog that clearly lists all data changes, and the admin must actively confirm before execution.
- **SC-003**: 100% of operations that violate constraints are rejected with a user-understandable error message before the mutation is attempted or upon server rejection.
- **SC-004**: Admins can complete any single conversion or transfer operation (from entity identification to confirmation) in under 60 seconds.
- **SC-005**: The existing transfer space and transfer callout functionality continues to work identically after the page is extended.
- **SC-006**: All confirmation dialogs for destructive operations accurately describe the community and content impact specific to each operation type (no generic warnings).
- **SC-007**: For space conversions, only the operations applicable to the resolved space's current level are presented — no invalid operation can be attempted from the UI.

## Clarifications

### Session 2026-03-23

- Q: Should the four resource transfer types share a single URL input or each have a dedicated subsection? → A: Separate subsection per resource type, consistent with existing pattern.
- Q: For L1→L2 demotion, how should the admin specify the target parent L1 space? → A: Searchable picker showing only valid L1 spaces within the same L0 space.
- Q: How should the page be organized? → A: Two main areas by use case — Conversions (space hierarchy + VC type) and Transfers (resource ownership + callout). Space conversions use a single URL input with dynamic operation display based on level.
- Q: How should target entities be selected for new operations? → A: Searchable picker components (reusing existing codebase component) for all new target selections. Existing Transfer Space and Transfer Callout subsections retain their URL-based pattern unchanged.

## Assumptions

- **Frontend-only scope**: This feature is strictly frontend work. No backend, schema, or resolver changes are required. All work involves building React components, hooks, and GraphQL documents that call pre-existing mutations.
- **Backend mutations exist and are stable**: All 9 mutations (`transferSpaceToAccount`, `transferCallout`, `transferInnovationHubToAccount`, `transferInnovationPackToAccount`, `transferVirtualContributorToAccount`, `convertSpaceL1ToSpaceL0`, `convertSpaceL1ToSpaceL2`, `convertSpaceL2ToSpaceL1`, `convertVirtualContributorToUseKnowledgeBase`) are already implemented, tested, and available in the GraphQL schema. The frontend consumes them as-is.
- **Existing transfer subsections preserved**: TransferSpaceSection and TransferCalloutSection are integrated into the new page layout without modifying their interaction pattern (URL-based source and target).
- **Source entity identification by URL**: Admins identify source entities by entering their URL (consistent with existing pattern across all operations).
- **Target selection by searchable picker for new operations**: New operations use an existing searchable picker component for target selection (target account for Hub/Pack/VC transfers, target parent L1 for demotion). This provides search capability for larger lists.
- **URL-based targets only for existing implementations**: Only TransferSpace and TransferCallout retain URL-based target selection, as the only exception. All new operations use searchable pickers.
- **No new authorization model**: The UI relies on the existing privilege system (PLATFORM_ADMIN for conversions, TRANSFER_RESOURCE_OFFER/ACCEPT for transfers). No new privilege types are needed.
- **Single admin page, two areas**: All operations live on one page ("Conversions & Transfers") organized into two main areas by use case, as specified in the issue ("single dedicated Platform Administration page").
- **No post-operation navigation**: Admin operations show a success message on the same page. The admin stays on the admin page.
- **Dynamic operation display for space conversions**: A single URL input in the space conversions area resolves the space and shows applicable operations based on level, avoiding redundant URL entries for the same entity type.
