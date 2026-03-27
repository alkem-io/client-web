# Data Model: Admin UI for Space Conversions & Resource Transfers

**Date**: 2026-03-24 | **Plan**: [plan.md](./plan.md)

## Overview

This feature is **frontend-only** — no new data models are created. All entities already exist in the backend GraphQL schema. This document maps the entities, their relevant fields, relationships, and state transitions as consumed by the admin UI.

## Entities

### Space

The primary entity for conversion operations. Hierarchy level determines available conversions.

| Field | Type | UI Usage |
|-------|------|----------|
| `id` | `UUID` | Mutation input |
| `about.profile.displayName` | `String` | Display in state card |
| `about.profile.url` | `String` | URL resolution input |
| `level` | `SpaceLevel` (L0/L1/L2) | Determines available operations |
| `levelZeroSpaceID` | `UUID` | Fetch sibling L1 spaces for demotion picker |
| `subspaces[]` | `[Space]` | L1 picker options for demotion |
| `community.roleSet` | `RoleSet` | Member/lead counts for L1→L2 warning |
| `account.host.profile.displayName` | `String` | Display account owner |
| `authorization.myPrivileges` | `[AuthorizationPrivilege]` | Check PLATFORM_ADMIN |

**State transitions (level changes)**:

```
L0 ──(no conversions)──> L0
         ▲
         │ convertSpaceL1ToSpaceL0
         │
L1 ──────┤
         │ convertSpaceL1ToSpaceL2 (requires target parent L1)
         │
         ▼
L2 ──(convertSpaceL2ToSpaceL1)──> L1
```

**Validation rules**:
- L1→L2: target parent L1 must be within same L0 (`levelZeroSpaceID` match)
- L1→L2: target parent L1 must not be the source space itself
- L0: no conversions available

---

### Account

Target entity for resource transfers. Identified via host user or organization.

| Field | Type | UI Usage |
|-------|------|----------|
| `id` | `UUID` | Mutation input (targetAccountID) |
| `host.profile.displayName` | `String` | Display in picker and confirmation |
| `host.profile.url` | `String` | Display link |
| `authorization.myPrivileges` | `[AuthorizationPrivilege]` | Check TRANSFER_RESOURCE_ACCEPT |

**Validation rules**:
- Target account must have `TRANSFER_RESOURCE_ACCEPT` privilege for the current user
- Source entity's account must have `TRANSFER_RESOURCE_OFFER` privilege

---

### Virtual Contributor

Subject of both transfer (account change) and conversion (type change) operations.

| Field | Type | UI Usage |
|-------|------|----------|
| `id` | `UUID` | Mutation input |
| `about.profile.displayName` | `String` | Display in state card |
| `about.profile.url` | `String` | URL resolution input |
| `aiPersona.bodyOfKnowledgeType` | `BodyOfKnowledgeType` | Determine conversion eligibility |
| `aiPersona.bodyOfKnowledgeID` | `UUID` | Fetch source space for callout count |
| `account.host.profile.displayName` | `String` | Display current account |
| `authorization.myPrivileges` | `[AuthorizationPrivilege]` | Privilege checks |

**State transitions (type conversion)**:

```
ALKEMIO_SPACE ──(convertVirtualContributorToUseKnowledgeBase)──> KNOWLEDGE_BASE
```

**Validation rules**:
- Only `ALKEMIO_SPACE` type VCs can be converted (disable conversion for `KNOWLEDGE_BASE`)
- VC and source space must belong to the same account (server-enforced)

---

### Innovation Hub

Subject of account transfer operations.

| Field | Type | UI Usage |
|-------|------|----------|
| `id` | `UUID` | Mutation input |
| `about.profile.displayName` | `String` | Display in state card |
| `about.profile.url` | `String` | URL resolution input |
| `account.host.profile.displayName` | `String` | Display current account |
| `authorization.myPrivileges` | `[AuthorizationPrivilege]` | Privilege checks |

---

### Innovation Pack

Subject of account transfer operations.

| Field | Type | UI Usage |
|-------|------|----------|
| `id` | `UUID` | Mutation input |
| `about.profile.displayName` | `String` | Display in state card |
| `about.profile.url` | `String` | URL resolution input |
| `account.host.profile.displayName` | `String` | Display current account |
| `authorization.myPrivileges` | `[AuthorizationPrivilege]` | Privilege checks |

---

### Callout (existing — preserved as-is)

Subject of transfer between callouts sets. No changes needed.

| Field | Type | UI Usage |
|-------|------|----------|
| `id` | `UUID` | Mutation input |
| `framing.profile.displayName` | `String` | Display name |
| `contributionPolicy.state` | `CalloutState` | Display current state |
| `contributions` | `[CalloutContribution]` | Contribution count for warnings |

---

## Mutation Input/Output Types

### Conversion Mutations

| Mutation | Input Type | Key Fields | Return |
|----------|-----------|------------|--------|
| `convertSpaceL1ToSpaceL0` | `ConvertSpaceL1ToSpaceL0Input` | `spaceL1ID: UUID!` | `Space { id }` |
| `convertSpaceL2ToSpaceL1` | `ConvertSpaceL2ToSpaceL1Input` | `spaceL2ID: UUID!` | `Space { id }` |
| `convertSpaceL1ToSpaceL2` | `ConvertSpaceL1ToSpaceL2Input` | `spaceL1ID: UUID!, parentSpaceL1ID: UUID!` | `Space { id }` |
| `convertVirtualContributorToUseKnowledgeBase` | `ConversionVcSpaceToVcKnowledgeBaseInput` | `virtualContributorID: UUID!` | `VirtualContributor { id }` |

### Transfer Mutations

| Mutation | Input Type | Key Fields | Return |
|----------|-----------|------------|--------|
| `transferSpaceToAccount` | `TransferAccountSpaceInput` | `spaceID: UUID!, targetAccountID: UUID!` | `Space { id }` |
| `transferInnovationHubToAccount` | `TransferAccountInnovationHubInput` | `innovationHubID: UUID!, targetAccountID: UUID!` | `InnovationHub { id }` |
| `transferInnovationPackToAccount` | `TransferAccountInnovationPackInput` | `innovationPackID: UUID!, targetAccountID: UUID!` | `InnovationPack { id }` |
| `transferVirtualContributorToAccount` | `TransferAccountVirtualContributorInput` | `virtualContributorID: UUID!, targetAccountID: UUID!` | `InnovationPack { id }` * |
| `transferCallout` | `TransferCalloutInput` | `calloutID: UUID!, targetCalloutsSetID: UUID!` | `Callout { id }` |

\* Note: `transferVirtualContributorToAccount` has a likely backend return type mismatch (returns `InnovationPack` instead of `VirtualContributor`). This is a known backend issue — the frontend should request `{ id }` only and not rely on typed return fields.

## Relationships

```
Account (host)
├── Space (L0) ─── transferSpaceToAccount
│   ├── Space (L1) ─── convertSpaceL1ToSpaceL0 / convertSpaceL1ToSpaceL2
│   │   └── Space (L2) ─── convertSpaceL2ToSpaceL1
│   └── Collaboration
│       └── CalloutsSet
│           └── Callout ─── transferCallout
├── InnovationHub ─── transferInnovationHubToAccount
├── InnovationPack ─── transferInnovationPackToAccount
└── VirtualContributor ─── transferVirtualContributorToAccount / convertVcToKnowledgeBase
```

## Community Impact Matrix

Critical for confirmation dialog content (FR-005, FR-008):

| Operation | User Members | User Leads | User Admins | Org Members | Org Leads | VC Members |
|-----------|-------------|------------|-------------|-------------|-----------|------------|
| L1→L0 | Kept | Kept | Reset | Kept | Kept | Kept |
| L2→L1 | Kept | Kept | Reset | Kept | Kept | Kept |
| **L1→L2** | **REMOVED** | **REMOVED** | Reset (kept) | **REMOVED** | **REMOVED** | **REMOVED** |
| Account transfers | Kept | Kept | Kept | Kept | Kept | Kept |

## Content Impact Matrix

| Operation | Callouts | Contributions | Innovation Flow | Tagsets |
|-----------|---------|---------------|-----------------|---------|
| L1→L0 | Kept | Kept | **Reset to defaults** | Kept |
| L2→L1 | Kept | Kept | Kept | Kept |
| L1→L2 | Kept | Kept | Kept | Kept |
| VC→KB | **Moved** from space | Moved with callouts | N/A | Reset per transfer |
| Callout transfer | Moved | Kept | N/A | Non-default **deleted** |
