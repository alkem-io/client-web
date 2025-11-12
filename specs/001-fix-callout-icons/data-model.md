# Data Model: Fix Callout Icon Display

**Feature**: 001-fix-callout-icons
**Date**: November 12, 2025
**Phase**: 1 - Design & Contracts
**Status**: Complete

---

## Overview

This feature enhances the icon display logic for callouts without introducing new entities. It extends existing data access patterns to include contribution settings alongside framing information.

---

## Entities

### Callout (Existing - Enhanced Query)

**Description**: Represents a discussion post or content item in a Space/Challenge/Opportunity. Can have optional framing (additional content like Memo, Whiteboard, Link) and/or contribution settings (allowed response types).

**GraphQL Type**: `Callout`

**Key Fields**:

```graphql
type Callout {
  id: UUID!
  sortOrder: Float!
  framing: CalloutFraming!
  settings: CalloutSettings!
  # ...other fields
}
```

**Enhanced Fragment** (for list queries):

```graphql
fragment Callout on Callout {
  id
  sortOrder
  framing {
    id
    type # CalloutFramingType enum
    profile {
      id
      url
      displayName
    }
  }
  settings {
    visibility
    contribution {
      allowedTypes # NEW: [CalloutContributionType!]!
    }
  }
}
```

**Relationships**:

- Has one `CalloutFraming` (framing content)
- Has one `CalloutSettings` (visibility, contribution rules)
- May have many `CalloutContribution` instances (responses)

---

### CalloutFraming (Existing - No Changes)

**Description**: Optional additional content attached to a callout (Memo, Whiteboard, or Link).

**GraphQL Type**: `CalloutFraming`

**Key Fields**:

```graphql
type CalloutFraming {
  id: UUID!
  type: CalloutFramingType! # Enum: NONE, MEMO, WHITEBOARD, LINK
  profile: Profile!
  # ...memo, whiteboard, link specific fields
}
```

**Validation Rules**:

- `type` determines which icon to display
- `NONE` means no framing (fallback to contribution icon or Post)

---

### CalloutSettings (Existing - Enhanced Query)

**Description**: Configuration for callout visibility and contribution rules.

**GraphQL Type**: `CalloutSettings`

**Key Fields**:

```graphql
type CalloutSettings {
  visibility: CalloutVisibility!
  contribution: CalloutContributionSettings!
  # ...other fields
}
```

**Enhanced Fragment**:

```graphql
fragment CalloutSettingsFull on CalloutSettings {
  visibility
  contribution {
    enabled
    allowedTypes # [CalloutContributionType!]!
    canAddContributions
    commentsEnabled
  }
  framing {
    commentsEnabled
  }
}
```

**Validation Rules**:

- `contribution.allowedTypes` determines which response types are allowed
- Used for icon selection when `framing.type === NONE`
- Can be empty array (no contributions allowed)

---

### CalloutContributionSettings (Existing - No Changes)

**Description**: Settings controlling what types of contributions are allowed on a callout.

**GraphQL Type**: `CalloutContributionSettings`

**Key Fields**:

```graphql
type CalloutContributionSettings {
  enabled: Boolean!
  allowedTypes: [CalloutContributionType!]! # KEY FIELD for icon selection
  canAddContributions: Boolean!
  commentsEnabled: Boolean!
}
```

**Validation Rules**:

- `allowedTypes` array contains 0-4 values (POST, MEMO, WHITEBOARD, LINK)
- If empty, no contributions allowed → use Post icon as fallback
- First element used for icon selection (when no framing)

---

## Enums

### CalloutFramingType (Existing - No Changes)

**GraphQL Enum**:

```graphql
enum CalloutFramingType {
  NONE
  MEMO
  WHITEBOARD
  LINK
}
```

**Usage**: Determines which icon to display when callout has framing content.

**Icon Mapping** (defined in `calloutIcons.ts`):

- `NONE` → `LibraryBooksOutlined` (Post icon)
- `MEMO` → `MemoIcon`
- `WHITEBOARD` → `WhiteboardIcon`
- `LINK` → `CtaIcon`

---

### CalloutContributionType (Existing - No Changes)

**GraphQL Enum**:

```graphql
enum CalloutContributionType {
  POST
  MEMO
  WHITEBOARD
  LINK
}
```

**Usage**: Determines which types of responses are allowed, and which icon to display when no framing.

**Icon Mapping** (defined in `calloutIcons.ts`):

- `POST` → `LibraryBooksOutlined`
- `MEMO` → `MemoIcon`
- `WHITEBOARD` → `WhiteboardIcon`
- `LINK` → `ReferenceIcon`

---

## Domain Logic

### Icon Selection Logic (Pure Function)

**Location**: `src/domain/collaboration/callout/icons/calloutIcons.ts`

**Input**:

```typescript
interface IconSelectionInput {
  framingType: CalloutFramingType;
  allowedTypes?: CalloutContributionType[]; // NEW parameter
}
```

**Output**:

```typescript
interface IconSelectionOutput {
  IconComponent: ComponentType<SvgIconProps>;
  labelKey: TranslationKey; // i18n key for tooltip
}
```

**Algorithm**:

```
1. IF framingType !== NONE
     RETURN calloutFramingIcons[framingType]

2. ELSE IF allowedTypes is not empty
     RETURN contributionIcons[allowedTypes[0]]

3. ELSE
     RETURN GenericCalloutIcon (Post)
```

**Precedence Rule**: Framing Type > First Allowed Contribution Type > Post (default)

**Rationale**: Display what IS present (framing) over what COULD BE added (contributions)

---

### Validation Rules

#### Icon Selection

1. **Framing Precedence** ✅
   - When `framing.type !== NONE`, use framing icon
   - Ignores `allowedTypes` when framing exists
   - Ensures consistent "what you see" pattern

2. **Contribution Fallback** ✅
   - When `framing.type === NONE` and `allowedTypes` has values
   - Use icon for first allowed type (`allowedTypes[0]`)
   - Array order is significant (server-controlled)

3. **Default Fallback** ✅
   - When both framing and allowedTypes are None/empty
   - Always display Post icon (LibraryBooksOutlined)
   - Prevents blank/missing icons

4. **Null Safety** ✅
   - Handle `undefined` or `null` for `allowedTypes`
   - Handle empty array `[]` for `allowedTypes`
   - Handle unknown enum values (fallback to generic)

#### UI Constraints

1. **Icon Size** ✅
   - All icons must be 20px (`fontSize: 'small'` in MUI)
   - Enforced via `iconProps` parameter
   - Consistent across all views

2. **Spacing** ✅
   - `ListItemIcon` minimum width: `theme.spacing(4)` (32px)
   - Reduced from default (56px)
   - Applied consistently in all list views

3. **Tooltips** ✅
   - Always enabled via `tooltip={true}` prop
   - Uses i18n key pattern: `common.calloutType.{TYPE}`
   - Keyboard accessible (MUI Tooltip default)

4. **Accessibility** ✅
   - Icons have `titleAccess` when tooltip disabled
   - Tooltips have `aria-describedby` (MUI default)
   - Color contrast meets WCAG AA (theme-provided)

---

## State Transitions

### None (Stateless Logic)

Icon selection is a pure, stateless function of callout data:

- Input: Callout data from Apollo cache
- Process: Deterministic icon selection
- Output: Icon component + i18n key

**No state transitions** - Icons update reactively when callout data changes via Apollo cache updates.

---

## Cache Strategy

### Apollo Cache (Existing - Enhanced)

**Normalization**:

- Callouts normalized by `id` field
- Fragments automatically merged into cache
- Adding `settings.contribution.allowedTypes` updates existing cache entries

**Cache Updates**:

- **Query**: Fetch callout lists with enhanced fragment
- **Automatic**: Apollo merges new `allowedTypes` field into cache
- **Reactive**: Components re-render when cache updates

**Cache Key**:

```
Callout:{id}
```

**Fragment Spread**:

```graphql
fragment Callout on Callout {
  # ...fields...
}
```

**No manual cache updates needed** - Apollo handles normalization and reactivity.

---

## Performance Considerations

### Query Payload

**Before** (Callout fragment):

- ~15 fields per callout
- ~500-800 bytes per callout

**After** (with `allowedTypes`):

- ~16 fields per callout (+1 field)
- ~540-860 bytes per callout (+40-60 bytes)

**Impact**:

- 20 callouts: +800-1200 bytes (~5-10% increase)
- Acceptable within 5% baseline target (considering gzip)

### Render Performance

**Icon Selection**:

- Pure function (no side effects)
- O(1) lookup in icon maps
- Negligible performance impact (<1ms)

**Re-renders**:

- Only when callout data changes in cache
- React memoization prevents unnecessary re-renders
- MUI Tooltip manages own state

---

## Error Handling

### Missing Data

| Scenario                      | Handling             | Fallback            |
| ----------------------------- | -------------------- | ------------------- |
| `allowedTypes` is `undefined` | Treat as empty array | Post icon           |
| `allowedTypes` is `null`      | Treat as empty array | Post icon           |
| `allowedTypes` is `[]`        | Use default fallback | Post icon           |
| Unknown enum value            | Ignore, use fallback | Post icon           |
| `framing.type` is `undefined` | Treat as `NONE`      | Check contributions |

### GraphQL Errors

| Error                     | Handling                    | User Impact          |
| ------------------------- | --------------------------- | -------------------- |
| Query fails               | Show skeleton/loading state | Temporary, retry     |
| Field missing in response | Fallback to Post icon       | Graceful degradation |
| Network timeout           | Apollo retry policy         | Automatic retry      |

**Observability**:

- Log when `allowedTypes` is missing (unexpected)
- Log when unknown enum values encountered
- Track fallback usage in metrics

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│ GraphQL API                                                 │
│                                                             │
│  query CalloutsSet {                                        │
│    collaboration { callouts {                               │
│      id, framing { type }, settings { contribution {       │
│        allowedTypes                                         │
│      }}                                                     │
│    }}                                                       │
│  }                                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Apollo Client Cache (Normalized)                            │
│                                                             │
│  Callout:{uuid-1}: {                                        │
│    id, framing: { type: "MEMO" },                          │
│    settings: { contribution: { allowedTypes: ["POST"] }}    │
│  }                                                          │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ React Component (CalloutsList)                              │
│                                                             │
│  {callouts.map(callout => (                                 │
│    <CalloutIcon                                             │
│      framingType={callout.framing.type}                     │
│      allowedTypes={callout.settings?.contribution           │
│                     ?.allowedTypes}                         │
│    />                                                       │
│  ))}                                                        │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ Domain Logic (calloutIcons.ts)                              │
│                                                             │
│  getCalloutIconBasedOnType(                                 │
│    framingType: MEMO,                                       │
│    allowedTypes: ["POST"]                                   │
│  )                                                          │
│  → Returns: MemoIcon (framing takes precedence)             │
│                                                             │
│  getCalloutIconLabelKey(...)                                │
│  → Returns: "common.calloutType.MEMO"                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
┌─────────────────────────────────────────────────────────────┐
│ UI Rendering                                                │
│                                                             │
│  <MemoIcon fontSize="small" sx={{...}} />                   │
│  <Tooltip title={t("common.calloutType.MEMO")} />          │
└─────────────────────────────────────────────────────────────┘
```

---

## Summary

### Data Model Changes: MINIMAL ✅

- **No new entities** - Using existing GraphQL types
- **No schema changes** - Fields already exist
- **Enhanced queries** - Adding one field to list fragments
- **Pure logic** - Icon selection is deterministic function

### Implementation Impact: LOW ✅

- **Existing patterns** - Following established codebase conventions
- **Type safety** - Generated TypeScript types from GraphQL schema
- **Cache coherence** - Apollo handles normalization automatically
- **Performance** - Negligible impact on query/render performance

### Risk Level: LOW ✅

- **Backward compatible** - Additive changes only
- **Fallback safe** - Multiple levels of graceful degradation
- **Observable** - Logging for unexpected scenarios
- **Testable** - Pure functions, deterministic behavior
