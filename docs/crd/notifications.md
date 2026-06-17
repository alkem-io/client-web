# Notifications & Toasts in CRD

CRD uses [sonner](https://sonner.emilkowal.ski/) for toast notifications. A single `<Toaster />` is mounted in `App.tsx` (via `CrdNotificationHandler`) and renders at `bottom-right` by default — individual toasts can override position, duration, and add action buttons.

`App.tsx` now mounts `CrdNotificationHandler` unconditionally — CRD is the only runtime path, so the legacy MUI `NotificationHandler.tsx` is no longer rendered (it survives only as a not-yet-removed bridge file). Anything you push through `useNotification()` renders through the CRD toaster.

## The two ways to fire a toast

### 1. `useNotification()` — for the 90% case

Use this for app-state feedback: success after save, validation errors, "copied to clipboard". It writes to the global notifications store and is picked up by whichever handler is mounted (MUI or CRD), so the same call works in both.

```tsx
import { useNotification } from '@/core/ui/notifications/useNotification';

const notify = useNotification();

notify('Profile updated', 'success');
notify('Could not upload — file is too large', 'error');
notify('You have unsaved changes', 'warning');
notify('Sync in progress…', 'info');
```

Severity values: `'info' | 'success' | 'warning' | 'error'` (default `'info'`).

Auto-hide durations come from `src/core/ui/notifications/constants.ts`:

- `error` → 15s (leaves time to read the Contact-Support link)
- `success` / `info` / `warning` → 3s

Apollo errors are auto-pushed by `useErrorHandlerLink` — you do not call `notify` for those.

### 2. `toast` from sonner — for custom position, action buttons, or persistence

When the default bottom-right + auto-hide isn't right (version-update banner, offline indicator, anything with a button), call sonner directly. No second `<Toaster />` needed — the one in `App.tsx` handles all positions.

```tsx
import { toast } from 'sonner';

// Position override
toast.info('New comment posted', { position: 'top-right' });

// Persistent toast with an action button
toast('A new version is available.', {
  position: 'top-center',
  duration: Infinity,
  action: { label: 'Reload', onClick: () => window.location.reload() },
});

// Dismiss programmatically (keep the id sonner returns)
const id = toast.warning('You are offline', { duration: Infinity });
// …later:
toast.dismiss(id);
```

## Positioning conventions

Sonner positions: `top-left` · `top-center` · `top-right` · `bottom-left` · `bottom-center` · `bottom-right`.

| Position | Use for |
|---|---|
| `bottom-right` (default) | Transient app feedback — Apollo errors, save confirmations, validation messages. |
| `top-center` | Platform-level announcements the user shouldn't miss but isn't required to act on immediately — new version available, planned maintenance. |
| `top-right` | Secondary platform indicators that need to coexist with `top-center` — e.g. offline status. |

## Worked examples

### Version detected (sticky, with Reload action)

```tsx
import { toast } from 'sonner';

toast('A new version of Alkemio is available.', {
  position: 'top-center',
  duration: Infinity,
  action: { label: 'Reload', onClick: () => window.location.reload() },
});
```

### Offline status (sticky, dismissed when connectivity returns)

```tsx
import { useEffect, useRef } from 'react';
import { toast } from 'sonner';

const useOfflineToast = (isOnline: boolean) => {
  const toastIdRef = useRef<string | number>();

  useEffect(() => {
    if (!isOnline && toastIdRef.current === undefined) {
      toastIdRef.current = toast.warning('You are offline. Some features may be unavailable.', {
        position: 'top-right',
        duration: Infinity,
      });
    }
    if (isOnline && toastIdRef.current !== undefined) {
      toast.dismiss(toastIdRef.current);
      toastIdRef.current = undefined;
    }
  }, [isOnline]);
};
```

### Error with custom message (not Apollo-derived)

```tsx
notify('Could not upload file — try a smaller image.', 'error');
```

### Promise-tied toast (loading → success/error in one call)

```tsx
toast.promise(saveProfile(), {
  loading: 'Saving…',
  success: 'Profile updated',
  error: 'Save failed — try again',
});
```

## Where the pieces live

- **Primitive**: `src/crd/primitives/sonner.tsx` — wraps `<Sonner>` and bridges sonner's `--normal-bg` / `--normal-text` / `--normal-border` vars to CRD's `--popover` / `--popover-foreground` / `--border`.
- **Global handler**: `src/core/ui/notifications/CrdNotificationHandler.tsx` — subscribes to the same notifications store as the MUI handler, fans each entry out to `toast.<severity>()`, dispatches `CLEAR_NOTIFICATION` on auto-close/dismiss, and mounts the global `<Toaster position="bottom-right" />`.
- **Legacy MUI handler**: `src/core/ui/notifications/NotificationHandler.tsx` — no longer rendered (CRD is the only path); kept only as a not-yet-removed bridge file.
- **Mount**: `src/main/ui/layout/topLevelWrappers/App.tsx` — renders `<CrdNotificationHandler />` unconditionally.

## Migrating existing MUI snackbars

`src/main/versionHandling.tsx` and `src/main/onlineStatus/OnlineStatusNotification.tsx` still mount their own MUI `Snackbar`s. To move them to sonner:

1. Replace `<Snackbar><SnackbarContent action={…} /></Snackbar>` with a `toast(...)` call when the trigger fires.
2. Use `duration: Infinity` (no auto-hide) and `position: 'top-center'` (version) / `'top-right'` (offline).
3. Use sonner's `action: { label, onClick }` instead of MUI's `SnackbarContent.action`.
4. Keep the returned id in a ref so you can `toast.dismiss(id)` when the condition clears.
