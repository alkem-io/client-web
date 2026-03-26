# Feature Specification: PWA Push Notifications

**Feature Branch**: `023-pwa-push-notifications`
**Created**: 2026-03-16
**Status**: Implemented
**Input**: User description: "Add browser push notification support to Alkemio client-web. Server-side infrastructure is fully implemented."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Enable Push Notifications from Settings (Priority: P1)

As an authenticated user, I want to enable push notifications from my notification settings so that I receive timely browser notifications for platform events without having to keep the app open.

**Why this priority**: This is the foundational user journey — without the ability to subscribe to push notifications, no other push features can function. It delivers immediate value by connecting the already-implemented server pipeline to the user's browser.

**Independent Test**: Can be fully tested by logging in, navigating to Settings → Notifications, toggling the push master switch, granting browser permission, and verifying a push notification is received when a platform event occurs.

**Acceptance Scenarios**:

1. **Given** I am logged in and on a supported browser, **When** I navigate to Settings → Notifications, **Then** I see a "Push Notifications" master toggle.
2. **Given** push is not yet enabled, **When** I toggle the master push switch on, **Then** the browser requests notification permission.
3. **Given** I grant browser permission, **When** the subscription completes, **Then** my device is registered with the server and the toggle shows "enabled."
4. **Given** I am subscribed, **When** a platform event occurs (e.g., new comment on my post), **Then** I receive a browser push notification with a title and description.
5. **Given** I am subscribed, **When** I click the push notification, **Then** the app opens (or focuses) and navigates to the relevant content page.

---

### User Story 2 - Manage Push Preferences per Notification Category (Priority: P1)

As a user with push enabled, I want to control which notification categories send me push notifications so that I only receive push alerts for events I care about.

**Why this priority**: Granular control prevents notification fatigue and is essential for user retention. Without it, users face an all-or-nothing choice and are more likely to disable push entirely.

**Independent Test**: Can be tested by enabling push, then toggling individual category push switches on/off and verifying that only enabled categories trigger push notifications.

**Acceptance Scenarios**:

1. **Given** push is enabled, **When** I view notification settings, **Then** each notification category shows a push toggle alongside the existing email and in-app toggles.
2. **Given** the master push toggle is off, **When** I view category settings, **Then** the per-category push toggles are disabled (greyed out).
3. **Given** I disable push for a specific category, **When** an event in that category occurs, **Then** I do not receive a push notification for it (but other channels are unaffected).

---

### User Story 3 - Unsubscribe from Push Notifications (Priority: P1)

As a user who previously enabled push, I want to disable push notifications with a single action so that I stop receiving browser notifications immediately.

**Why this priority**: Users must always have a clear and easy way to opt out. This is a trust and compliance requirement.

**Independent Test**: Can be tested by having push enabled, toggling it off in settings, and confirming no further push notifications are received.

**Acceptance Scenarios**:

1. **Given** I have push enabled, **When** I toggle the master push switch off, **Then** my subscription is removed from the server and the browser.
2. **Given** I have unsubscribed, **When** a platform event occurs, **Then** I receive no push notification.
3. **Given** I have unsubscribed, **When** I return to settings, **Then** the push toggle shows "disabled" and per-category push toggles are hidden or disabled.

---

### User Story 4 - Manage Active Push Subscriptions (Devices) (Priority: P2)

As a user subscribed on multiple devices, I want to see and manage my active push subscriptions so that I can remove devices I no longer use.

**Why this priority**: Multi-device support is common for modern users. Without device management, stale subscriptions accumulate and users cannot control where notifications are delivered.

**Independent Test**: Can be tested by subscribing on two different browsers/devices, then viewing the device list in settings and removing one subscription, confirming notifications stop on that device.

**Acceptance Scenarios**:

1. **Given** I have push enabled on multiple devices, **When** I navigate to the device management section in notification settings, **Then** I see a list of my active subscriptions with browser/device info and creation date.
2. **Given** I view my subscription list, **When** I click "Remove" on a subscription, **Then** that subscription is deleted from the server and no longer receives notifications.

---

### User Story 5 - Silent Subscription Refresh on Return (Priority: P2)

As a returning user who previously granted push permission, I want my subscription to be automatically validated and refreshed so that I continue receiving notifications without manual re-enrollment.

**Why this priority**: Browser push subscriptions can expire or have their keys rotated. Without silent refresh, users silently lose notifications and must manually re-subscribe.

**Independent Test**: Can be tested by simulating a subscription key change (or expiry) and verifying that on next app load, the subscription is silently re-registered without user intervention.

**Acceptance Scenarios**:

1. **Given** I previously granted push permission and my subscription is still valid, **When** I load the app, **Then** no action is taken (subscription remains active).
2. **Given** my subscription has expired or keys have changed, **When** I load the app, **Then** a new subscription is silently created and registered with the server.

---

### User Story 6 - Graceful Degradation on Unsupported Browsers (Priority: P2)

As a user on an unsupported browser (no Push API) or when the server has push disabled, I want to see no push-related UI so that I am not confused by non-functional controls.

**Why this priority**: Showing non-functional UI creates confusion and erodes trust. Graceful degradation is essential for a polished user experience across the browser landscape.

**Independent Test**: Can be tested by accessing the app in a browser without Push API support (or when the server returns no VAPID key) and verifying that no push toggles, prompts, or banners appear.

**Acceptance Scenarios**:

1. **Given** my browser does not support the Push API, **When** I navigate to notification settings, **Then** no push toggles or push-related UI elements are visible.
2. **Given** the server has push disabled (no VAPID key available), **When** I navigate to notification settings, **Then** no push toggles or push-related UI elements are visible.
3. **Given** I have previously denied notification permission in my browser, **When** I navigate to notification settings, **Then** I see guidance explaining how to re-enable notifications via browser settings (not a re-prompt).

---

### Edge Cases

- What happens when a user grants permission but the server subscription call fails? The browser subscription should be rolled back and the user informed via an error message.
- What happens when a user is in an incognito/private browsing window? Push subscription may not persist; the feature should either hide push UI or inform the user that push requires a regular browsing session.
- What happens on iOS Safari when the app is not added to the Home Screen? Push notifications require PWA mode on iOS; the UI should inform the user of this requirement when detected.
- What happens when the user's subscription expires while they are offline? On next app load, the silent refresh mechanism should detect the expired subscription and re-register.
- What happens when multiple tabs are open? The service worker is shared across tabs and shows one push notification per event. Push notifications are always shown regardless of tab focus state, since focus-based suppression is unreliable (multi-monitor, side-by-side windows, user stepped away) and risks silently dropping notifications.
- What happens when the user logs out? The current device's push subscription is removed from both the browser and server. Subscriptions on other devices are unaffected.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow authenticated users to subscribe to push notifications from the notification settings page.
- **FR-002**: System MUST request browser notification permission only when the user explicitly opts in (never on page load or login).
- **FR-003**: System MUST register the push subscription with the server after successful browser permission grant.
- **FR-004**: System MUST display push notifications with a title, body, and the application icon when a platform event is received, regardless of whether the app is in the foreground, backgrounded, or closed. Each notification MUST use a unique tag to prevent the browser from silently replacing earlier notifications of the same event type.
- **FR-005**: System MUST navigate to the relevant content page when a user clicks on a push notification.
- **FR-006**: System MUST provide per-category push notification toggles alongside existing email and in-app toggles in the notification settings.
- **FR-007**: System MUST disable per-category push toggles when the master push toggle is off.
- **FR-008**: System MUST allow users to unsubscribe from push notifications with a single action, removing the subscription from both the browser and the server.
- **FR-009**: System MUST display a list of the user's active push subscriptions (devices) with the ability to remove individual subscriptions.
- **FR-010**: System MUST silently validate and refresh expired or rotated push subscriptions on app load when permission was previously granted.
- **FR-011**: System MUST hide all push-related UI when the browser does not support the Push API or service workers. Support is determined by feature detection (`PushManager` and `serviceWorker` in `navigator`), not by browser version.
- **FR-012**: System MUST hide all push-related UI when the server indicates push is disabled (no VAPID key).
- **FR-013**: System MUST show guidance for re-enabling notifications via browser settings when the user has previously denied notification permission.
- **FR-014**: System MUST roll back the browser push subscription if the server registration call fails.
- **FR-015**: System MUST support push subscriptions across multiple devices/browsers for the same user.
- **FR-016**: System MUST provide all push-related user-facing text as translatable strings.
- **FR-017**: System MUST remove the current device's push subscription (both browser and server) when the user logs out.

### Key Entities

- **Push Subscription**: Represents a user's browser push registration on a specific device. Key attributes: unique identifier, creation date, status (active/expired), device label (auto-detected from User-Agent as browser name + OS, e.g., "Chrome on macOS"), last active date. Belongs to a single user; a user can have multiple subscriptions.
- **Notification Category**: Represents a type of platform event that can trigger notifications. Each category has channel preferences (email, in-app, push) that the user can independently control. Categories include space member notifications (callout published, comments, contributions, calendar events, poll vote/modification events), space admin notifications, user notifications (mentions, replies, messages, membership), organization notifications, platform/forum notifications, platform admin notifications, and virtual contributor notifications.
- **VAPID Configuration**: Server-provided public key retrieved via a dedicated GraphQL query. When absent or query returns null, indicates push is disabled platform-wide. The client must discover and use existing server GraphQL operations for VAPID key retrieval, subscription creation, subscription removal, and subscription listing.

## Clarifications

### Session 2026-03-16

- Q: How does the client obtain the VAPID public key and interact with the server for push subscription management? → A: Discover and use existing server GraphQL operations (queries for VAPID key, mutations for subscribe/unsubscribe).
- Q: Should push notifications display when the app is in the foreground? → A: Yes. Push notifications always display regardless of foreground state. Focus-based suppression was removed because `client.focused` is unreliable (fails on multi-monitor setups, side-by-side windows, and when the user steps away from a focused tab). A redundant notification (seeing both in-app + push) is preferable to a missed notification.
- Q: How should the service worker handle push events? → A: Extend the existing service worker file with push event handlers (single SW file).
- Q: What is the acceptable bundle size impact? → A: No strict limit; acceptable if under 20 KB gzipped added to main bundle.
- Q: How should devices be identified/labeled in the subscription management UI? → A: Auto-detect from User-Agent: show browser name + OS (e.g., "Chrome on macOS").
- Q: What should happen to push subscriptions when a user logs out? → A: Remove the subscription for the current device on logout.
- Q: Should there be a discovery mechanism (banner/prompt) to encourage push adoption? → A: No. Settings page is the only entry point — no proactive prompts or banners.
- Q: What minimum browser versions should be considered "supported" for push? → A: Feature-detect only (no version floor). If PushManager and serviceWorker exist, treat as supported.

## Assumptions

- The server-side push infrastructure (GraphQL API, message delivery pipeline, VAPID authentication, subscription storage, per-user throttling, retry with backoff) is fully implemented and deployed.
- The application already has a registered service worker for version checking. Push event handlers (`push`, `notificationclick`) will be added directly to this existing service worker file — no separate module or secondary SW registration.
- The existing notification settings UI uses a dual-toggle pattern (email/in-app) that will be extended to a triple-toggle (email/in-app/push).
- No new third-party dependencies are required — the implementation uses native browser Push API and Service Worker API. Acceptable main bundle size impact is under 20 KB gzipped.
- Push notification payloads contain only non-sensitive information (title, body, relative URL).
- The PWA manifest already exists and can be extended with the required `gcm_sender_id` for Chrome compatibility.
- Push notification discovery is limited to the notification settings page. No onboarding banners, contextual prompts, or post-login nudges are in scope.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: At least 20% of active users subscribe to push notifications within 30 days of feature launch.
- **SC-002**: Users can complete the push notification opt-in flow (from settings to first notification received) in under 30 seconds.
- **SC-003**: 95% of push notifications are delivered to the user's device within 5 seconds of the platform event occurring.
- **SC-004**: Users can enable, configure per-category preferences, and disable push notifications entirely within the same settings page without navigating elsewhere.
- **SC-005**: Zero push-related errors or UI elements are visible to users on unsupported browsers or when push is server-disabled.
- **SC-006**: Users on multiple devices can independently manage push subscriptions per device without affecting other devices.
- **SC-007**: Returning users with previously granted permission experience zero disruption — expired subscriptions are silently refreshed without requiring manual re-enrollment.
