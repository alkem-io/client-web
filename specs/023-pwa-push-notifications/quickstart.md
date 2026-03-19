# Quickstart: PWA Push Notifications

**Feature**: 023-pwa-push-notifications | **Date**: 2026-03-16

---

## Prerequisites

1. **Backend with push feature deployed** — Server Feature 038 must be running at `localhost:3000` (via Traefik). The GraphQL schema at `localhost:3000/graphql` must include push notification types.
2. **Node ≥22.0.0, pnpm ≥10.17.1** — as per project requirements
3. **HTTPS or localhost** — Push API requires a secure context. `localhost` is treated as secure by browsers.

## Setup

```bash
# Install dependencies
pnpm install

# Regenerate GraphQL types (requires backend running at localhost:3000/graphql)
pnpm codegen

# Start dev server
pnpm start
```

## Development Workflow

### 1. Service Worker Changes

The service worker at `public/service-worker.js` is a plain JS file served statically. Changes take effect after:
1. Save the file
2. Reload the page (triggers SW update via `skipWaiting()`)
3. Open Chrome DevTools → Application → Service Workers to verify

**Tip**: Check "Update on reload" in DevTools during development.

### 2. Testing Push Notifications Locally

**Option A — Chrome DevTools**:
1. Open DevTools → Application → Service Workers
2. Find the registered SW
3. Use "Push" text field to send a test payload:
   ```json
   {"title":"Test","body":"Hello from push","url":"/","eventType":"test","timestamp":"2026-03-16T00:00:00Z"}
   ```

**Option B — Server-triggered**:
1. Subscribe to push in Settings → Notifications
2. Trigger a platform event (e.g., post a comment in a space)
3. Switch to a different tab or minimize the browser
4. Verify the push notification appears

### 3. Debugging Push Issues

| Issue | Check |
|-------|-------|
| No "Push Notifications" toggle in settings | `vapidPublicKey` query returns null → verify backend push feature is enabled |
| Permission denied | User previously blocked notifications → guide them to browser settings |
| Subscription fails | Check DevTools Console for errors; verify VAPID key format |
| Notifications not appearing | Ensure app is backgrounded; check SW push event handler; verify notification permission is `'granted'` |
| Stale subscription | Clear site data → re-subscribe; or check `pushsubscriptionchange` handler |

### 4. Key Files to Modify

| File | Purpose |
|------|---------|
| `public/service-worker.js` | Push event handlers |
| `src/main/pushNotifications/usePushNotifications.ts` | Core hook |
| `src/main/pushNotifications/PushNotificationProvider.tsx` | App-level context |
| `src/main/pushNotifications/graphql/*.graphql` | GraphQL documents |
| `src/core/ui/forms/SettingsGroups/TripleSwitchSettingsGroup.tsx` | Triple toggle UI |
| `src/domain/community/userAdmin/tabs/UserAdminNotificationsPage.tsx` | Settings page integration |
| `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts` | Data model |
| `src/core/i18n/en/translation.en.json` | Translation keys |

### 5. Running Tests

```bash
# Run all tests
pnpm vitest run

# Run a specific test file
pnpm vitest run src/main/pushNotifications/usePushNotifications.test.ts --reporter=basic

# Watch mode
pnpm test
```

### 6. Linting and Type Checking

```bash
# Full lint (typecheck + ESLint)
pnpm lint

# Format
pnpm format
```

### 7. Verifying Bundle Impact

```bash
# Build with bundle analysis
pnpm analyze

# Check build/stats.html for push notification module sizes
# Target: < 20 KB gzipped added to main bundle
```

## Architecture Quick Reference

```
Browser                          Server (Feature 038)
┌─────────────────────┐         ┌──────────────────────┐
│ PushNotificationProvider       │                      │
│   └─ usePushNotifications     │                      │
│       ├─ vapidPublicKey ──────┼─→ Query              │
│       ├─ subscribe() ────────┼─→ subscribeToPush..   │
│       └─ unsubscribe() ──────┼─→ unsubscribeToPush.. │
│                               │                      │
│ Service Worker                │ Delivery Pipeline    │
│   ├─ push event ←────────────┼── Web Push (VAPID)   │
│   ├─ notificationclick        │                      │
│   └─ pushsubscriptionchange   │                      │
│                               │                      │
│ Settings UI                   │                      │
│   ├─ Master push toggle       │                      │
│   ├─ Per-category toggles ───┼─→ updateUserSettings  │
│   └─ Device management ──────┼─→ myPushSubscriptions │
└─────────────────────┘         └──────────────────────┘
```
