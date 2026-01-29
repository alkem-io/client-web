# Data Model: Enhanced Error Handling with Server Error Extensions

**Feature**: 013-error-handling-extensions
**Date**: 2026-01-28

## Entities

### 1. GraphQL Error Extensions (Server → Client)

```typescript
// Extended error structure received from server
interface GraphQLErrorExtensions {
  code?: string; // Existing: error code like 'ENTITY_NOT_FOUND'
  numericCode?: number; // NEW: numeric code like 10101
  userMessage?: string; // NEW: i18n translation key like 'apollo.errors.userMessages.notFound.entity'
  // ... other existing extension fields
}
```

**Source**: `error.extensions` from GraphQL response
**Validation**: All fields optional for backward compatibility

### 2. Notification (XState Context)

```typescript
// Current
type Notification = {
  id: string;
  severity: Severity;
  message: string;
};

// Extended
type Notification = {
  id: string;
  severity: Severity;
  message: string;
  numericCode?: number; // NEW: for support mailto
};

type Severity = 'info' | 'warning' | 'error' | 'success';
```

**Location**: `src/core/state/global/notifications/notificationMachine.ts`
**State transitions**: None (data-only change)

### 3. Notification Event Payload

```typescript
// Current
type PushNotificationPayload = {
  message: string;
  severity?: Severity;
};

// Extended
type PushNotificationPayload = {
  message: string;
  severity?: Severity;
  numericCode?: number; // NEW
};
```

**Location**: `src/core/state/global/notifications/notificationMachine.ts`

## Data Flow

```
Server Error Response
       │
       ▼
┌─────────────────────────┐
│  GraphQL Error          │
│  extensions: {          │
│    code: string         │
│    numericCode: number  │ ◄── NEW
│    userMessage: string  │ ◄── NEW
│  }                      │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  useApolloErrorHandler  │
│  - Extract extensions   │
│  - Translate message    │
│  - Call useNotification │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  useNotification hook   │
│  - Send PUSH event      │
│  - Include numericCode  │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  XState Machine         │
│  - Add to notifications │
│  - Store numericCode    │
└─────────────────────────┘
       │
       ▼
┌─────────────────────────┐
│  NotificationHandler    │
│  - Render notification  │
│  - Generate mailto URL  │
│  - Show support link    │
└─────────────────────────┘
```

## Translation Data Structure

```json
{
  "apollo": {
    "errors": {
      "generic": "An error occurred",
      "generic-with-code": "An error occurred with code {{code}}",

      "userMessages": {
        "notFound": {
          "entity": "Couldn't find what you were looking for.",
          "resource": "Resource not found.",
          "account": "Account not found.",
          "license": "License not found.",
          "storageBucket": "Storage bucket not found.",
          "tagset": "Tagset not found.",
          "mimeType": "MIME type not found.",
          "matrixEntity": "Matrix entity not found.",
          "userIdentity": "User identity not found.",
          "pagination": "Pagination cursor not found."
        },
        "authorization": {
          "unauthenticated": "You might not be logged in.",
          "unauthorized": "Access denied.",
          "forbidden": "Access denied.",
          "forbiddenPolicy": "You don't have the correct rights.",
          "forbiddenLicensePolicy": "License restriction.",
          "invalidPolicy": "Invalid authorization policy.",
          "authorizationReset": "Authorization reset in progress.",
          "userNotVerified": "User is not verified.",
          "subscriptionNotAuthenticated": "Subscription requires authentication.",
          "apiRestricted": "API access restricted.",
          "invalidToken": "Invalid token.",
          "bearerToken": "Bearer token error.",
          "sessionExpired": "Session expired.",
          "sessionExtend": "Unable to extend session.",
          "loginFlow": "Login flow error.",
          "loginFlowInit": "Unable to initialize login flow."
        },
        "validation": {
          "badUserInput": "{{message}}",
          "inputValidation": "Input validation error.",
          "invalidUuid": "Invalid identifier format.",
          "formatNotSupported": "Format not supported.",
          "invalidStateTransition": "Invalid state transition.",
          "invalidTemplateType": "Invalid template type.",
          "groupNotInitialized": "Group not initialized.",
          "entityNotInitialized": "Entity not initialized.",
          "relationNotLoaded": "Relation not loaded.",
          "paginationOutOfBound": "Pagination input out of bounds.",
          "paginationParamNotFound": "Pagination parameter not found.",
          "forumDiscussionCategory": "Invalid discussion category.",
          "notSupported": "Operation not supported."
        },
        "operations": {
          "operationNotAllowed": "Operation not allowed.",
          "notEnabled": "Feature not enabled.",
          "messagingNotEnabled": "Messaging not enabled.",
          "roleSetRole": "Role set error.",
          "roleSetInvitation": "Invitation error.",
          "roleLimitsViolated": "Role limits exceeded.",
          "licenseEntitlementNotAvailable": "License entitlement not available.",
          "licenseEntitlementNotSupported": "License entitlement not supported.",
          "calloutClosed": "Callout is closed.",
          "userAlreadyRegistered": "User already registered.",
          "userNotRegistered": "User not registered.",
          "noAgentForUser": "No agent for user.",
          "userIdentityDeletionFailed": "User identity deletion failed."
        },
        "system": {
          "bootstrapFailed": "System initialization failed.",
          "notificationPayloadBuilder": "Notification error.",
          "geoLocationError": "Geolocation error.",
          "geoServiceNotAvailable": "Geolocation service not available.",
          "geoServiceError": "Geolocation service error.",
          "geoServiceRequestLimit": "Geolocation request limit exceeded.",
          "storageDisabled": "Storage is disabled.",
          "storageUploadFailed": "Upload failed.",
          "localStorageSaveFailed": "Local storage save failed.",
          "localStorageReadFailed": "Local storage read failed.",
          "localStorageDeleteFailed": "Local storage delete failed.",
          "documentSaveFailed": "Document save failed.",
          "documentReadFailed": "Document read failed.",
          "documentDeleteFailed": "Document delete failed.",
          "urlResolverError": "URL resolver error.",
          "excalidrawAmqpResult": "Excalidraw service error.",
          "excalidrawRedisAdapterInit": "Excalidraw initialization error.",
          "excalidrawServerInit": "Excalidraw server initialization error."
        },
        "fallback": "An unexpected error occurred. Reference: {{errorId}}"
      },

      "support": {
        "linkText": "Contact Support",
        "emailSubject": "Support Request - Error {{code}}",
        "emailSubjectGeneric": "Support Request",
        "emailBody": "Hello,\n\nI encountered an error while using Alkemio.\n\nError Code: {{code}}\n\nPlease help me resolve this issue.\n\nThank you.",
        "emailBodyGeneric": "Hello,\n\nI encountered an error while using Alkemio.\n\nPlease help me resolve this issue.\n\nThank you."
      }
    }
  }
}
```

## Server-Client Key Mapping

The server sends `userMessage` values as fully-qualified i18n key paths that the client uses directly:

| Server userMessage                                         | Client i18n Key |
| ---------------------------------------------------------- | --------------- |
| `apollo.errors.userMessages.notFound.entity`               | Same            |
| `apollo.errors.userMessages.authorization.unauthenticated` | Same            |
| ...                                                        | ...             |

**Important**: The server sends fully-qualified keys (e.g., `apollo.errors.userMessages.notFound.entity`). The client resolver uses these keys directly without any prefixing. Do not add additional prefixes like `apollo.errors.` to the incoming `userMessage` value.

## Validation Rules

1. **numericCode**: Must be an integer when present (can be zero or negative)
2. **userMessage**: Must be a valid i18n key path when present
3. **Fallback chain**:
   - Try `userMessage` key first
   - If not found, try `apollo.errors.{code}` (existing pattern)
   - If not found, use `apollo.errors.generic-with-code`
   - If no code at all, use `apollo.errors.generic`
