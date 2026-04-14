# Data Model: Ory Stack Migration — Client-Web

**Branch**: `040-ory-stack-migration` | **Date**: 2026-03-26

This document describes the entity and type changes relevant to the client-web migration from `@ory/kratos-client` v1.3.8 to v26.2.0. Since this is an SDK upgrade (not a new feature), the focus is on type compatibility and behavioral changes rather than new entities.

## Entity Changes

### 1. UiNode — New Division Attribute Type

**Entity**: `UiNode` (from `@ory/kratos-client`)

| Property | v1.3.8 | v26.2.0 | Impact |
|----------|--------|---------|--------|
| `attributes` union | `UiNodeInputAttributes \| UiNodeTextAttributes \| UiNodeAnchorAttributes \| UiNodeScriptAttributes \| UiNodeImageAttributes` | Adds `UiNodeDivisionAttributes` | New case in node rendering |

**New type: `UiNodeDivisionAttributes`**

| Field | Type | Description |
|-------|------|-------------|
| `node_type` | `'div'` | Discriminator for the union |
| `id` | `string` | DOM element ID |
| `class` | `string` (optional) | CSS class name |
| `data` | `Record<string, unknown>` (optional) | Arbitrary data attributes |

**Validation**: No validation rules — this is a display-only node type.

**Rendering**: Should be explicitly handled via an `isDivisionNode` type guard in `helpers.ts` and rendered as a container `<div>` in `KratosUI.tsx`. Fallthrough to the `rest` group is acceptable as a safety net but explicit handling is preferred for type safety.

### 2. Identity — New External ID

**Entity**: `Identity` (from `@ory/kratos-client`)

| Property | v1.3.8 | v26.2.0 | Impact |
|----------|--------|---------|--------|
| `external_id` | N/A | `string \| undefined` (optional) | No impact — not used by client-web |

### 3. Enum Sentinel Values

All `as const` enum objects gain an `UnknownDefaultOpenApi: '11184809'` sentinel value. This is an OpenAPI generator artifact and has no functional impact. Existing code that uses string comparisons or switches on known values will not be affected — the sentinel is only returned for unknown/future values.

**Affected enums** (non-exhaustive):
- `UiNodeGroupEnum`
- `UiNodeInputAttributesTypeEnum`
- `UiNodeInputAttributesAutocompleteEnum`
- `UiNodeInputAttributesNodeTypeEnum`

## Behavioral State Changes

### 4. OIDC Registration Flow — Node Group Reassignment

**State transition change**: When OIDC registration validation fails, error nodes move from `group: 'oidc'` to `group: 'default'`.

```
v1.3.8 behavior:
  OIDC registration → validation fails → error nodes in group: 'oidc'

v26.2.0 behavior:
  OIDC registration → validation fails → error nodes in group: 'default'
  (OIDC submit button stays in group: 'oidc')
```

**Impact on rendering**:
- `default` group nodes render at the top of the form (before password/profile fields)
- OIDC submit buttons remain in the `oidc` group (rendered separately)
- No code change needed — `default` group is already rendered

### 5. OIDC Account Linking Flow — HTTP Status Change

**State transition change**: When account linking fails (email already associated), HTTP response changes from 200 to 400.

```
v1.3.8 behavior:
  OIDC link attempt → email exists → HTTP 200 + flow with error messages
  Client: flow state updated normally, errors rendered

v26.2.0 behavior:
  OIDC link attempt → email exists → HTTP 400 + flow with error messages
  Client: axios throws, enters catch block, errors not rendered (BUG)
```

**Required fix**: Extract flow from `error.response.data` on 400 status and update flow state.

**New error message**:
- ID: `1010016`
- Text: "You tried to sign in with {provider}, but that email is already used by another account."

### 6. Rate Limiting Flow — Status Code Mapping

**State transition change**: Rate limit detection pathway through Oathkeeper.

```
v1.3.8 behavior:
  Too many attempts → Kratos 429 → Oathkeeper passes through → client detects 429

v26.2.0 behavior:
  Too many attempts → Kratos 429 → Oathkeeper maps to 401 → redirect with ?lockout=true&retry_after=N
  Client: detects lockout via query parameter (ALREADY IMPLEMENTED)
```

**No code change needed** — existing `LoginPage.tsx` lockout detection is correct.

### 7. Disabled Identity Error (New)

**New state**: Login/recovery for disabled identities returns UI error message ID `4010011` instead of generic 401.

| Message ID | Type | Text | Action |
|------------|------|------|--------|
| `4010011` | error | "This account is disabled." | Display message; no special handling needed beyond translation |

**Impact**: Optional — add to `messages.tsx` for proper i18n translation. Without it, Kratos fallback text is displayed (acceptable).

## Type Migration Summary

| Import | v1.3.8 | v26.2.0 | Status |
|--------|--------|---------|--------|
| `Configuration` | exists | unchanged | Safe |
| `FrontendApi` | exists | unchanged | Safe |
| `UiContainer` | exists | unchanged | Safe |
| `UiNode` | exists | `attributes` union expanded | Safe (additive) |
| `UiNodeInputAttributes` | exists | unchanged | Safe |
| `UiNodeScriptAttributes` | exists | unchanged | Safe |
| `UiNodeTextAttributes` | exists | unchanged | Safe |
| `UiNodeAnchorAttributes` | exists | unchanged | Safe |
| `UiNodeAttributes` | union | adds `UiNodeDivisionAttributes` | Safe (additive) |
| `UiText` | exists | unchanged | Safe |
| `Session` | exists | unchanged | Safe |
| `LoginFlow` | exists | unchanged | Safe |
| `RegistrationFlow` | exists | unchanged | Safe |
| `SettingsFlow` | exists | unchanged | Safe |
| `VerificationFlow` | exists | unchanged | Safe |
| `RecoveryFlow` | exists | unchanged | Safe |
