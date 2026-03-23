# Research: PWA Push Notifications

**Feature**: 023-pwa-push-notifications | **Date**: 2026-03-16

---

## R1: Server GraphQL API for Push Notifications

**Decision**: Use the existing server GraphQL API as documented in the PRD. The server exposes `vapidPublicKey` query, `myPushSubscriptions` query, `subscribeToPushNotifications` mutation, and `unsubscribeFromPushNotifications` mutation.

**Rationale**: The server-side push infrastructure (Feature 038) is fully implemented and deployed. The GraphQL schema includes all necessary types (`PushSubscription`, `PushSubscriptionStatus`, input types). The notification settings channels already include a `push: Boolean!` field alongside `email` and `inApp`. No client-side schema extensions needed — only new `.graphql` document files and codegen.

**Alternatives considered**:
- REST API for push subscription management — rejected because the project standardizes on GraphQL and the server already provides these operations
- WebSocket-based subscription updates — unnecessary; Apollo polling or cache updates after mutations are sufficient

**Key finding**: The generated GraphQL schema (`graphql-schema.ts`) does **not yet** contain push-related types. This means `pnpm codegen` must be run against a backend that includes the push feature (server Feature 038) to generate the types and hooks.

---

## R2: Service Worker Push Event Handling

**Decision**: Extend the existing `public/service-worker.js` with `push`, `notificationclick`, and `pushsubscriptionchange` event listeners. No separate service worker file.

**Rationale**: The app already has a registered service worker at `public/service-worker.js` handling version checking. The SW registration in `src/serviceWorker.ts` is already wired up in `src/index.tsx`. Adding push handlers to the same file follows the spec requirement and avoids scope conflicts.

**Alternatives considered**:
- Separate push-specific service worker — rejected because browsers only allow one active SW per scope, and the existing SW at `/` scope is already handling version management
- Using Workbox for push — rejected because it adds a dependency and the native Push API is simple enough for our use case

**Implementation details**:
- `push` event: Parse JSON payload (`{ title, body, url, eventType, timestamp }`), check if any client is focused (skip notification if foreground), call `self.registration.showNotification()` with title, body, icon (`/android-chrome-192x192.png`), badge (`/android-chrome-192x192.png`), data (`{ url }`), and tag (`eventType` for grouping)
- `notificationclick` event: Close notification, try `clients.matchAll()` to find existing window, focus it and navigate via `postMessage`, or `clients.openWindow(url)` if none
- `pushsubscriptionchange` event: Re-subscribe using the new keys and POST to server (requires VAPID key accessible to SW — store in IndexedDB or pass via `postMessage`)

---

## R3: VAPID Key Handling and Base64URL Conversion

**Decision**: Query `vapidPublicKey` from GraphQL, convert from Base64URL string to `Uint8Array` for use with `PushManager.subscribe({ applicationServerKey })`.

**Rationale**: The Web Push API requires `applicationServerKey` as a `BufferSource`. The server provides the VAPID public key as a Base64URL-encoded string. A simple utility function handles the conversion.

**Alternatives considered**:
- Using a library like `web-push` client-side — rejected because it's a server library; the conversion is trivial (~10 lines)
- Storing the key in the manifest — not viable; VAPID keys are dynamic and server-configured

**Implementation**:
```typescript
function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  return Uint8Array.from(rawData, char => char.charCodeAt(0));
}
```

---

## R4: Notification Permission UX Best Practices

**Decision**: Only request `Notification.requestPermission()` when the user explicitly toggles the push master switch in Settings → Notifications. Never auto-prompt.

**Rationale**: The spec explicitly prohibits proactive prompts or banners (Clarification 2026-03-16). Auto-prompting on page load causes high denial rates (industry data: ~50-70% deny rates for cold prompts). Settings page is the single entry point.

**Alternatives considered**:
- Soft prompt banner after N sessions — explicitly out of scope per spec clarifications
- Prompt on first login — rejected per spec; high denial rate
- Prompt on specific user action (e.g., posting a comment) — not in scope

**Edge cases resolved**:
- `Notification.permission === 'denied'`: Show guidance text explaining how to re-enable in browser settings (FR-013). Cannot re-prompt — browsers block repeated requests after denial.
- iOS Safari: Requires PWA mode (added to Home Screen). Detect via `navigator.standalone` and show guidance.
- Incognito/private browsing: Push subscriptions may not persist. Feature-detect and inform user if needed.

---

## R5: Extending Notification Settings from Dual to Triple Toggle

**Decision**: Create a new `TripleSwitchSettingsGroup` component in `src/core/ui/forms/SettingsGroups/` that follows the existing `DualSwitchSettingsGroup` pattern with a third "push" column. The push column is conditionally rendered based on push support and server enablement. The existing `DualSwitchSettingsGroup` is preserved for potential future use in non-push contexts.

**Rationale**: The existing `DualSwitchSettingsGroup` renders inApp + email columns. Rather than modifying it (risk of breaking existing behavior), a new `TripleSwitchSettingsGroup` adds the push column while maintaining the same API pattern. The existing component is kept in the codebase unchanged.

**Alternatives considered**:
- Modifying `DualSwitchSettingsGroup` to accept variable columns — increases complexity; existing component is well-tested
- Separate push settings section — rejected; spec requires push toggle alongside email/inApp per category

**Key integration points**:
- `NotificationChannels` interface: Add `push: boolean`
- `NotificationOption` type: Add `pushChecked: boolean`
- `NotificationValidationService`: Extend to handle three-way validation (including `REQUIRE_AT_LEAST_ONE` across all three channels)
- `UserAdminNotificationsPage`: Use `TripleSwitchSettingsGroup` for all notification category groups
- All Combined*Settings components updated to pass `pushChecked`, `isPushEnabled`, and `isPushAvailable` props

**Implementation note**: The `UserAdminNotificationsPage` was also refactored to use optimistic updates via `useReducer` for instant UI feedback when toggling settings. Server settings (`serverSettings`) are used in mutation payloads to avoid sending optimistic values, while `currentSettings` (with overrides applied) drives the UI.

---

## R6: Push Subscription Lifecycle and Silent Refresh

**Decision**: On app load, if `Notification.permission === 'granted'`, check existing SW subscription via `registration.pushManager.getSubscription()`. If null or expired, silently re-subscribe and register with server.

**Rationale**: Browser push subscriptions can expire when keys rotate or after extended inactivity. Silent refresh prevents users from silently losing notifications. The `pushsubscriptionchange` event in the SW handles key rotation during the SW's lifetime; the app-load check handles expiry between sessions.

**Alternatives considered**:
- Only rely on `pushsubscriptionchange` — insufficient because the event only fires while the SW is active; doesn't cover between-session expiry
- Server-side ping to validate subscriptions — adds latency; client-side check is instant

**Implementation flow**:
1. App loads → `PushNotificationProvider` mounts
2. Query `vapidPublicKey` → if null, skip everything
3. Check `'PushManager' in window` → if false, skip
4. Check `Notification.permission` → if `'granted'`, proceed to validate
5. `navigator.serviceWorker.ready.then(reg => reg.pushManager.getSubscription())`
6. If subscription exists → verify it's registered with server (compare endpoint)
7. If no subscription → silently create new one and register with server

---

## R7: Logout Cleanup

**Decision**: On logout, unsubscribe the current device's push subscription from both the browser and server before redirecting to Kratos logout.

**Rationale**: FR-017 requires removing the current device's subscription on logout. The logout flow in `LogoutPage.tsx` currently clears the return URL cookie and redirects. Push cleanup should be added before the redirect.

**Alternatives considered**:
- Server-side cleanup on session invalidation — doesn't clean up the browser-side subscription
- Lazy cleanup on next login — leaves stale subscriptions; user expects immediate effect

**Implementation**: In `LogoutPage.tsx`, before `window.location.replace(logoutUrl)`:
1. Get current SW registration
2. Get current push subscription via `getSubscription()`
3. If subscription exists, call `unsubscribeFromPushNotifications` mutation (need subscription ID — store in `sessionStorage` or query `myPushSubscriptions` to find matching endpoint)
4. Call `pushSubscription.unsubscribe()` on browser side
5. Proceed with redirect

**Trade-off**: This adds a brief delay to logout. Acceptable because push cleanup is quick (one mutation + one browser API call). Fire-and-forget pattern: don't block logout if cleanup fails.

---

## R8: Multi-Tab Deduplication

**Decision**: The service worker naturally handles multi-tab deduplication because it's a singleton per scope. The `push` event handler checks `self.clients.matchAll({ type: 'window', includeUncontrolled: true })` for focused windows and skips `showNotification()` if any client is focused (in-app notifications handle foreground).

**Rationale**: FR-004 states push notifications should only appear when the app is backgrounded or closed. The service worker is shared across all tabs, so a single `push` event handler suffices.

**Alternatives considered**:
- Client-side deduplication with BroadcastChannel — unnecessary; SW already singleton
- Using notification `tag` for grouping — complementary; use `eventType` as tag to collapse duplicate events

---

## R9: Bundle Size Impact Assessment

**Decision**: Expected bundle impact is well under the 20 KB gzipped threshold.

**Rationale**: The implementation uses only native browser APIs (Push API, Notification API, Service Worker API). No new npm dependencies. New code consists of:
- `usePushNotifications` hook: ~183 lines
- `PushNotificationProvider`: ~134 lines
- `TripleSwitchSettingsGroup`: ~150 lines
- `PushSubscriptionsList`: ~130 lines
- `NotificationValidationService`: ~148 lines
- `NotificationTypes.ts`: ~35 lines
- `NotificationSettings.model.ts`: ~75 lines
- GraphQL documents: 4 files (~30 lines total, plus codegen additions)
- Service worker additions: ~110 lines (not in main bundle)
- Utility functions: ~6 lines
- `UserAdminNotificationsPage` changes: ~835 lines total (significant refactor with optimistic updates)

**Estimated total**: Well within the 20 KB gzipped budget. The bulk of the changes are in notification settings UI, which was refactored from a simpler pattern to support three channels with optimistic updates.
