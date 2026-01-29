# Research: Guest Whiteboard Contributions Toggle

**Date**: 2025-10-31
**Feature**: Guest Whiteboard Contributions Toggle

## Research Findings

### 1. GraphQL Schema Integration

**Decision**: Extend existing `SpaceSettingsCollaboration` type with `allowGuestContributions: Boolean!` field

**Rationale**:

- The `SpaceSettingsCollaboration` type already exists in the generated schema (`src/core/apollo/generated/apollo-helpers.ts`)
- Current fields include: `allowEventsFromSubspaces`, `allowMembersToCreateCallouts`, `allowMembersToCreateSubspaces`, `allowMembersToVideoCall`, `inheritMembershipRights`
- Adding a boolean field follows the established pattern
- Backend coordination follows standard process: backend team adds field, frontend runs `pnpm run codegen`

**Alternatives considered**:

- Creating separate `SpaceSettingsGuest` type: Rejected due to unnecessary complexity and inconsistency with existing patterns
- Adding to `SpaceSettingsPrivacy`: Rejected as this is collaboration-related, not privacy-related

**Implementation notes**:

- Update `SpaceSettings.graphql` fragment to include new field
- Update `UpdateSpaceSettings.graphql` mutation input
- Update `SpaceDefaultSettings.tsx` with default value `false`
- Update `SpaceSettingsModel.ts` interface

### 2. React 19 Optimistic Updates with Apollo

**Decision**: Use `useOptimistic` with Apollo mutations for immediate UI feedback, revert on error

**Rationale**:

- React 19's `useOptimistic` provides built-in optimistic state management
- Apollo Client's error handling integrates well with optimistic reversion
- Pattern follows React 19 concurrent UX discipline from constitution
- Existing codebase has error handling patterns in `useApolloErrorHandler.ts`

**Implementation pattern**:

```typescript
const [optimisticToggleState, setOptimisticToggleState] = useOptimistic(
  currentSettings?.collaboration?.allowGuestContributions ?? false,
  (currentState, newState) => newState
);

const [updateSettings, { loading }] = useUpdateSpaceSettingsMutation({
  onError: error => {
    // Revert optimistic update (automatic with useOptimistic)
    handleError(error);
    notify(t('settings.update.error'), 'error');
  },
  onCompleted: () => {
    notify(t('settings.guestContributions.updated'), 'success');
  },
});
```

**Alternatives considered**:

- Pure Apollo optimisticResponse: Rejected due to less elegant error handling
- No optimistic updates: Rejected due to poor UX for settings toggles
- Custom state management: Rejected due to React 19 providing better primitives

### 3. Accessibility Patterns for Toggle Controls

**Decision**: Use MUI's `Switch` component with proper ARIA labeling and warning text

**Rationale**:

- MUI Switch component provides WCAG 2.1 AA compliance out of the box
- Follows existing patterns in `SpaceAdminSettingsPage.tsx` with `SwitchSettingsGroup`
- Warning text displayed conditionally improves user understanding
- Keyboard navigation and screen reader support included

**Implementation pattern**:

```typescript
<SwitchSettingsGroup
  options={{
    allowGuestContributions: {
      checked: optimisticToggleState,
      label: (
        <Trans
          i18nKey="pages.admin.space.settings.guestContributions.label"
          components={{ b: <strong /> }}
        />
      ),
      description: optimisticToggleState ? (
        <Trans
          i18nKey="pages.admin.space.settings.guestContributions.warning"
          components={{ i: <em /> }}
        />
      ) : undefined,
    },
  }}
  onChange={(setting, newValue) => handleToggleChange(newValue)}
/>
```

**Alternatives considered**:

- Custom toggle component: Rejected due to accessibility complexity
- Radio button group: Rejected as binary choice better suited for switch
- Checkbox: Rejected as switch better represents on/off state

### 4. Mutation Error Handling with Optimistic Updates

**Decision**: Revert optimistic update and display toast notification on mutation failure

**Rationale**:

- `useOptimistic` automatically reverts on component re-render with original state
- Toast notifications provide non-intrusive error feedback
- Follows existing error handling patterns in `useApolloErrorHandler.ts`
- Network errors are typically transient, so immediate retry option available

**Implementation pattern**:

```typescript
const [updateSettings] = useUpdateSpaceSettingsMutation({
  onError: error => {
    // useOptimistic automatically reverts to original state
    handleApolloError(error);
    notify(t('pages.admin.space.settings.guestContributions.error'), 'error');
  },
  onCompleted: () => {
    notify(t('pages.admin.space.settings.guestContributions.success'), 'success');
  },
});
```

**Alternatives considered**:

- Silent retry: Rejected as user should be aware of failures
- Blocking error dialog: Rejected as too intrusive for settings toggle
- Queue for background retry: Rejected as settings changes should be immediate

### 5. Domain Façade Design

**Decision**: Create `useSpaceGuestContributions` hook in `src/domain/space/settings`

**Rationale**:

- Follows domain-driven boundaries principle from constitution
- Provides reusable hook for future Share dialog integration
- Encapsulates GraphQL query logic away from UI components
- Enables easy testing and mocking

**Implementation structure**:

```typescript
// src/domain/space/settings/useSpaceGuestContributions.ts
export const useSpaceGuestContributions = (spaceId: string) => {
  const { data, loading, error } = useSpaceSettingsQuery({
    variables: { spaceId },
    skip: !spaceId,
  });

  return {
    allowGuestContributions: data?.lookup?.space?.settings?.collaboration?.allowGuestContributions ?? false,
    loading,
    error,
  };
};
```

**Alternatives considered**:

- Direct GraphQL usage in components: Violates domain boundaries
- Global state management: Overkill for single setting
- Props drilling: Creates tight coupling

## Integration Points

### Share Dialog Extensibility

The new space-level setting will be consumed by future Share dialog enhancements via the domain façade hook. No direct implementation in this phase.

### Apollo Cache Management

Space settings are already normalized by space ID in Apollo cache. The new field will automatically participate in cache updates.

### Testing Strategy

- Unit tests for domain hook with mocked GraphQL responses
- Integration tests for mutation flow with error scenarios
- Accessibility tests for toggle component with screen reader simulation

## Performance Considerations

### Scale Testing

Based on clarification, testing will focus on spaces with 10-20 whiteboards (typical use case). No special optimizations needed for this scale.

### Mutation Performance

Space settings mutations are lightweight (single boolean field). No performance concerns expected.

## Security Notes

### Authorization

Space-level setting changes require `UPDATE` privilege on space settings (admin-only). This reuses existing authorization patterns.

### Data Validation

Backend will validate the boolean field. Frontend provides type safety via generated GraphQL types.

---

## Decisions Summary

| Area           | Decision                            | Rationale                       |
| -------------- | ----------------------------------- | ------------------------------- |
| Schema         | Extend `SpaceSettingsCollaboration` | Follows existing patterns       |
| React 19       | Use `useOptimistic` with Apollo     | Built-in error handling         |
| Accessibility  | MUI Switch with ARIA                | WCAG 2.1 AA compliance          |
| Error Handling | Toast notification + revert         | Non-intrusive, automatic revert |
| Domain Design  | Create façade hook                  | Follows constitution boundaries |

All research findings align with the constitution principles and provide a solid foundation for implementation.
