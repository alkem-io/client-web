# GraphQL Contracts: Fix Callout Icon Display

**Feature**: 001-fix-callout-icons
**Date**: November 12, 2025
**Phase**: 1 - Design & Contracts

---

## Overview

This document defines the GraphQL contract changes required for the callout icon display feature. All changes are additive (no breaking changes) and use existing schema fields.

---

## Modified Fragments

### 1. Callout Fragment (CalloutsSetQueries.graphql)

**File**: `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql`

**Current Fragment**:

```graphql
fragment Callout on Callout {
  id
  sortOrder
  activity
  authorization {
    id
    myPrivileges
  }
  framing {
    id
    profile {
      id
      url
      displayName
    }
    type
  }
  settings {
    visibility
  }
}
```

**Modified Fragment** (add contribution.allowedTypes):

```graphql
fragment Callout on Callout {
  id
  sortOrder
  activity
  authorization {
    id
    myPrivileges
  }
  framing {
    id
    profile {
      id
      url
      displayName
    }
    type
  }
  settings {
    visibility
    contribution {
      allowedTypes # NEW: Array of CalloutContributionType enums
    }
  }
}
```

**Changes**:

- ✅ Add `contribution { allowedTypes }` under `settings`
- ✅ Keep all existing fields (backward compatible)
- ✅ Minimal payload increase (~40-60 bytes per callout)

**Impact**:

- All queries using this fragment will fetch `allowedTypes`
- Apollo cache automatically updates with new field
- Components can access via `callout.settings.contribution.allowedTypes`

---

### 2. CalloutDetails Fragment (Verification Only)

**File**: `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql`

**Current Fragment**:

```graphql
fragment CalloutDetails on Callout {
  id
  nameID
  type
  activity
  visibility
  sortOrder
  framing {
    id
    profile {
      id
      displayName
      description
      tagline
      tagsets {
        ...TagsetDetails
      }
      storageBucket {
        id
      }
      url
    }
    type
    whiteboard {
      ...CalloutWhiteboardDetails
    }
    memo {
      ...CalloutMemoDetails
    }
    link {
      ...LinkDetails
    }
  }
  contributionDefaults {
    id
    defaultDisplayName
    postDescription
    whiteboardContent
  }
  contributionPolicy {
    state
  }
  comments {
    id
    messagesCount
  }
  settings {
    ...CalloutSettingsFull
  }
  # ...other fields
}
```

**Verification**:

- ✅ Already uses `...CalloutSettingsFull` fragment spread
- ✅ `CalloutSettingsFull` includes `contribution.allowedTypes`
- ✅ No changes needed for detail queries

**File**: `src/domain/collaboration/callout/settings/graphql/CalloutSettingsFragment.graphql`

```graphql
fragment CalloutSettingsFull on CalloutSettings {
  contribution {
    enabled
    allowedTypes # ✅ Already includes this field
    canAddContributions
    commentsEnabled
  }
  framing {
    commentsEnabled
  }
  visibility
}
```

---

## Type Definitions

### TypeScript Interfaces (Generated)

After running `pnpm codegen`, the following types will be available:

**CalloutFragment** (generated from Callout fragment):

```typescript
export interface CalloutFragment {
  __typename?: 'Callout';
  id: string;
  sortOrder: number;
  activity: number;
  authorization?: {
    __typename?: 'Authorization';
    id: string;
    myPrivileges?: Array<AuthorizationPrivilege>;
  };
  framing: {
    __typename?: 'CalloutFraming';
    id: string;
    type: CalloutFramingType;
    profile: {
      __typename?: 'Profile';
      id: string;
      url: string;
      displayName: string;
    };
  };
  settings: {
    __typename?: 'CalloutSettings';
    visibility: CalloutVisibility;
    contribution?: {
      // NEW
      __typename?: 'CalloutContributionSettings';
      allowedTypes: Array<CalloutContributionType>;
    };
  };
}
```

**Enum Types** (already exist in generated schema):

```typescript
export enum CalloutFramingType {
  None = 'NONE',
  Memo = 'MEMO',
  Whiteboard = 'WHITEBOARD',
  Link = 'LINK',
}

export enum CalloutContributionType {
  Post = 'POST',
  Memo = 'MEMO',
  Whiteboard = 'WHITEBOARD',
  Link = 'LINK',
}
```

---

## Component Contract Updates

### CalloutIcon Component

**File**: `src/domain/collaboration/callout/icons/calloutIcons.ts`

**Current Interface**:

```typescript
interface CalloutIconProps {
  framingType: CalloutFramingType;
  contributionType?: CalloutContributionType; // OLD: single type
  tooltip?: boolean;
  iconProps?: SvgIconProps;
}
```

**Modified Interface**:

```typescript
interface CalloutIconProps {
  framingType: CalloutFramingType;
  allowedTypes?: CalloutContributionType[]; // NEW: array of types
  tooltip?: boolean;
  iconProps?: SvgIconProps;
}
```

**Changes**:

- Replace `contributionType?: CalloutContributionType` with `allowedTypes?: CalloutContributionType[]`
- Update icon selection logic to use `allowedTypes[0]` instead of `contributionType`
- Update label key generation to use `allowedTypes[0]`

**Backward Compatibility**:

- Breaking change for direct consumers (must pass array instead of single value)
- All consumers are internal to the codebase (controlled update)
- Update all call sites in same PR

---

## Usage Examples

### List View Component

**Before**:

```typescript
<CalloutIcon
  framingType={callout.framing.type}
  tooltip
  iconProps={{ sx: { color: theme.palette.primary.dark } }}
/>
```

**After**:

```typescript
<CalloutIcon
  framingType={callout.framing.type}
  allowedTypes={callout.settings?.contribution?.allowedTypes}  // NEW
  tooltip
  iconProps={{
    fontSize: 'small',  // NEW: 20px sizing
    sx: { color: theme.palette.primary.dark }
  }}
/>
```

**Changes**:

- Add `allowedTypes` prop from query data
- Add `fontSize: 'small'` to iconProps for 20px sizing
- Use optional chaining for safety (`settings?.contribution?.allowedTypes`)

---

### List Item Spacing

**Before**:

```typescript
<ListItemIcon>
  <CalloutIcon {...props} />
</ListItemIcon>
```

**After**:

```typescript
<ListItemIcon sx={{ minWidth: theme.spacing(4) }}>  {/* NEW: Reduced spacing */}
  <CalloutIcon {...props} />
</ListItemIcon>
```

**Changes**:

- Add `sx={{ minWidth: theme.spacing(4) }}` to ListItemIcon (32px, down from default 56px)

---

## Queries Affected

### CalloutsSet Query

**File**: `src/domain/collaboration/calloutsSet/useCalloutsSet/CalloutsSetQueries.graphql`

**Query**:

```graphql
query CalloutsSet($collaborationID: UUID!, $groups: [String!], $tagsets: [UUID!], $sortByActivity: Boolean) {
  lookup {
    collaboration(ID: $collaborationID) {
      id
      calloutsSet {
        id
        callouts(groups: $groups, tagsets: $tagsets, sortByActivity: $sortByActivity) {
          ...Callout # Uses modified fragment
        }
      }
    }
  }
}
```

**Impact**:

- Automatically includes `allowedTypes` when fragment is updated
- No query-level changes needed

---

### Search Results Query

**Files to Check**:

- `src/main/search/SearchQueries.graphql`
- Look for any callout fragments used in search results

**Verification Needed**:

- Check if search results display callout icons
- If yes, ensure fragment includes `settings.contribution.allowedTypes`
- If no, no changes needed

---

## Migration Path

### Step 1: Update GraphQL Fragment

```bash
# Edit CalloutsSetQueries.graphql
# Add contribution { allowedTypes } to Callout fragment
```

### Step 2: Regenerate Types

```bash
pnpm codegen
```

**Expected Output**:

- Updated `CalloutFragment` interface with `contribution.allowedTypes`
- No breaking changes to existing types
- All generated hooks update automatically

### Step 3: Update Icon Component

```typescript
// Update CalloutIconProps interface
// Update getCalloutIconBasedOnType function
// Update getCalloutIconLabelKey function
```

### Step 4: Update All Call Sites

```typescript
// Update CalloutsList.tsx
// Update CalloutCard.tsx (if applicable)
// Update any other components using CalloutIcon
```

### Step 5: Test

```bash
# Unit tests for icon selection logic
# Integration tests for list views
# Manual QA verification
```

---

## Validation Checklist

### GraphQL Changes ✅

- [ ] Fragment updated in `CalloutsSetQueries.graphql`
- [ ] `pnpm codegen` executed successfully
- [ ] Generated types include `contribution.allowedTypes`
- [ ] No TypeScript errors after codegen
- [ ] Apollo DevTools shows new field in queries

### Component Updates ✅

- [ ] `CalloutIconProps` interface updated
- [ ] `getCalloutIconBasedOnType` function updated
- [ ] `getCalloutIconLabelKey` function updated
- [ ] All call sites updated to pass `allowedTypes`
- [ ] Icon sizing updated to `fontSize: 'small'`
- [ ] Spacing updated to `theme.spacing(4)`

### Testing ✅

- [ ] Unit tests pass for icon selection logic
- [ ] Integration tests pass for list views
- [ ] Manual QA confirms icons display correctly
- [ ] Tooltips work and show correct text
- [ ] Performance within 5% baseline

---

## Schema Diff

**No schema changes** - Using existing fields from server schema.

Verify server schema includes:

```graphql
type CalloutContributionSettings {
  allowedTypes: [CalloutContributionType!]!
}

enum CalloutContributionType {
  POST
  MEMO
  WHITEBOARD
  LINK
}
```

**Verification**: Already confirmed in codebase analysis (research.md)

---

## Rollback Plan

If issues arise post-deployment:

### Option 1: Revert Fragment Change

```graphql
# Remove contribution { allowedTypes } from fragment
# Run pnpm codegen
# Deploy
```

**Impact**: Icons revert to framing-only logic

### Option 2: Feature Flag (if available)

```typescript
const useNewIconLogic = useFeatureFlag('callout-icon-enhancement');

<CalloutIcon
  framingType={callout.framing.type}
  allowedTypes={useNewIconLogic ? callout.settings?.contribution?.allowedTypes : undefined}
  {...props}
/>
```

**Impact**: Can toggle new logic on/off without deployment

---

## Performance Monitoring

### Metrics to Track

1. **GraphQL Query Performance**:
   - Query execution time (P50, P95, P99)
   - Payload size (before/after)
   - Network transfer time

2. **Render Performance**:
   - Time to first paint
   - Time to interactive
   - Icon render time (should be <1ms)

3. **Error Rates**:
   - GraphQL query failures
   - Missing field errors
   - Fallback icon usage

### Acceptable Thresholds

- Query time increase: <5%
- Payload size increase: <10%
- Render time: No measurable increase
- Error rate: 0% (graceful fallbacks)

---

## Summary

### Contract Changes: MINIMAL ✅

- **1 Fragment Modified**: `Callout` in CalloutsSetQueries.graphql
- **1 Component Updated**: `CalloutIcon` interface
- **No Breaking Schema Changes**: Using existing fields
- **Backward Compatible Queries**: Additive changes only

### Implementation Risk: LOW ✅

- Well-defined contracts
- Type safety via codegen
- Existing patterns followed
- Graceful fallbacks in place

### Next Phase: Implementation (Phase 2)

Ready to proceed to task breakdown via `/speckit.tasks` command.
