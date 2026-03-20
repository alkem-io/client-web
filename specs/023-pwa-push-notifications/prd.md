# PRD: PWA Push Notifications — Client Web

**Feature**: 023-pwa-push-notifications | **Date**: 2026-03-16
**Server Feature**: 038-pwa-push-notifications (fully implemented)

---

## 1. Overview

Add browser push notification support to the Alkemio client-web application. The server-side infrastructure (GraphQL API, RabbitMQ delivery pipeline, VAPID auth, subscription storage, per-user throttling, retry with backoff) is complete. This PRD covers the client-side work required to deliver end-to-end push notifications.

---

## 2. Goals

| # | Goal | Success Metric |
|---|------|---------------|
| G1 | Users can opt-in to push notifications from their browser | ≥ 20% of active users subscribe within 30 days |
| G2 | Users receive timely push notifications for platform events | Notification delivered < 5s after event (p95) |
| G3 | Users can manage push preferences per notification category | Push toggle available alongside email/inApp in settings |
| G4 | Multi-device support works seamlessly | Users can subscribe on multiple browsers/devices |
| G5 | Feature degrades gracefully when unsupported or disabled | No errors on browsers without Push API; no prompts when server disables push |

---

## 3. User Stories

### P1 — Core (MVP)

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-1 | As a user, I want to enable push notifications from Settings so I can stay informed | Permission requested only when user toggles the push master switch in Settings → Notifications (no auto-prompt) |
| US-2 | As a user, I want to receive browser push notifications for platform events | Push notification shown with title, body, and app icon; tapping opens the relevant page |
| US-3 | As a user, I want to manage which notification categories send push notifications | Each category in Settings → Notifications has a push toggle (alongside email/inApp) |
| US-4 | As a user, I want to unsubscribe from push notifications | Single-click disable in settings removes subscription from server |

### P2 — Enhanced

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-5 | As a user, I want to see my active push subscriptions (devices) | Settings page lists subscriptions with device/browser info and "Remove" action |
| US-6 | As a user, I want push notifications to deep-link to the relevant content | Clicking a notification navigates to the correct page (space, post, conversation) |
| US-7 | As a returning user, I want my subscription to be silently refreshed | On app load, subscription is validated and re-registered if keys changed |

### P3 — Polish

| ID | Story | Acceptance Criteria |
|----|-------|---------------------|
| US-8 | As a user on an unsupported browser, I see no push-related UI | Push toggles and prompt hidden when `PushManager` is unavailable |
| US-9 | As an admin, I want push disabled gracefully when the server has it off | `vapidPublicKey` returns null → all push UI hidden, no errors |

---

## 4. GraphQL API Contract (Server — Already Implemented)

### Queries

```graphql
# Returns VAPID public key or null if push is disabled
vapidPublicKey: String

# Returns current user's active push subscriptions
myPushSubscriptions: [PushSubscription!]!
```

### Mutations

```graphql
# Register a device for push notifications (upsert by endpoint)
subscribeToPushNotifications(
  subscriptionData: SubscribeToPushNotificationsInput!
): PushSubscription!

# Remove a push subscription
unsubscribeFromPushNotifications(
  subscriptionData: UnsubscribeFromPushNotificationsInput!
): PushSubscription!
```

### Types

```graphql
type PushSubscription {
  id: UUID!
  createdDate: DateTime!
  status: PushSubscriptionStatus!
  userAgent: String
  lastActiveDate: DateTime
}

enum PushSubscriptionStatus {
  ACTIVE
  EXPIRED
}

input SubscribeToPushNotificationsInput {
  endpoint: String!        # PushSubscription.endpoint
  p256dh: String!          # Base64URL from getKey('p256dh')
  auth: String!            # Base64URL from getKey('auth')
  userAgent: String        # navigator.userAgent (optional)
}

input UnsubscribeFromPushNotificationsInput {
  subscriptionID: UUID!
}
```

### Notification Payload (received in service worker `push` event)

```json
{
  "title": "string",
  "body": "string",
  "url": "string — relative deep-link path",
  "eventType": "string — NotificationEvent enum",
  "timestamp": "string — ISO 8601"
}
```

### User Settings Extension

Every notification category's channels object now includes `push: Boolean!` alongside `email` and `inApp`.

---

## 5. Technical Requirements

### 5.1 Service Worker Extension

**Current state**: `public/service-worker.js` handles version checking only.

**Required additions**:

| Requirement | Details |
|-------------|---------|
| `push` event listener | Parse JSON payload, call `self.registration.showNotification()` with title, body, icon, badge, deep-link data, tag (eventType for grouping) |
| `notificationclick` handler | Close notification, focus existing client window or `clients.openWindow(url)` |
| `pushsubscriptionchange` handler | Re-subscribe and POST new subscription to server (handles browser key rotation) |
| Icon/badge assets | Use existing PWA icons (`/android-chrome-192x192.png` for both icon and badge) |

### 5.2 Push Subscription Management Hook

Create `usePushNotifications()` hook providing:

```typescript
interface UsePushNotifications {
  /** Whether the browser supports push */
  isSupported: boolean;
  /** Whether the server has push enabled (vapidPublicKey !== null) */
  isServerEnabled: boolean;
  /** Current browser permission state: 'default' | 'granted' | 'denied' */
  permissionState: NotificationPermission;
  /** Whether the current device is subscribed */
  isSubscribed: boolean;
  /** Subscribe the current device */
  subscribe: () => Promise<void>;
  /** Unsubscribe the current device */
  unsubscribe: () => Promise<void>;
  /** Loading state for async operations */
  loading: boolean;
}
```

**Implementation notes**:
- Query `vapidPublicKey` on mount; if null, set `isServerEnabled = false` and short-circuit
- Check `'PushManager' in window` and `'serviceWorker' in navigator` for `isSupported`
- Use `Notification.permission` for current permission state
- On `subscribe()`: request permission → `registration.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey })` → call `subscribeToPushNotifications` mutation
- On `unsubscribe()`: call `unsubscribeFromPushNotifications` mutation (if cached subscription ID available) → call `PushSubscription.unsubscribe()` browser API. If no cached ID, skip the server mutation and only remove the browser subscription (server cleans orphaned records on delivery failure)
- Convert VAPID public key from Base64URL string to `Uint8Array` for `applicationServerKey`

### 5.3 GraphQL Documents

Add to `src/` (exact location follows project conventions):

| File | Content |
|------|---------|
| `vapidPublicKey.graphql` | Query for VAPID public key |
| `myPushSubscriptions.graphql` | Query for user's active subscriptions |
| `subscribeToPushNotifications.graphql` | Subscribe mutation |
| `unsubscribeFromPushNotifications.graphql` | Unsubscribe mutation |

Run codegen to generate typed hooks: `pnpm codegen`

### 5.4 Notification Settings UI Extension

**Location**: `src/domain/community/userAdmin/tabs/`

| Change | Details |
|--------|---------|
| Extend `NotificationChannels` model | Add `push: boolean` field |
| Create `TripleSwitchSettingsGroup` | New component with email / inApp / push toggles (extends existing `DualSwitchSettingsGroup`) |
| Conditional rendering | Only show push toggle when `isSupported && isServerEnabled` |
| Master push toggle | Add top-level "Enable Push Notifications" switch that triggers permission request and subscription |
| Per-category toggles | Each notification category shows push toggle (disabled until master toggle is on) |
| Device management section | List active subscriptions from `myPushSubscriptions` with remove button |

### 5.5 Permission Prompt UX

**Trigger**: Permission is requested ONLY from the Settings → Notifications page when the user explicitly toggles the push master switch.

| Trigger Point | Behavior |
|---------------|----------|
| Settings page | User explicitly enables push via toggle → triggers `Notification.requestPermission()` |
| Return visit (deferred) | If user previously granted permission and subscription expired, silently re-subscribe (no prompt) |

**Never**:
- Auto-prompt on page load (causes high denial rates)
- Show push UI when `Notification.permission === 'denied'` (explain how to reset in browser)

### 5.6 Subscription Lifecycle

```
App Load
  ├─ vapidPublicKey query
  │   └─ null? → hide all push UI
  │
  ├─ Check browser support (PushManager, serviceWorker)
  │   └─ unsupported? → hide all push UI
  │
  ├─ Check Notification.permission
  │   ├─ 'denied' → show "blocked" hint in settings
  │   ├─ 'default' → show opt-in UI
  │   └─ 'granted' → check existing subscription
  │       ├─ has subscription? → validate & refresh if needed
  │       └─ no subscription? → silently re-subscribe (only if user has not explicitly disabled push)
  │
  └─ Listen for pushsubscriptionchange → re-register
```

### 5.7 PWA Manifest Update

Add to `public/manifest.json`:

```json
{
  "gcm_sender_id": "103953800507"
}
```

> Note: `gcm_sender_id` with the value `103953800507` is required for Chrome/FCM compatibility regardless of using VAPID. This is a well-known constant.

### 5.8 Internationalization

Add translation keys to `src/core/i18n/en/translation.en.json`:

```
notifications.push.enable
notifications.push.disable
notifications.push.permissionDenied
notifications.push.unsupported
notifications.push.subscribed
notifications.push.unsubscribed
notifications.push.devices
notifications.push.removeDevice
notifications.push.promptTitle
notifications.push.promptBody
```

---

## 6. Component Breakdown

### New Components

| Component | Location | Purpose |
|-----------|----------|---------|
| `PushNotificationProvider` | `src/main/pushNotifications/` | Context provider wrapping the app; queries VAPID key, manages subscription state |
| `usePushNotifications` | `src/main/pushNotifications/` | Core hook (see §5.2) |
| `PushSubscriptionsList` | `src/domain/community/userAdmin/tabs/` | Lists active subscriptions with remove buttons |
| `TripleSwitchSettingsGroup` | `src/domain/community/userAdmin/tabs/` | Triple toggle (email/inApp/push) for notification categories |

### Modified Components

| Component | Change |
|-----------|--------|
| `public/service-worker.js` | Add `push`, `notificationclick`, `pushsubscriptionchange` event listeners |
| `src/serviceWorker.ts` | No changes needed (registration already in place) |
| `src/root.tsx` | Add `PushNotificationProvider` in provider tree (after `AuthenticationProvider`, before `InAppNotificationsProvider`) |
| `UserAdminNotificationsPage` | Replace `DualSwitchSettingsGroup` with `TripleSwitchSettingsGroup`; add device management section |
| `CombinedUserNotificationsSettings` | Pass push channel data |
| `CombinedSpaceNotificationsSettings` | Pass push channel data |
| `CombinedPlatformNotificationsSettings` | Pass push channel data |
| `OrganizationNotificationsSettings` | Pass push channel data |
| `VCNotificationsSettings` | Pass push channel data |
| `userSettingsFragment.graphql` | Add `push` field to notification channels fragments |
| `updateUserSettings.graphql` | Include `push` in mutation input |
| `public/manifest.json` | Add `gcm_sender_id` |
| `codegen.yml` | No changes needed (picks up new `.graphql` files automatically) |

---

## 7. Error Handling

| Scenario | Behavior |
|----------|----------|
| Browser doesn't support Push API | Hide all push UI; `isSupported = false` |
| Server returns `vapidPublicKey = null` | Hide all push UI; `isServerEnabled = false` |
| User denies permission | Show message: "Push notifications blocked. You can enable them in your browser settings." |
| `PushManager.subscribe()` fails | Log error, show toast, keep UI in unsubscribed state |
| Server mutation fails | Rollback browser subscription (`PushSubscription.unsubscribe()`), show error toast |
| Service worker not registered | Attempt registration; if fails, treat as unsupported |
| Subscription expires (pushsubscriptionchange) | Silently re-subscribe and register with server |

---

## 8. Testing Strategy

| Level | What to Test |
|-------|-------------|
| **Unit** | `usePushNotifications` hook: mock `PushManager`, `Notification`, service worker; test state transitions |
| **Unit** | `TripleSwitchSettingsGroup`: renders three toggles, calls onChange correctly |
| **Unit** | `PushSubscriptionsList`: renders subscription list, calls remove mutation |
| **Unit** | VAPID key Base64URL → Uint8Array conversion utility |
| **Component** | Settings page shows/hides push UI based on support and server state |
| **E2E** | Full flow: login → enable push → verify subscription on server → trigger event → receive notification (requires real browser, not headless) |

---

## 9. Security Considerations

- VAPID keys are public (safe to expose `vapidPublicKey` without auth)
- Subscription keys (`p256dh`, `auth`) are sent only over HTTPS to the server
- No sensitive data in push payloads (title + body + relative URL only)
- `userVisibleOnly: true` ensures every push shows a visible notification (browser requirement)
- Service worker scope is `/` (app-wide, matches existing setup)

---

## 10. Browser Support

| Browser | Push Support | Notes |
|---------|-------------|-------|
| Chrome 50+ | Full | Uses FCM; requires `gcm_sender_id` in manifest |
| Firefox 44+ | Full | Native push service |
| Edge 17+ | Full | Chromium-based |
| Safari 16.1+ | Full (macOS) | Requires VAPID; no `gcm_sender_id` needed |
| Safari iOS 16.4+ | Full | Requires app added to Home Screen (PWA mode) |
| Samsung Internet 5+ | Full | Chromium-based |

---

## 11. Implementation Phases

### Phase 1 — MVP (US-1, US-2, US-3, US-4)

1. Service worker `push` + `notificationclick` handlers
2. `vapidPublicKey` query + `subscribeToPushNotifications` mutation (GraphQL documents + codegen)
3. `usePushNotifications` hook
4. `PushNotificationProvider` in app tree
5. Push toggle in notification settings (extend `DualSwitch` → `TripleSwitch`)
6. `userSettingsFragment.graphql` updated with `push` field
7. Master enable/disable toggle in settings
8. i18n keys

### Phase 2 — Enhanced (US-5, US-6, US-7)

1. `myPushSubscriptions` query + device management UI
2. Deep-link navigation from notification click (handle in-app routing)
3. `pushsubscriptionchange` handler for silent re-subscription
4. Subscription validation on app load

### Phase 3 — Polish (US-8, US-9)

1. "Permission denied" guidance UI
3. Browser compatibility guards (hide UI on unsupported)
4. Edge case handling (incognito mode, iOS Home Screen requirement)

---

## 12. Dependencies

| Dependency | Type | Notes |
|------------|------|-------|
| Server 038-pwa-push-notifications | Backend | Must be deployed first; migrations run |
| No new npm packages | — | Uses native Push API + existing service worker |
| GraphQL codegen | Build | Run after adding new `.graphql` documents |

---

## 13. Out of Scope

- Push notification analytics/tracking dashboard
- Rich push notifications (images, actions beyond click-to-open)
- Notification grouping/bundling on client side (server handles throttling)
- Offline push queue (browser handles this natively)
- Custom notification sounds
- Push for unauthenticated/guest users
