# GraphQL Schema Changes

## Overview

This document defines the required GraphQL schema extensions for the Guest Whiteboard Contributions Toggle feature.

## Type Extensions

### SpaceSettingsCollaboration Type

**Current Fields** (existing):

```graphql
type SpaceSettingsCollaboration {
  allowEventsFromSubspaces: Boolean!
  allowMembersToCreateCallouts: Boolean!
  allowMembersToCreateSubspaces: Boolean!
  allowMembersToVideoCall: Boolean!
  inheritMembershipRights: Boolean!
}
```

**Extended Type** (with new field):

```graphql
type SpaceSettingsCollaboration {
  allowEventsFromSubspaces: Boolean!
  allowMembersToCreateCallouts: Boolean!
  allowMembersToCreateSubspaces: Boolean!
  allowMembersToVideoCall: Boolean!
  inheritMembershipRights: Boolean!
  allowGuestContributions: Boolean! # NEW FIELD
}
```

## Input Type Extensions

### CreateSpaceSettingsCollaborationInput

**Extended Input**:

```graphql
input CreateSpaceSettingsCollaborationInput {
  allowEventsFromSubspaces: Boolean
  allowMembersToCreateCallouts: Boolean
  allowMembersToCreateSubspaces: Boolean
  allowMembersToVideoCall: Boolean
  inheritMembershipRights: Boolean
  allowGuestContributions: Boolean # NEW FIELD (optional, defaults to false)
}
```

### UpdateSpaceSettingsCollaborationInput

**Extended Input**:

```graphql
input UpdateSpaceSettingsCollaborationInput {
  allowEventsFromSubspaces: Boolean
  allowMembersToCreateCallouts: Boolean
  allowMembersToCreateSubspaces: Boolean
  allowMembersToVideoCall: Boolean
  inheritMembershipRights: Boolean
  allowGuestContributions: Boolean # NEW FIELD (optional)
}
```

## Fragment Updates

### SpaceSettings Fragment (src/domain/spaceAdmin/SpaceAdminSettings/graphql/SpaceSettings.graphql)

**Current Fragment**:

```graphql
fragment SpaceSettings on SpaceSettings {
  privacy {
    mode
    allowPlatformSupportAsAdmin
  }
  membership {
    policy
    trustedOrganizations
    allowSubspaceAdminsToInviteMembers
  }
  collaboration {
    allowMembersToCreateCallouts
    allowMembersToCreateSubspaces
    inheritMembershipRights
    allowEventsFromSubspaces
    allowMembersToVideoCall
  }
}
```

**Extended Fragment**:

```graphql
fragment SpaceSettings on SpaceSettings {
  privacy {
    mode
    allowPlatformSupportAsAdmin
  }
  membership {
    policy
    trustedOrganizations
    allowSubspaceAdminsToInviteMembers
  }
  collaboration {
    allowMembersToCreateCallouts
    allowMembersToCreateSubspaces
    inheritMembershipRights
    allowEventsFromSubspaces
    allowMembersToVideoCall
    allowGuestContributions # NEW FIELD
  }
}
```

## Query Schema

### SpaceSettings Query

**Current Query** (using SpaceSettings fragment):

```graphql
query SpaceSettings($spaceId: UUID!) {
  lookup {
    space(ID: $spaceId) {
      id
      about {
        id
        provider {
          id
          profile {
            id
            displayName
          }
        }
        membership {
          roleSetID
          communityID
        }
      }
      settings {
        ...SpaceSettings
      }
      collaboration {
        id
      }
    }
  }
}
```

**No changes required** - fragment update automatically includes new field.

## Mutation Schema

### UpdateSpaceSettings Mutation

**Current Mutation**:

```graphql
mutation UpdateSpaceSettings($settingsData: UpdateSpaceSettingsInput!) {
  updateSpaceSettings(settingsData: $settingsData) {
    id
    settings {
      ...SpaceSettings
    }
  }
}
```

**No changes required** - fragment update and input type extension handle new field.

## Backend Implementation Notes

### Database Schema

```sql
-- Assuming PostgreSQL-style schema
ALTER TABLE space_settings_collaboration
ADD COLUMN allow_guest_contributions BOOLEAN NOT NULL DEFAULT FALSE;

-- Index for efficient querying (optional)
CREATE INDEX idx_space_settings_guest_contributions
ON space_settings_collaboration(allow_guest_contributions);
```

### GraphQL Resolver Updates

**Type Resolver** (if custom resolver needed):

```typescript
// No custom resolver needed - field maps directly to database column
```

**Mutation Resolver** (extend existing):

```typescript
// Backend team: Ensure new field is included in mutation input validation
// and database update operations
```

## Frontend Type Generation

After backend schema update, run:

```bash
pnpm run codegen
```

This will generate updated TypeScript types in:

- `src/core/apollo/generated/graphql-schema.ts`
- `src/core/apollo/generated/apollo-hooks.ts`

### Expected Generated Types

```typescript
export type SpaceSettingsCollaboration = {
  __typename?: 'SpaceSettingsCollaboration';
  allowEventsFromSubspaces: Scalars['Boolean'];
  allowMembersToCreateCallouts: Scalars['Boolean'];
  allowMembersToCreateSubspaces: Scalars['Boolean'];
  allowMembersToVideoCall: Scalars['Boolean'];
  inheritMembershipRights: Scalars['Boolean'];
  allowGuestContributions: Scalars['Boolean']; // NEW
};

export type UpdateSpaceSettingsCollaborationInput = {
  allowEventsFromSubspaces?: InputMaybe<Scalars['Boolean']>;
  allowMembersToCreateCallouts?: InputMaybe<Scalars['Boolean']>;
  allowMembersToCreateSubspaces?: InputMaybe<Scalars['Boolean']>;
  allowMembersToVideoCall?: InputMaybe<Scalars['Boolean']>;
  inheritMembershipRights?: InputMaybe<Scalars['Boolean']>;
  allowGuestContributions?: InputMaybe<Scalars['Boolean']>; // NEW
};
```

## Validation Rules

### Backend Validation

- `allowGuestContributions` must be boolean type
- Field is optional in input (defaults to `false`)
- No business logic validation required (simple boolean flag)

### Frontend Validation

- TypeScript ensures boolean type at compile time
- Runtime validation handled by generated GraphQL types
- UI toggle component enforces boolean state

## API Versioning

### Backward Compatibility

- ✅ **Safe Change**: Adding optional field to existing type
- ✅ **No Breaking Changes**: Existing queries continue to work
- ✅ **Default Behavior**: New field defaults to `false` (conservative)

### Migration Strategy

1. Backend deploys schema with new field
2. Frontend updates fragments and runs codegen
3. Frontend deploys with UI changes
4. No data migration required (defaults handle existing spaces)

## Testing Queries

### Test Query 1: Read Space Settings

```graphql
query TestSpaceSettings {
  lookup {
    space(ID: "test-space-id") {
      settings {
        collaboration {
          allowGuestContributions
        }
      }
    }
  }
}
```

### Test Mutation 1: Enable Guest Contributions

```graphql
mutation TestEnableGuestContributions {
  updateSpaceSettings(
    settingsData: { spaceID: "test-space-id", settings: { collaboration: { allowGuestContributions: true } } }
  ) {
    settings {
      collaboration {
        allowGuestContributions
      }
    }
  }
}
```

### Test Mutation 2: Disable Guest Contributions

```graphql
mutation TestDisableGuestContributions {
  updateSpaceSettings(
    settingsData: { spaceID: "test-space-id", settings: { collaboration: { allowGuestContributions: false } } }
  ) {
    settings {
      collaboration {
        allowGuestContributions
      }
    }
  }
}
```

## Authorization

### Required Privileges

- **Read**: Space member or above
- **Write**: Space admin (`UPDATE` privilege on space settings)

### Security Notes

- Setting is visible to space members (transparency)
- Only admins can modify (security)
- No special authorization rules for new field (inherits from space settings)
