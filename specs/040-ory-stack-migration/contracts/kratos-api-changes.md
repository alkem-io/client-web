# API Contract Changes: Ory Kratos v1.3.x → v26.2.0

**Branch**: `040-ory-stack-migration` | **Date**: 2026-03-26

This document describes the behavioral API changes between Ory Kratos v1.3.x and v26.2.0 that affect the client-web. The REST API endpoint signatures are unchanged — only response behaviors differ.

## 1. OIDC Account Linking — Registration/Settings Flow Submission

**Endpoint**: `POST {flow.ui.action}` (registration or settings flow submission with OIDC method)

**Trigger**: User submits OIDC registration/linking when the email is already associated with another account.

### v1.3.x Behavior
```
POST /self-service/registration?flow={id}
Content-Type: application/x-www-form-urlencoded

→ HTTP 200 OK
→ Body: { id, ui: { nodes: [...], messages: [{ id: 1010016, type: "error", text: "..." }] } }
```

### v26.2.0 Behavior
```
POST /self-service/registration?flow={id}
Content-Type: application/x-www-form-urlencoded

→ HTTP 400 Bad Request
→ Body: { id, ui: { nodes: [...], messages: [{ id: 1010016, type: "error", text: "..." }] } }
```

### Client Impact

| Aspect | Before | After |
|--------|--------|-------|
| HTTP status | 200 | 400 |
| Response body | Flow with error messages | Flow with error messages (same shape) |
| axios behavior | Resolves promise | Rejects promise (enters catch) |
| Client handling | Updates flow state normally | Must extract flow from `error.response.data` |

### New Error Message

| Field | Value |
|-------|-------|
| `id` | `1010016` |
| `type` | `error` |
| `text` | "You tried to sign in with {provider}, but that email is already used by another account." |
| `context.provider` | Provider name (e.g., "microsoft", "github") |

## 2. OIDC Registration Validation — Node Group Reassignment

**Endpoint**: `POST {flow.ui.action}` (registration flow submission with OIDC method)

**Trigger**: OIDC registration fails validation (e.g., missing email, name conflict).

### v1.3.x Behavior
```json
{
  "ui": {
    "nodes": [
      { "group": "oidc", "attributes": { "name": "traits.email" }, "messages": [{ "type": "error" }] },
      { "group": "oidc", "attributes": { "name": "provider", "value": "microsoft" }, "type": "input" }
    ]
  }
}
```

### v26.2.0 Behavior
```json
{
  "ui": {
    "nodes": [
      { "group": "default", "attributes": { "name": "traits.email" }, "messages": [{ "type": "error" }] },
      { "group": "oidc", "attributes": { "name": "provider", "value": "microsoft" }, "type": "input" }
    ]
  }
}
```

### Client Impact

| Aspect | Before | After |
|--------|--------|-------|
| Validation error nodes | `group: 'oidc'` | `group: 'default'` |
| OIDC submit buttons | `group: 'oidc'` | `group: 'oidc'` (unchanged) |
| Rendering position | Near social login buttons | Top of form (default group area) |

### Feature Flag

Kratos server-side flag `feature_flags.legacy_oidc_registration_node_group: true` restores v1.3.x behavior. Per project decision, this flag will NOT be used — the client will support the new behavior.

## 3. Rate Limiting — Oathkeeper Status Code Mapping

**Endpoint**: Any Kratos endpoint behind Oathkeeper that returns 429.

**Trigger**: User exceeds rate limits (e.g., too many login attempts).

### v1.3.x Behavior
```
Kratos → 429 Too Many Requests
Oathkeeper → passes through 429 (or varies by config)
Client → detects 429 status code
```

### v26.2.0 Behavior
```
Kratos → 429 Too Many Requests
Oathkeeper → 401 Unauthorized (cookie_session authenticator treats 429 as auth failure)
Oathkeeper → redirects to login with ?lockout=true&retry_after=300
Client → detects lockout via query parameter
```

### Client Impact

| Aspect | Before | After |
|--------|--------|-------|
| HTTP status received | 429 | 401 (mapped) |
| Detection mechanism | HTTP status code | `lockout` query parameter |
| Retry duration | From `Retry-After` header | From `retry_after` query parameter (seconds) |
| Client implementation | Was partially relying on status | Already uses query parameter detection |

## 4. Disabled Identity — New Error Message

**Endpoint**: `POST /self-service/login` or `POST /self-service/recovery` (for disabled identities)

**Trigger**: Disabled identity attempts login or recovery.

### v1.3.x Behavior
```
→ HTTP 401 Unauthorized (generic)
```

### v26.2.0 Behavior
```
→ HTTP 200 OK (flow continues)
→ Body: { ui: { messages: [{ id: 4010011, type: "error", text: "This account is disabled." }] } }
```

### Client Impact
Informational only. The message renders via the existing Kratos message system. Optionally add i18n translation for message ID `4010011`.

## 5. New Node Type — Division

**Endpoint**: Any flow that returns UI nodes.

**Trigger**: Kratos v26.2.0 may include `div` nodes in flow UIs for grouping/layout purposes.

### v26.2.0 Addition
```json
{
  "type": "div",
  "group": "default",
  "attributes": {
    "node_type": "div",
    "id": "some-id",
    "class": "some-class",
    "data": {}
  }
}
```

### Client Impact
The `KratosUI.tsx` node grouping logic should handle `node_type: 'div'` explicitly via a type guard in `helpers.ts`. Fallthrough to the `rest` group is the safety net for truly unknown types, but `div` is a known type in v26.2.0 and should be handled directly for type safety.
