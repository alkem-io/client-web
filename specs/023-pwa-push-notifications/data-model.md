# Data Model: PWA Push Notifications

**Feature**: 023-pwa-push-notifications | **Date**: 2026-03-16

---

## Entities

### PushSubscription (server-managed, client reads)

Represents a user's browser push registration on a specific device.

| Field | Type | Description |
|-------|------|-------------|
| `id` | `UUID!` | Unique identifier (server-generated) |
| `createdDate` | `DateTime!` | When the subscription was created |
| `status` | `PushSubscriptionStatus!` | `ACTIVE` or `EXPIRED` |
| `userAgent` | `String` | Browser/OS from `navigator.userAgent` (auto-detected) |
| `lastActiveDate` | `DateTime` | Last push notification delivery date |

**Relationships**: Belongs to a single authenticated user. A user can have multiple subscriptions (one per device/browser).

**State transitions**:
```text
[Not subscribed] --subscribe()--> ACTIVE --expire/rotate--> EXPIRED --refresh()--> ACTIVE
                                  ACTIVE --unsubscribe()--> [Deleted]
```

### NotificationChannels (extended)

Per-category notification channel preferences.

| Field | Type | Description |
|-------|------|-------------|
| `email` | `boolean` | Email notifications enabled |
| `inApp` | `boolean` | In-app notifications enabled |
| `push` | `boolean` | **NEW** Push notifications enabled |

**Validation rules**:
- At least one channel must remain enabled (existing `REQUIRE_AT_LEAST_ONE` rule extended to three channels)
- Push toggles are disabled (greyed out) when the master push toggle is off
- Push toggles are hidden when browser doesn't support Push API or server has push disabled

### VAPID Configuration (server-provided, client reads)

| Field | Type | Description |
|-------|------|-------------|
| `vapidPublicKey` | `String \| null` | Server's VAPID public key; `null` = push disabled platform-wide |

**No client-side storage** — queried on mount via GraphQL.

---

## Client-Side State

### PushNotificationContext (React Context)

| Field | Type | Source |
|-------|------|--------|
| `isSupported` | `boolean` | Feature detection: `'PushManager' in window && 'serviceWorker' in navigator && 'Notification' in window` |
| `isServerEnabled` | `boolean` | `vapidPublicKey !== null` from GraphQL query |
| `permissionState` | `NotificationPermission` | `Notification.permission` (`'default'` \| `'granted'` \| `'denied'`) |
| `isSubscribed` | `boolean` | Current device has active push subscription |
| `currentSubscriptionId` | `string \| null` | Server-side ID of current device's subscription |
| `subscribe` | `() => Promise<void>` | Request permission + create subscription + register with server |
| `unsubscribe` | `() => Promise<void>` | Remove subscription from browser + server |
| `loading` | `boolean` | Async operation in progress |
| `requiresPWAMode` | `boolean` | iOS detected but not in standalone/PWA mode |
| `isPrivateBrowsing` | `boolean` | Private/incognito mode detected (via `navigator.storage.estimate()` quota < 120MB) |

### Session Storage

| Key | Type | Purpose |
|-----|------|---------|
| `alkemio_push_subscription_id` | `string` | Server-side subscription ID for current device; used for fast lookup during logout cleanup |

---

## Extended TypeScript Interfaces

### NotificationOption (extended)

```typescript
interface NotificationOption {
  inAppChecked: boolean;
  emailChecked: boolean;
  pushChecked: boolean;        // NEW
  label: ReactNode;
  validationRules?: NotificationValidationRule[];
}
```

### NotificationSwitchStates (extended)

```typescript
interface NotificationSwitchStates {
  inApp: SwitchState;
  email: SwitchState;
  push: SwitchState;           // NEW
}
```

### TripleSwitchSettingsGroup onChange

```typescript
type ChannelType = 'inApp' | 'email' | 'push';

type TripleSwitchSettingsGroupProps<T> = {
  options: T;
  onChange: (key: keyof T, type: ChannelType, newValue: boolean) => void | Promise<void>;
  isPushEnabled: boolean;      // Master push toggle state
  isPushAvailable: boolean;    // Browser + server support
};
```

---

## Push Notification Payload (received in service worker)

```typescript
interface PushPayload {
  title: string;               // Notification title
  body: string;                // Notification body text
  url: string;                 // Relative deep-link path (e.g., "/spaces/abc/posts/123")
  eventType: string;           // NotificationEvent enum value (used as tag for grouping)
  timestamp: string;           // ISO 8601 timestamp
}
```

---

## GraphQL Operation → Entity Mapping

| Operation | Entity | Direction |
|-----------|--------|-----------|
| `vapidPublicKey` query | VAPID Configuration | Server → Client |
| `myPushSubscriptions` query | PushSubscription[] | Server → Client |
| `subscribeToPushNotifications` mutation | PushSubscription | Client → Server |
| `unsubscribeFromPushNotifications` mutation | PushSubscription | Client → Server |
| `updateUserSettings` mutation (existing) | NotificationChannels | Client → Server |
| `userSettings` query (existing) | NotificationChannels | Server → Client |
