# Conversion & Transfer Capabilities Analysis

## Overview

The platform has **9 mutations** across **3 resolver files** covering two categories:
- **Space hierarchy conversions** (4 mutations) - promote/demote spaces between L0/L1/L2
- **Account resource transfers** (5 mutations) - move resources between accounts or callouts sets

All require elevated privileges (PLATFORM_ADMIN or TRANSFER_RESOURCE_OFFER/ACCEPT).

---

## 1. Space Hierarchy Conversions

**File**: `src/services/api/conversion/conversion.service.ts` + `conversion.resolver.mutations.ts`

### 1a. `convertSpaceL1ToSpaceL0` — Promote subspace to top-level

| Aspect | What happens |
|---|---|
| **Level** | L1 → L0 |
| **Parent** | Removed (set to `undefined`) |
| **Account** | Inherits the original L0's account |
| **nameID** | Regenerated to avoid reserved name conflicts |
| **levelZeroSpaceID** | Set to itself (it IS the new L0) |
| **Community/RoleSet** | Admin users temporarily removed, parent roleSet detached (`removeParentRoleSet`), admins re-added. Members/leads are **preserved** |
| **Storage** | `parentStorageAggregator` → account's aggregator |
| **License** | New license created; license plans assigned from account type |
| **Templates** | New `templatesManager` created for L0 |
| **Innovation Flow** | **Reset to platform default L0 template** (existing custom states lost) |
| **Child L2 spaces** | All L2 children are **automatically promoted to L1** under the new L0 (via `updateChildSpaceL2ToL1`), with roleSet parent set to this space's roleSet |
| **Authorization** | Full `applyAuthorizationPolicy` reset on the new L0 and all children |

**Key insight**: The original L0 space loses this subspace from its `subspaces` array. The innovation flow is the main data loss — custom states are overwritten with platform defaults.

---

### 1b. `convertSpaceL2ToSpaceL1` — Promote sub-subspace to subspace

| Aspect | What happens |
|---|---|
| **Level** | L2 → L1 |
| **Parent** | Changed to the L0 space (becomes direct child of L0) |
| **Community/RoleSet** | Admin users temporarily removed, roleSet parent updated to L0's roleSet via `setParentRoleSetAndCredentials`, admins re-added. Members/leads **preserved** |
| **Storage** | `parentStorageAggregator` → L0's aggregator |
| **Authorization** | Reset with parent space authorization inheritance |

**Key insight**: Relatively lightweight conversion. All community members/leads preserved. Only admin credentials are reset to pick up new parent chain.

---

### 1c. `convertSpaceL1ToSpaceL2` — Demote subspace to sub-subspace

| Aspect | What happens |
|---|---|
| **Level** | L1 → L2 |
| **Constraint** | Must stay within same L0 space (validated) |
| **Parent** | Set to the specified parent L1 space |
| **Community/RoleSet** | **MOST DESTRUCTIVE** — ALL roles removed except user ADMINs: |
| | - User MEMBERs: **removed** |
| | - User LEADs: **removed** |
| | - Organization MEMBERs: **removed** |
| | - Organization LEADs: **removed** |
| | - Virtual Contributor MEMBERs: **removed** |
| | - User ADMINs: **preserved** (removed then re-added) |
| **Storage** | `parentStorageAggregator` → parent L1's aggregator |
| **Authorization** | Reset with parent space authorization inheritance |

**Key insight**: This is the most destructive conversion. The entire community (except admins) is wiped. The GraphQL description explicitly documents this: _"all user, organization and virtual contributor role assignments are removed, with the exception of Admin role assignments for Users."_

---

### 1d. `convertVirtualContributorToUseKnowledgeBase` — Change VC type

| Aspect | What happens |
|---|---|
| **VC type** | `ALKEMIO_SPACE` → `KNOWLEDGE_BASE` |
| **Constraint** | VC and source space must belong to same account |
| **Callouts** | ALL callouts from the source space's CalloutsSet are **transferred** to the VC's knowledge base CalloutsSet (uses `CalloutTransferService`) |
| **Authorization** | VC authorization policy re-applied |

**Key insight**: The callouts are **moved**, not copied. The source space loses them. Each callout goes through the full transfer pipeline (storage, URL cache, tagsets, classification updates).

---

## 2. Callout Transfer

**File**: `src/domain/collaboration/callout-transfer/callout.transfer.service.ts` + resolver

### `transferCallout` — Move callout between CalloutsSet instances

| Aspect | What happens |
|---|---|
| **Authorization** | Requires `TRANSFER_RESOURCE_OFFER` on source + `TRANSFER_RESOURCE_ACCEPT` on target |
| **Restriction** | Template callouts cannot be transferred |
| **CalloutsSet** | Reference updated to target |
| **nameID** | Validated unique in target set (fails if duplicate) |
| **Storage buckets** | ALL storage buckets reassigned to target's aggregator: framing profile, framing whiteboard, and every contribution (post/link/whiteboard/memo) |
| **URL caches** | All profile URL caches revoked (framing + all contributions) |
| **Tagsets** | Non-DEFAULT tagsets **deleted**; new tagsets created from target CalloutsSet's template definitions |
| **Classification** | Updated to match target CalloutsSet's tagset templates (allowed values, default selections) |
| **Creator** | The user executing the transfer **becomes the creator** |
| **Contributions** | All posts, links, whiteboards, memos are **preserved** (they move with the callout) |
| **Authorization** | Full policy reset inheriting from target CalloutsSet authorization |

**What is preserved**: Callout ID, nameID, all contributions and their content, framing, DEFAULT tagset.
**What is lost/changed**: Non-default tagsets, classification values (reset to target defaults), creator attribution, URL caches.

---

## 3. Account Resource Transfers

**File**: `src/domain/space/account/account.resolver.mutations.ts`

All 4 mutations follow the same pattern:

```text
1. Load resource with account relation
2. Load target account
3. Validate: TRANSFER_RESOURCE_OFFER on source account + TRANSFER_RESOURCE_ACCEPT on target
4. Update account reference → target
5. Re-apply authorization policy
```

### `transferSpaceToAccount`
- Space's `account` reference updated
- Full `applyAuthorizationPolicy` reset (no parent auth passed — space is L0)
- Community/members: **unchanged** (no role manipulation)

### `transferInnovationHubToAccount`
- Hub's `account` reference updated
- Authorization uses `getClonedAccountAuthExtendedForChildEntities` from target account

### `transferInnovationPackToAccount`
- Pack's `account` reference updated
- Authorization uses cloned account auth for child entities

### `transferVirtualContributorToAccount`
- VC's `account` reference updated
- Standard VC authorization policy re-applied
- **Possible bug**: return type annotation says `IInnovationPack` but actually returns `IVirtualContributor` (line 496 of account.resolver.mutations.ts — likely a copy-paste error)
- **Frontend mitigation**: request only `{ id }` from this mutation response. Do not rely on pack- or VC-specific return fields until the backend annotation/schema is corrected.

---

## Summary: What Happens to Communities

| Operation | Members | Leads | Admins | Orgs | VCs |
|---|---|---|---|---|---|
| L1→L0 | **Kept** | **Kept** | Reset (remove + re-add) | **Kept** | **Kept** |
| L2→L1 | **Kept** | **Kept** | Reset (remove + re-add) | **Kept** | **Kept** |
| L1→L2 | **REMOVED** | **REMOVED** | Reset (remove + re-add) | **REMOVED** | **REMOVED** |
| Space→Account transfer | **Kept** | **Kept** | **Kept** | **Kept** | **Kept** |
| Callout transfer | N/A | N/A | Creator changes | N/A | N/A |

## Summary: What Happens to Content

| Operation | Callouts | Contributions | Innovation Flow | Tagsets |
|---|---|---|---|---|
| L1→L0 | **Kept** | **Kept** | **Reset to default** | **Kept** |
| L2→L1 | **Kept** | **Kept** | **Kept** | **Kept** |
| L1→L2 | **Kept** | **Kept** | **Kept** | **Kept** |
| VC→KnowledgeBase | **Moved** from space | **Moved** with callouts | N/A | Reset per transfer |
| Callout transfer | **Moved** | **Kept** (move with callout) | N/A | Non-default **deleted** |

## Notable Observations

1. **No domain events emitted** during any conversion/transfer — changes are persisted directly
2. **L1→L2 is the most destructive** — wipes entire community except user admins
3. **Callout transfer changes creator** — the executing user becomes the callout creator
4. **Account transfers are lightweight** — only account reference + authorization updated, no community changes
5. **Innovation flow reset on L1→L0** — custom workflow states are lost when promoting to top-level
6. **Possible bug**: `transferVirtualContributorToAccount` has `@Mutation(() => IInnovationPack` instead of `IVirtualContributor` (line 496 of account.resolver.mutations.ts)
