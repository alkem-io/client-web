# GraphQL API Contract: Public Whiteboard Access (Unified Guest Name)

**Feature**: Public Whiteboard Guest Access Page (Anonymized derivation + fallback prompt)
**Date**: 2025-11-05
**Status**: Proposed (requires backend implementation)

## Overview

This document defines the GraphQL API contract between the frontend guest whiteboard feature and the Alkemio backend server.

---

## HTTP Headers

### Request Headers

| Header Name    | Type   | Required | Description                                                                                                   | Example      |
| -------------- | ------ | -------- | ------------------------------------------------------------------------------------------------------------- | ------------ |
| `x-guest-name` | string | Yes      | Unified guest name used for attribution (either anonymized derived from profile or manually entered fallback) | `"Alice S."` |

Always required for any public whiteboard GraphQL operation. For authenticated users, the value MUST be an anonymized derivation – never the raw full name.

**Injection Point**: Apollo Client custom link (`guestHeaderLink`)

**Security**: Header value is HTML-escaped on display. Anonymization algorithm prevents direct exposure of full legal names.

---

## GraphQL Operations

### Query: GetPublicWhiteboard

**Purpose**: Fetch whiteboard data for public access (anonymous or authenticated viewers using unified guest name)

**Location**: `src/domain/collaboration/whiteboard/guestAccess/GetPublicWhiteboard.graphql`

**Definition**:

```graphql
query GetPublicWhiteboard($whiteboardId: UUID!) {
  whiteboard(ID: $whiteboardId) {
    ...PublicWhiteboardFragment
  }
}
```

**Variables**:

```typescript
{
  whiteboardId: string; // UUID format
}
```

**Response** (success):

```json
{
  "data": {
    "whiteboard": {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "content": "{ /* Excalidraw JSON */ }",
      "profile": {
        "id": "660e8400-e29b-41d4-a716-446655440111",
        "displayName": "Product Roadmap Q4",
        "description": "Collaborative roadmap planning"
      },
      "createdBy": {
        "id": "770e8400-e29b-41d4-a716-446655440222",
        "profile": {
          "displayName": "Alice Smith"
        }
      },
      "createdDate": "2025-11-01T10:30:00Z",
      "updatedDate": "2025-11-05T14:45:00Z"
    }
  }
}
```

**Error Responses**:

| HTTP Code | GraphQL Error Code       | Message                                              | Description                               |
| --------- | ------------------------ | ---------------------------------------------------- | ----------------------------------------- |
| 404       | `WHITEBOARD_NOT_FOUND`   | "Whiteboard not found"                               | Whiteboard ID does not exist              |
| 403       | `GUEST_ACCESS_FORBIDDEN` | "This whiteboard is not available for guest access"  | Guest access disabled for this whiteboard |
| 401       | `GUEST_NAME_MISSING`     | "Guest name header required"                         | `x-guest-name` header missing             |
| 500       | `INTERNAL_SERVER_ERROR`  | "Unable to load whiteboard. Please try again later." | Server error                              |

**Error Response Example**:

```json
{
  "errors": [
    {
      "message": "This whiteboard is not available for guest access",
      "extensions": {
        "code": "GUEST_ACCESS_FORBIDDEN"
      }
    }
  ],
  "data": {
    "whiteboard": null
  }
}
```

---

## Fragments

### Fragment: PublicWhiteboardFragment

**Purpose**: Define minimal whiteboard fields needed for guest view

**Location**: `src/domain/collaboration/whiteboard/guestAccess/PublicWhiteboardFragment.graphql`

**Definition**:

```graphql
fragment PublicWhiteboardFragment on Whiteboard {
  id
  content
  profile {
    id
    displayName
    description
  }
  createdBy {
    id
    profile {
      displayName
    }
  }
  createdDate
  updatedDate
}
```

**Field Descriptions**:

| Field                           | Type              | Required | Description                       |
| ------------------------------- | ----------------- | -------- | --------------------------------- |
| `id`                            | UUID              | Yes      | Unique whiteboard identifier      |
| `content`                       | WhiteboardContent | Yes      | Excalidraw JSON data              |
| `profile.id`                    | UUID              | Yes      | Profile identifier                |
| `profile.displayName`           | String            | Yes      | Whiteboard title                  |
| `profile.description`           | String            | No       | Whiteboard description (optional) |
| `createdBy.id`                  | UUID              | No       | Creator user ID (optional)        |
| `createdBy.profile.displayName` | String            | No       | Creator display name (optional)   |
| `createdDate`                   | DateTime          | Yes      | ISO 8601 timestamp                |
| `updatedDate`                   | DateTime          | Yes      | ISO 8601 timestamp                |

---

## Backend Requirements

### Server-Side Guest Access Control

**Logic**:

1. Verify whiteboard exists
2. Require `x-guest-name` header (anonymized or manually entered)
3. Validate guest access enabled for whiteboard's space (spec `001-guest-whiteboard-contributions`)
4. If allowed: Return whiteboard data
5. If denied: Return 403 error with `GUEST_ACCESS_FORBIDDEN` code

**Pseudocode**:

```typescript
async function getPublicWhiteboard(whiteboardId: UUID, guestName: string | null) {
  const whiteboard = await db.whiteboard.findById(whiteboardId);

  if (!whiteboard) {
    throw new NotFoundError('WHITEBOARD_NOT_FOUND');
  }

  if (!guestName) throw new UnauthorizedError('GUEST_NAME_MISSING');

  const space = await whiteboard.getSpace();
  if (!space.settings.allowGuestContributions) {
    throw new ForbiddenError('GUEST_ACCESS_FORBIDDEN');
  }

  // Log guest access (anonymized, no PII – only length + hash)
  analytics.track('guest_whiteboard_accessed', {
    whiteboardId,
    guestNameLength: guestName.length,
    guestNameHash: hashGuestName(guestName),
  });

  return whiteboard;
}
```

### Guest Session & Name Tracking

**Approach**: Server identifies guest viewers by internal session/session token; guest name is display-only (attribution) and may be anonymized.

**Implementation**:

- Backend creates ephemeral session for anonymous guests; authenticated users reuse auth session
- Guest name is display-only (never used for authorization)
- Multiple viewers may share identical guest names (no uniqueness constraint)
- Server uses session ID for operational tracking; guest name only augmentative

---

## Frontend Integration

### Apollo Client Setup

**Link Order**:

```typescript
import { ApolloLink } from '@apollo/client';
import { guestHeaderLink } from '@/core/apollo/graphqlLinks/guestHeaderLink';
import { authLink } from '@/core/apollo/graphqlLinks/authLink'; // Existing
import { errorLink } from '@/core/apollo/graphqlLinks/errorLink'; // Existing
import { httpLink } from '@/core/apollo/graphqlLinks/httpLink'; // Existing

const link = ApolloLink.from([
  guestHeaderLink, // Inject x-guest-name header (always for public route requests)
  authLink, // Inject auth token when authenticated (still stripped UI on public route)
  errorLink,
  httpLink,
]);
```

### Query Hook Generation

**Codegen Output** (auto-generated by `pnpm run codegen`):

```typescript
// src/core/apollo/generated/apollo-hooks.ts

export function useGetPublicWhiteboardQuery(
  baseOptions: Apollo.QueryHookOptions<GetPublicWhiteboardQuery, GetPublicWhiteboardQueryVariables>
) {
  const options = { ...defaultOptions, ...baseOptions };
  return Apollo.useQuery<GetPublicWhiteboardQuery, GetPublicWhiteboardQueryVariables>(
    GetPublicWhiteboardDocument,
    options
  );
}
```

**Usage in Component**:

```typescript
import { useGetPublicWhiteboardQuery } from '@/core/apollo/generated/apollo-hooks';

const { data, loading, error } = useGetPublicWhiteboardQuery({
  variables: { whiteboardId },
  skip: !guestName, // Guard against accidental header omission (dialog or derivation handles population)
});
```

---

## Error Handling Contract

### Frontend Error Mapping

| GraphQL Error Code       | Frontend Action       | User Message                                                                               |
| ------------------------ | --------------------- | ------------------------------------------------------------------------------------------ |
| `WHITEBOARD_NOT_FOUND`   | Show 404 error UI     | "Whiteboard not found. The link may be incorrect or the whiteboard may have been deleted." |
| `GUEST_ACCESS_FORBIDDEN` | Show 403 error UI     | "This whiteboard is not available for guest access. Please contact the whiteboard owner."  |
| `GUEST_NAME_MISSING`     | Show join dialog      | (Re-prompt for nickname)                                                                   |
| `INTERNAL_SERVER_ERROR`  | Show 500 error UI     | "Unable to load whiteboard. Please try again later."                                       |
| Network error            | Show network error UI | "Connection lost. Please check your internet connection and try again."                    |

---

## Security Considerations

### Input Validation

**Backend MUST validate**:

- `x-guest-name` non-empty, length <= 50, charset restricted (alphanumeric, hyphen, underscore, period for initial)
- `whiteboardId` valid UUID
- Guest name does not contain disallowed characters (same regex as frontend, plus optional trailing period)

### Rate Limiting

**Recommended** (out of scope for this spec):

- Limit guest whiteboard queries per IP address (e.g., 100 requests/minute)
- Detect and block automated scraping attempts

### XSS & PII Protection

**Frontend**: React default HTML escaping for guest name display
**Backend**: Escape guest name in logs & analytics; never store full legal name for derived case; optional hashing for metrics

---

## Testing Requirements

### Contract Tests

**Frontend**:

1. Query succeeds with valid `whiteboardId` + anonymized derived header (e.g., "Alice S.")
2. Query succeeds with valid `whiteboardId` + manually entered guest name
3. Query fails with 404 when whiteboard doesn't exist
4. Query fails with 403 when guest access disabled
5. Query fails with 401 when `x-guest-name` header missing
6. Error responses shape validated (errors array, data.whiteboard null)

**Backend** (for backend team):

1. `x-guest-name` header is correctly extracted from request
2. Guest access control logic correctly checks space settings
3. Errors return appropriate GraphQL error codes
4. Analytics events logged correctly

---

## Backward Compatibility

**No breaking changes**:

- Reuses existing `Whiteboard` type
- Header usage isolated to public route operations; existing authenticated flows remain unaffected
- Existing fragments/files remain additive

---

## Summary

**Query**: `GetPublicWhiteboard(whiteboardId: UUID!)`
**Fragment**: `PublicWhiteboardFragment`
**Header**: `x-guest-name` (anonymized derived or manually entered guest name)
**Error Codes**: 4 specific codes for public scenarios (plus standard network/500)
**Backend Requirement**: Guest access control check; enforce anonymized header presence

Next: Align checklist & tests to cover derived vs prompted flows.
