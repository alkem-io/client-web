# Research: Enhanced Error Handling with Server Error Extensions

**Feature**: 013-error-handling-extensions
**Date**: 2026-01-28

## Research Questions

### 1. Server Error Extensions Structure

**Question**: What is the exact structure of the new error extensions from the server?

**Decision**: The server returns GraphQL errors with `extensions` containing:

- `numericCode`: number (composed as `categoryCode * 1000 + specificCode`, e.g., 10101 for NOT_FOUND + ENTITY_NOT_FOUND)
- `userMessage`: string (currently plain English text, will be replaced with i18n keys)

**Rationale**: The server code provided by user shows the `STATUS_METADATA` mapping with categories:

- 10xxx: NOT_FOUND errors
- 11xxx: AUTHORIZATION errors
- 12xxx: VALIDATION errors
- 13xxx: OPERATIONS errors
- 14xxx: SYSTEM errors
- 99xxx: FALLBACK errors

**Alternatives considered**: None - server structure is fixed.

### 2. Translation Key Format

**Question**: How should `userMessage` translation keys be structured for i18n?

**Decision**: Use flat structure under `apollo.errors.userMessages` namespace:

```
apollo.errors.userMessages.notFound.entity
apollo.errors.userMessages.authorization.unauthenticated
```

The server will send these exact key paths, and the client will look them up via `i18n.exists()` and `t()`.

**Rationale**:

- Keeps error translations grouped under `apollo.errors` (existing pattern)
- Hierarchical by category matches server's category organization
- Allows easy fallback to generic messages when key missing

**Alternatives considered**:

- Flat keys like `errors.10101` - rejected, not human readable
- Server sends full translated text - rejected, not i18n compliant

### 3. Notification System Extension

**Question**: How to pass `numericCode` through the notification system?

**Decision**: Extend the XState notification machine:

1. Add `numericCode?: number` to `Notification` type
2. Add `numericCode` to `PUSH_NOTIFICATION` event payload
3. Update `useNotification` hook to accept optional `numericCode`

**Rationale**:

- Minimal change to existing architecture
- `numericCode` is optional - backward compatible
- Data flows naturally through existing XState context

**Alternatives considered**:

- Create separate error notification system - rejected, duplicates existing infrastructure
- Store `numericCode` in separate context - rejected, complicates data flow

### 4. Mailto URL Generation

**Question**: How to generate properly encoded mailto URLs?

**Decision**: Create utility function `generateSupportMailtoUrl(code?: number)`:

```typescript
const generateSupportMailtoUrl = (code?: number, t: TFunction) => {
  const email = t('common.supportEmail');
  const subject = code
    ? t('apollo.errors.support.emailSubject', { code })
    : t('apollo.errors.support.emailSubjectGeneric');
  const body = code ? t('apollo.errors.support.emailBody', { code }) : t('apollo.errors.support.emailBodyGeneric');

  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
};
```

**Rationale**:

- All text comes from i18n (localization compliant)
- Proper URL encoding prevents special character issues
- Function is pure and easily testable

**Alternatives considered**:

- Inline URL construction in component - rejected, duplicated in multiple places
- Third-party mailto library - rejected, simple enough to implement

### 5. Error Notification Component Design

**Question**: How to add support link to error notifications?

**Decision**: Create `ErrorNotificationContent` component that wraps MUI Alert content:

```tsx
<Alert severity="error">
  <Box>
    <Typography>{message}</Typography>
    <Link href={mailtoUrl}>{t('apollo.errors.support.linkText')}</Link>
  </Box>
</Alert>
```

**Rationale**:

- Separates error notification rendering from generic notifications
- Follows MUI patterns for Alert customization
- Support link appears below message (per clarification session)

**Alternatives considered**:

- Add link to all notifications - rejected, only relevant for errors
- Render link outside Alert - rejected, loses visual association

### 6. Backward Compatibility

**Question**: How to handle errors without new extensions?

**Decision**: All new fields are optional with explicit fallbacks:

1. If `userMessage` missing or translation not found → use existing `code`-based translation
2. If `numericCode` missing → mailto link uses generic subject/body
3. Support link always shown for errors (even without code)

**Rationale**:

- Gradual migration path - works with old and new errors
- No breaking changes to existing behavior
- Support contact always available

**Alternatives considered**:

- Hide support link when no code - rejected, users may still need help
- Require new extensions - rejected, breaks backward compatibility

## Dependencies Confirmed

| Dependency     | Version  | Usage                      |
| -------------- | -------- | -------------------------- |
| @apollo/client | existing | Error type definitions     |
| @mui/material  | existing | Alert, Link, Typography    |
| react-i18next  | existing | Translation functions      |
| xstate         | existing | Notification state machine |
| @xstate/react  | existing | useSelector hook           |

## Risks Identified

| Risk                                              | Mitigation                                                      |
| ------------------------------------------------- | --------------------------------------------------------------- |
| Translation keys mismatch between client/server   | Server will be updated after client translations are defined    |
| Long notification (15s) annoying for minor errors | Considered acceptable per spec; users can always close manually |
| Email clients not configured                      | Standard browser behavior; no mitigation needed                 |

## Open Questions Resolved

All questions resolved. Ready for Phase 1 design.
