# API Contract Specification

## Overview

This document defines the complete API contract for the Guest Whiteboard Contributions Toggle feature, including request/response formats, error handling, and state management.

## GraphQL Operations

### Query: Space Settings

**Operation Name**: `SpaceSettings`

**Request**:

```graphql
query SpaceSettings($spaceId: UUID!) {
  lookup {
    space(ID: $spaceId) {
      id
      settings {
        collaboration {
          allowGuestContributions
          # ... other fields
        }
      }
    }
  }
}
```

**Variables**:

```json
{
  "spaceId": "12345678-1234-1234-1234-123456789abc"
}
```

**Successful Response**:

```json
{
  "data": {
    "lookup": {
      "space": {
        "id": "12345678-1234-1234-1234-123456789abc",
        "settings": {
          "collaboration": {
            "allowGuestContributions": false
          }
        }
      }
    }
  }
}
```

**Error Response** (Space Not Found):

```json
{
  "data": {
    "lookup": {
      "space": null
    }
  },
  "errors": [
    {
      "message": "Space not found",
      "extensions": {
        "code": "ENTITY_NOT_FOUND"
      }
    }
  ]
}
```

### Mutation: Update Space Settings

**Operation Name**: `UpdateSpaceSettings`

**Request**:

```graphql
mutation UpdateSpaceSettings($settingsData: UpdateSpaceSettingsInput!) {
  updateSpaceSettings(settingsData: $settingsData) {
    id
    settings {
      collaboration {
        allowGuestContributions
      }
    }
  }
}
```

**Variables** (Enable Guest Contributions):

```json
{
  "settingsData": {
    "spaceID": "12345678-1234-1234-1234-123456789abc",
    "settings": {
      "collaboration": {
        "allowGuestContributions": true
      }
    }
  }
}
```

**Variables** (Disable Guest Contributions):

```json
{
  "settingsData": {
    "spaceID": "12345678-1234-1234-1234-123456789abc",
    "settings": {
      "collaboration": {
        "allowGuestContributions": false
      }
    }
  }
}
```

**Successful Response**:

```json
{
  "data": {
    "updateSpaceSettings": {
      "id": "12345678-1234-1234-1234-123456789abc",
      "settings": {
        "collaboration": {
          "allowGuestContributions": true
        }
      }
    }
  }
}
```

**Error Response** (Unauthorized):

```json
{
  "data": null,
  "errors": [
    {
      "message": "User not authorized to update space settings",
      "extensions": {
        "code": "AUTHORIZATION_ERROR"
      }
    }
  ]
}
```

**Error Response** (Validation Error):

```json
{
  "data": null,
  "errors": [
    {
      "message": "allowGuestContributions must be a boolean value",
      "extensions": {
        "code": "VALIDATION_ERROR",
        "field": "settings.collaboration.allowGuestContributions"
      }
    }
  ]
}
```

## Frontend Hook Contracts

### useSpaceGuestContributions Hook

**File**: `src/domain/space/settings/useSpaceGuestContributions.ts`

**Interface**:

```typescript
interface UseSpaceGuestContributionsResult {
  allowGuestContributions: boolean;
  loading: boolean;
  error?: ApolloError;
}

function useSpaceGuestContributions(spaceId: string): UseSpaceGuestContributionsResult;
```

**Usage Example**:

```typescript
const { allowGuestContributions, loading, error } = useSpaceGuestContributions(spaceId);

if (loading) return <Loading />;
if (error) return <ErrorMessage error={error} />;

return <Toggle enabled={allowGuestContributions} />;
```

**Return Values**:

- `allowGuestContributions`: Current setting value (defaults to `false`)
- `loading`: Apollo query loading state
- `error`: Apollo query error (if any)

### Settings Update Handler

**Function Signature**:

```typescript
interface HandleUpdateSettingsParams {
  allowGuestContributions?: boolean;
  showNotification?: boolean;
}

function handleUpdateSettings(params: HandleUpdateSettingsParams): Promise<void>;
```

**Implementation Contract**:

```typescript
const handleUpdateSettings = async ({
  allowGuestContributions = currentSettings?.collaboration?.allowGuestContributions ?? false,
  showNotification = true,
}: HandleUpdateSettingsParams) => {
  const settingsVariable = {
    collaboration: {
      ...currentSettings.collaboration,
      allowGuestContributions,
    },
  };

  await updateSpaceSettings({
    variables: {
      settingsData: {
        spaceID: spaceId,
        settings: settingsVariable,
      },
    },
  });

  if (showNotification) {
    notify(t('pages.admin.space.settings.guestContributions.updated'), 'success');
  }
};
```

## State Management Contracts

### Apollo Cache Structure

**Cache Key Pattern**: `Space:${spaceId}`

**Cached Data Structure**:

```typescript
{
  "__typename": "Space",
  "id": "12345678-1234-1234-1234-123456789abc",
  "settings": {
    "__typename": "SpaceSettings",
    "collaboration": {
      "__typename": "SpaceSettingsCollaboration",
      "allowGuestContributions": false,
      // ... other collaboration fields
    }
  }
}
```

### Optimistic Update Contract

**Optimistic Response Pattern**:

```typescript
const optimisticResponse = {
  updateSpaceSettings: {
    __typename: 'Space',
    id: spaceId,
    settings: {
      __typename: 'SpaceSettings',
      collaboration: {
        __typename: 'SpaceSettingsCollaboration',
        ...currentSettings.collaboration,
        allowGuestContributions: newValue,
      },
    },
  },
};
```

**Revert Behavior**:

- On mutation error: `useOptimistic` automatically reverts to original state
- On network error: Apollo cache remains unchanged, UI shows error

## Error Handling Contracts

### Error Categories

1. **Network Errors**
   - Timeout, connection failed, server unavailable
   - User Action: Display retry option
   - System Action: Revert optimistic update

2. **Authorization Errors**
   - User lacks UPDATE privilege on space settings
   - User Action: Inform user of insufficient permissions
   - System Action: No state change

3. **Validation Errors**
   - Invalid input type (non-boolean)
   - User Action: Should not occur (type safety)
   - System Action: Log error, revert state

4. **Business Logic Errors**
   - Space not found, space deleted
   - User Action: Redirect or refresh
   - System Action: Clear local state

### Error Response Format

**Standard Error Structure**:

```typescript
interface GraphQLError {
  message: string;
  extensions?: {
    code: string;
    field?: string;
    details?: Record<string, unknown>;
  };
}
```

**Error Codes**:

- `AUTHORIZATION_ERROR`: User lacks required privileges
- `VALIDATION_ERROR`: Input validation failed
- `ENTITY_NOT_FOUND`: Space does not exist
- `NETWORK_ERROR`: Connection or timeout issues

## Notification Contracts

### Success Notifications

**Message Keys**:

- `pages.admin.space.settings.guestContributions.enabled`: "Guest contributions enabled"
- `pages.admin.space.settings.guestContributions.disabled`: "Guest contributions disabled"

**Display**:

- Type: Toast notification (success)
- Duration: 4 seconds
- Position: Top-right

### Error Notifications

**Message Keys**:

- `pages.admin.space.settings.guestContributions.error`: "Failed to update guest contributions setting"
- `pages.admin.space.settings.authorization.error`: "You don't have permission to change this setting"

**Display**:

- Type: Toast notification (error)
- Duration: 6 seconds
- Position: Top-right

## Performance Contracts

### Response Time Targets

- **Query Response**: <200ms p95
- **Mutation Response**: <500ms p95
- **UI Update**: <100ms (optimistic)

### Caching Behavior

- **Query Cache**: 5 minutes TTL
- **Mutation Cache Update**: Immediate
- **Background Refetch**: On focus/reconnect

### Data Transfer

- **Query Size**: ~50 bytes (single boolean field)
- **Mutation Size**: ~100 bytes
- **Network Calls**: No additional queries required

## Backward Compatibility

### Version Support

- **Minimum Backend Version**: When `allowGuestContributions` field is available
- **Graceful Degradation**: If field missing, defaults to `false`
- **Migration Path**: No breaking changes to existing API

### Feature Detection

```typescript
const supportsGuestContributions = Boolean(
  data?.lookup?.space?.settings?.collaboration?.hasOwnProperty('allowGuestContributions')
);
```

## Testing Contracts

### Unit Test Requirements

1. **Hook Tests**:
   - Returns correct default value
   - Handles loading states
   - Handles error states
   - Updates on cache changes

2. **Mutation Tests**:
   - Successful update flow
   - Error handling and reversion
   - Notification triggering
   - Cache updates

3. **Integration Tests**:
   - End-to-end toggle flow
   - Authorization enforcement
   - Cross-component state consistency

### Mock Data Contracts

**Default Mock Response**:

```typescript
const mockSpaceSettings = {
  lookup: {
    space: {
      id: 'test-space-id',
      settings: {
        collaboration: {
          allowGuestContributions: false,
        },
      },
    },
  },
};
```

**Error Mock Response**:

```typescript
const mockError = new ApolloError({
  graphQLErrors: [
    {
      message: 'Authorization error',
      extensions: { code: 'AUTHORIZATION_ERROR' },
    },
  ],
});
```
