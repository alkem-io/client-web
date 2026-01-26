# Data Model: Guest Whiteboard Contributions Toggle

**Date**: 2025-10-31
**Feature**: Guest Whiteboard Contributions Toggle

## Entity Definitions

### SpaceSettingsCollaboration (Extended)

**Description**: Collaboration settings for a space, extended to include guest contribution permissions.

**Fields**:

- `allowEventsFromSubspaces: Boolean!` - (existing) Allow events from subspaces
- `allowMembersToCreateCallouts: Boolean!` - (existing) Allow members to create callouts
- `allowMembersToCreateSubspaces: Boolean!` - (existing) Allow members to create subspaces
- `allowMembersToVideoCall: Boolean!` - (existing) Allow members to video call
- `inheritMembershipRights: Boolean!` - (existing) Inherit membership rights
- `allowGuestContributions: Boolean!` - **NEW** Allow guest contributions to whiteboards

**Validation Rules**:

- All fields are required (non-nullable)
- `allowGuestContributions` defaults to `false` for security
- No interdependencies with other fields

**State Transitions**:

- `allowGuestContributions: false → true`: Enables guest sharing UI in whiteboards
- `allowGuestContributions: true → false`: Hides guest sharing UI, maintains existing shared states (future: may disable URLs)

**Relationships**:

- Parent: `SpaceSettings.collaboration`
- Consumer: Future whiteboard sharing components (via domain façade)

### Space (Context Entity)

**Description**: Each space independently manages its guest contribution setting.

**Relevant Fields**:

- `id: UUID!` - Space identifier
- `settings.collaboration.allowGuestContributions: Boolean!` - The setting value

**Invariants**:

- No inheritance between parent spaces and subspaces
- Setting applies only to whiteboards directly within the space
- Admin authorization required for changes (`UPDATE` privilege on space settings)

### Default Settings Model

**Description**: Default values for new spaces.

**Structure**:

```typescript
defaultSpaceSettings = {
  collaboration: {
    allowGuestContributions: false, // NEW: Conservative default
    // ... existing fields
  },
};
```

## Domain Model Interfaces

### SpaceSettingsCollaboration Interface

```typescript
interface SpaceSettingsCollaboration {
  allowMembersToCreateCallouts: boolean;
  allowMembersToCreateSubspaces: boolean;
  inheritMembershipRights: boolean;
  allowEventsFromSubspaces: boolean;
  allowMembersToVideoCall: boolean;
  allowGuestContributions: boolean; // NEW
}
```

### Domain Façade Response

```typescript
interface SpaceGuestContributionsState {
  allowGuestContributions: boolean;
  loading: boolean;
  error?: ApolloError;
}
```

## Data Flow

### Read Path

1. Component calls `useSpaceGuestContributions(spaceId)`
2. Hook executes `useSpaceSettingsQuery`
3. Apollo cache returns normalized data by space ID
4. Hook extracts `settings.collaboration.allowGuestContributions`
5. Returns typed state object

### Write Path

1. Admin toggles setting in UI
2. `useOptimistic` immediately updates local state
3. `useUpdateSpaceSettingsMutation` executes
4. Apollo cache updates normalized space settings
5. All consumers re-render with new state
6. On error: `useOptimistic` reverts, toast notification shown

### Cache Normalization

**Cache Key**: `Space:${spaceId}`
**Nested Path**: `settings.collaboration.allowGuestContributions`

Apollo Client automatically normalizes the space settings object. Updates to the collaboration settings will trigger re-renders for all components consuming space settings data.

## Persistence Strategy

### Backend Storage

- Field stored in space settings table/collection
- Indexed by space ID for efficient queries
- Boolean field with NOT NULL constraint, default FALSE

### Frontend Cache

- Apollo InMemoryCache with space-based normalization
- Settings updates trigger cache field updates
- Type policies ensure consistent merge behavior

## Migration Considerations

### Backward Compatibility

- New field is optional in GraphQL input (defaults to `false`)
- Frontend gracefully handles missing field (fallback to `false`)
- No breaking changes to existing space settings mutations

### Data Migration

- Existing spaces: field defaults to `false` (conservative)
- New spaces: explicit default value in `defaultSpaceSettings`
- No data transformation required

## Testing Data Scenarios

### Valid States

- `allowGuestContributions: false` (default, secure)
- `allowGuestContributions: true` (enabled by admin)

### Edge Cases

- Field missing from response (fallback to `false`)
- Network error during toggle (revert optimistic update)
- Concurrent updates by multiple admins (last write wins)

### Test Space Configurations

- Parent space: `allowGuestContributions: true`
- Subspace: `allowGuestContributions: false` (independent)
- Verify no inheritance behavior

## Security Model

### Authorization Matrix

| Role         | Can View Setting | Can Change Setting |
| ------------ | ---------------- | ------------------ |
| Space Admin  | ✅               | ✅                 |
| Space Member | ✅               | ❌                 |
| Guest        | ❌               | ❌                 |

### Data Protection

- Setting changes logged in audit trail (future enhancement)
- Rate limiting via standard GraphQL mutation controls
- Input validation: boolean type enforced by schema

## Performance Characteristics

### Query Performance

- Single field addition to existing space settings query
- No additional network requests required
- Cached after initial load

### Mutation Performance

- Lightweight boolean field update
- Target: <500ms p95 latency (per success criteria)
- No cascading updates to related entities

### Scale Considerations

- Tested with 10-20 whiteboards per space
- No N+1 query issues (single space settings object)
- Memory impact: 1 byte per space (boolean field)

---

## Implementation Checklist

- [ ] Update `SpaceSettingsCollaboration` GraphQL type (backend)
- [ ] Add field to `SpaceSettings.graphql` fragment
- [ ] Add input field to `UpdateSpaceSettings.graphql`
- [ ] Update `SpaceSettingsModel.ts` interface
- [ ] Add default value to `SpaceDefaultSettings.tsx`
- [ ] Create `useSpaceGuestContributions.ts` domain hook
- [ ] Run `pnpm run codegen` after backend schema update
- [ ] Add unit tests for data transformations
- [ ] Verify Apollo cache behavior with mutations
