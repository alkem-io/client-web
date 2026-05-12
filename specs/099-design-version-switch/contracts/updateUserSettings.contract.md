# Contract: updateUserSettings mutation usage

**Document**: `src/domain/community/userAdmin/graphql/updateUserSettings.graphql` (existing — no change)
**Generated hook**: `useUpdateUserSettingsMutation` from `src/core/apollo/generated/apollo-hooks.ts`
**Change type**: reuse — no GraphQL document edits; new field surface added by codegen once server deploys.

## Input shape used by `useDesignVersionToggle`

```ts
await updateUserSettings({
  variables: {
    settingsData: {
      userID,                     // current user's ID from useCurrentUserContext()
      settings: {
        designVersion: enabled ? '2' : '1',
      },
    },
  },
});
```

- `userID` is the `id` from the current authenticated user (already exposed by `useCurrentUserContext`).
- `settings.designVersion` is a string literal — strictly `"1"` (old design) or `"2"` (new design). Never `null` from the client; "no preference" is the absence of any client-initiated update.
- All other `settings.*` sub-objects are intentionally omitted. The server's update is field-level merge; sending only `designVersion` will not zero out `privacy`, `communication`, etc.

## Optimistic update / cache write

None. The toggle path is:

1. Fire the mutation.
2. On success: write LS, log to Sentry, call `window.location.reload()`. The reload re-runs `CurrentUserLight` from scratch, so the Apollo cache is rehydrated freshly — no manual `update()` function needed.
3. On error: leave LS untouched, surface a non-blocking notification.

This is intentionally simpler than the typical Apollo optimistic-response pattern because we are about to discard the entire React tree.

## Error handling

```ts
try {
  await updateUserSettings({ /* ... */ });
  writeCrdEnabledToStorage(enabled);
  logInfo(`Design version changed to "${enabled ? '2' : '1'}"`, {
    label: 'DESIGN_VERSION_SWITCH',
    category: 'user-action',
  });
  window.location.reload();
} catch (err) {
  // Existing notification system — match the pattern in UserAdminSettingsPage.tsx
  // The active design remains whatever it was before the click.
  notify(t('topBar.designVersion.errorSaving'), { variant: 'error' });
}
```

(`notify` here is shorthand for the existing project notification helper; the exact import will be whatever `UserAdminSettingsPage.tsx` uses today.)

## Authorization

No new permission. The platform authorization model already restricts `updateUserSettings` so that a user can only update their own settings. The toggle is gated to authenticated users in the UI (FR-003), so this never fires for anonymous viewers.

## Cancellation / re-entry

- The toggle is disabled while `isPending` is true (mutation in flight). A second click is impossible.
- If the page is navigated away or unmounted before the mutation resolves, the in-flight promise is dropped. Since the success path reloads the page, this only happens on error — and the user is back to the pre-toggle state, which is internally consistent.
