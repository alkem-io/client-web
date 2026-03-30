# Research: Ory Stack Migration — Client-Web

**Branch**: `040-ory-stack-migration` | **Date**: 2026-03-26

## 1. SDK Package Name & Version

**Decision**: Keep `@ory/kratos-client`, upgrade from `^1.3.8` to `^26.2.0`.

**Rationale**: The npm package name is unchanged. Ory adopted unified calendar versioning — the version jumps from 1.3.8 → 25.4.0 → 26.2.0. The package was published 2026-03-24 and still uses axios as its HTTP client. The `FrontendApi` class constructor signature is unchanged: `new FrontendApi(config, undefined, axiosInstance)`.

**Alternatives considered**:
- `@ory/client` — for Ory Network (hosted). Alkemio is self-hosted, so this does not apply.
- `@ory/client-fetch` — Fetch API-based client for Ory Network. Not applicable.

## 2. TypeScript Type Compatibility

**Decision**: All existing type imports are safe. Only additive changes.

**Rationale**: Direct diff of `api.ts` between v1.3.8 and v26.2.0 confirms every type currently imported in the codebase exists with the same name and properties:
- `Configuration`, `FrontendApi`, `UiContainer`, `UiNode`, `UiNodeInputAttributes`, `UiNodeScriptAttributes`, `UiNodeTextAttributes`, `UiNodeAnchorAttributes`, `UiNodeAttributes`, `UiText`, `Session`, `LoginFlow`, `RegistrationFlow`, `SettingsFlow`, `VerificationFlow`, `RecoveryFlow` — all unchanged.

**New types added (additive)**:
- `UiNodeDivisionAttributes` — new node attribute type for `node_type: 'div'`
- SAML-related types (not used by Alkemio)
- `Identity` gains optional `external_id` property

**Enum changes**:
- All `as const` enum objects gain an `UnknownDefaultOpenApi: '11184809'` sentinel value
- `UiNodeInputAttributesAutocompleteEnum` adds `UsernameWebauthn: 'username webauthn'`
- `UiNodeGroupEnum` unchanged except for the sentinel addition

## 3. Flow API Endpoint Changes

**Decision**: No endpoint changes. All `FrontendApi` methods have identical signatures.

**Rationale**: The five flow types (login, registration, recovery, verification, settings) use the same endpoints and lifecycle (create browser flow → get flow → update flow). No method signatures changed.

## 4. Rate Limiting: Oathkeeper 429-to-401 Mapping

**Decision**: Use existing `lockout` query parameter detection mechanism. No new client-side HTTP status code parsing needed.

**Rationale**: When Kratos returns 429, Oathkeeper maps it to 401 and redirects to the login page with `?lockout=true&retry_after=<seconds>`. The current `LoginPage.tsx` already implements this detection:
```typescript
const isLockedOut = params.get('lockout') === 'true';
const retryAfterRaw = Number(params.get('retry_after'));
```

**What needs verification**: Confirm this existing code works correctly against Kratos v26.2.0 + Oathkeeper v26.2.0. The detection mechanism is sound — only functional testing is needed.

**Alternatives considered**:
- Parse response headers for `Retry-After` — unreliable because Oathkeeper strips these in 401 responses.
- Check response body for rate-limit indicators — unreliable because 401 bodies are generic.

## 5. OIDC Registration Node Group Change

**Decision**: Update client to render OIDC validation errors from the `default` node group (in addition to `oidc`).

**Rationale**: Since v25.4.0, fields failing validation during OIDC sign-up are placed in the `default` group instead of `oidc`. The current `KratosUI.tsx` already renders `default` group nodes, so most error messages will be visible without changes. However, the following needs review:

1. **Error display positioning**: `default` group nodes render at the top of the form. OIDC-specific validation errors appearing there (instead of near the social buttons) is acceptable UX.
2. **Cleverbase flow detection**: `RegistrationPage.tsx` checks for `node.group === 'oidc'` to detect Cleverbase flows — this still works because the OIDC *submit button* itself stays in `oidc`; only failing validation *fields* move to `default`.
3. **`MESSAGE_CODE_CLAIM_MISSING` (4000002)**: Error detection searches all nodes regardless of group — no change needed.

**Alternatives considered**:
- Set `legacy_oidc_registration_node_group=true` flag — rejected per spec assumption: not a permanent solution.

## 6. OIDC Account Linking 400 Response

**Decision**: Update `useKratosFlow.ts` error handling to extract flow UI from HTTP 400 responses during OIDC account linking.

**Rationale**: Since v25.4.0, when OIDC sign-up uses an email already associated with another account, Kratos returns HTTP 400 (was 200) with error message ID `1010016`. The current `useKratosFlow.ts` treats all non-200 responses as errors and enters the `catch` block. The 400 response body contains the updated flow with error messages that need to be rendered.

**Required changes**:
1. In the axios error interceptor or flow handling, detect 400 responses from registration/settings flows.
2. Extract the flow object from the 400 response body (`error.response.data`).
3. Update the flow state so the UI renders the error messages normally.

**Alternatives considered**:
- Redirect to a generic error page — rejected: poor UX, user loses context.
- Catch 400 globally in axios interceptor — rejected: too broad, would affect non-auth API calls.

## 7. New `UiNodeDivisionAttributes` Node Type

**Decision**: Add a fallback case in `KratosUI.tsx` for `node_type: 'div'` nodes, rendering them in the `rest` group.

**Rationale**: v26.2.0 adds `UiNodeDivisionAttributes` for `div` nodes with `class`, `data`, `id`, and `node_type` properties. The current node grouping logic in `KratosUI.tsx` does not handle this type. Without a handler, these nodes would be silently dropped. Adding them to the `rest` group ensures they render in a fallback section.

**Alternatives considered**:
- Ignore div nodes entirely — rejected: violates spec edge case requirement about rendering unknown groups.
- Full custom rendering — premature: no current Kratos flow uses div nodes in a way requiring special treatment.

## 8. Session Handling Changes

**Decision**: No client-side session handling changes required.

**Rationale**: The `toSession()` method and `Session` interface are unchanged. The only addition is an optional `external_id` property on `Identity`. The Hydra session cookie cleanup on logout (#1762) is handled server-side.

## 9. Disabled Identity Error (New in v26.1.16)

**Decision**: No immediate action required, but worth noting.

**Rationale**: Login and recovery flows for disabled identities now return UI error message ID `4010011` instead of a generic 401. The current codebase does not handle disabled identities specifically. If this message needs translation or special handling, it can be added to `messages.tsx` as a follow-up.

## 10. Security Advisories (v26.2.0)

**Decision**: No client-web code changes needed for security fixes.

**Rationale**: Six CVEs were fixed across Ory components. The Oathkeeper path traversal fix (CVE-2026-33494) and X-Forwarded-Proto header fix (CVE-2026-33495) are transparent to the client but require Oathkeeper v26.2.0 deployment — handled by the infrastructure team.

## Sources

- [Ory v25.4.0 Release Notes](https://changelog.ory.com/announcements/ory-v25-4-0-released)
- [Ory v26.2.0 Release Notes](https://changelog.ory.com/announcements/ory-network-ory-kratos-ory-oathkeeper-ory-elements-v26-2-0-released)
- [Ory v26.1.16 Release (Oathkeeper rate-limit fix)](https://changelog.ory.com/announcements/ory-network-ory-kratos-ory-oathkeeper-v26-1-16-released)
- [Account Linking Response Code Change](https://changelog.ory.com/announcements/account-linking-response-code-change)
- [Oathkeeper 429/401 Issue #1167](https://github.com/ory/oathkeeper/issues/1167)
- [@ory/kratos-client npm](https://www.npmjs.com/package/@ory/kratos-client)
- [Ory Kratos Upgrade Guide](https://www.ory.com/docs/kratos/guides/upgrade)
- alkem-io/alkemio#1677, alkem-io/client-web#9396, alkem-io/client-web#9461
