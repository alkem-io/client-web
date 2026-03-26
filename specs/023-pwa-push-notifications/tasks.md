# Tasks: PWA Push Notifications

**Input**: Design documents from `/specs/023-pwa-push-notifications/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: Not requested — test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — GraphQL documents, codegen, i18n keys, manifest update

- [x] T001 [P] Create GraphQL query document for VAPID public key in `src/main/pushNotifications/graphql/vapidPublicKey.graphql`
- [x] T002 [P] Create GraphQL query document for user's push subscriptions in `src/main/pushNotifications/graphql/myPushSubscriptions.graphql`
- [x] T003 [P] Create GraphQL mutation document for subscribing to push in `src/main/pushNotifications/graphql/subscribeToPushNotifications.graphql`
- [x] T004 [P] Create GraphQL mutation document for unsubscribing from push in `src/main/pushNotifications/graphql/unsubscribeFromPushNotifications.graphql`
- [x] T005 Run `pnpm codegen` to generate typed Apollo hooks and types for push notification operations
- [x] T006 [P] Add `"gcm_sender_id": "103953800507"` to `public/manifest.json` for Chrome push compatibility (universal FCM sender ID for web push)
- [x] T007 [P] Add push notification i18n keys to `src/core/i18n/en/translation.en.json` — master toggle label, per-category push column header, device management section title/labels, permission denied guidance, error messages, device removal confirmation

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core push infrastructure that ALL user stories depend on — service worker push handlers, push subscription hook, context provider

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T008 Extend `public/service-worker.js` with `push` event listener — parse JSON payload (`{ title, body, url, eventType, timestamp }`), check if any client window is focused via `self.clients.matchAll()`, skip `showNotification()` if foreground, otherwise call `self.registration.showNotification()` with title, body, icon (`/android-chrome-192x192.png`), badge, data (`{ url }`), and tag (`eventType`)
- [x] T009 Add `notificationclick` event listener to `public/service-worker.js` — close notification, use `clients.matchAll()` to find existing window, focus and navigate via `postMessage({ type: 'PUSH_NOTIFICATION_CLICK', url })`, or `clients.openWindow(url)` if no existing window
- [x] T010 Add `pushsubscriptionchange` event listener to `public/service-worker.js` — re-subscribe with new keys from `event.newSubscription` or `event.oldSubscription`, store VAPID key in IndexedDB for SW access
- [x] T011 Create `urlBase64ToUint8Array` utility function in `src/main/pushNotifications/urlBase64ToUint8Array.ts` — converts Base64URL-encoded VAPID key to `Uint8Array` for `PushManager.subscribe({ applicationServerKey })`
- [x] T012 Create `usePushNotifications` hook in `src/main/pushNotifications/usePushNotifications.ts` — feature detection (`'PushManager' in window && 'serviceWorker' in navigator`), VAPID key query via generated `useVapidPublicKeyQuery`, permission state tracking (`Notification.permission`), `subscribe()` method (request permission → `PushManager.subscribe()` → call `useSubscribeToPushNotificationsMutation` → store subscription ID in `sessionStorage`), `unsubscribe()` method (call `useUnsubscribeFromPushNotificationsMutation` → `pushSubscription.unsubscribe()` → clear `sessionStorage`), rollback browser subscription on server error (FR-014), loading state; store subscription ID in `sessionStorage` under key `alkemio_push_subscription_id`
- [x] T013 Create `PushNotificationProvider` in `src/main/pushNotifications/PushNotificationProvider.tsx` — React context providing `isSupported`, `isServerEnabled`, `permissionState`, `isSubscribed`, `currentSubscriptionId`, `subscribe`, `unsubscribe`, `loading`; wraps `usePushNotifications` hook; only active for authenticated users
- [x] T014 Wire `PushNotificationProvider` into `src/root.tsx` — add after `InAppNotificationsProvider` (around line 135), inside `UserProvider` scope so authenticated user is available

**Checkpoint**: Push infrastructure ready — service worker handles push events, hook manages subscriptions, provider exposes state to the component tree

---

## Phase 3: User Story 1 — Enable Push Notifications from Settings (Priority: P1) 🎯 MVP

**Goal**: Authenticated users can enable push notifications via a master toggle in Settings → Notifications, receive browser push notifications for platform events, and click notifications to navigate to relevant content.

**Independent Test**: Log in → Settings → Notifications → toggle push master switch → grant browser permission → trigger a platform event → verify push notification appears → click notification → verify navigation to content page.

### Implementation for User Story 1

- [x] T015 [US1] Add `push` field to `NotificationChannels` type in `src/domain/community/userAdmin/tabs/model/NotificationSettings.model.ts` — extend all notification settings interfaces (`SpaceNotificationSettings`, `UserNotificationSettings`, etc.) to include `push: boolean` alongside existing `email` and `inApp`
- [x] T016 [US1] Add `push` field to the `userSettingsFragment` in `src/domain/community/userAdmin/graphql/userSettingsFragment.graphql` — add `push` alongside every `email`/`inApp` pair in the notification section, then run `pnpm codegen`
- [x] T017 [US1] Add `pushChecked` to `NotificationOption` type in `src/core/ui/forms/SettingsGroups/types/NotificationTypes.ts` — add `pushChecked: boolean` field, add `push: SwitchState` to `NotificationSwitchStates`, add `ChannelType = 'inApp' | 'email' | 'push'`
- [x] T018 [US1] Extend `NotificationValidationService` in `src/core/ui/forms/SettingsGroups/services/NotificationValidationService.ts` — update `calculateSwitchStates` and `calculateSwitchState` to handle push channel, extend `REQUIRE_AT_LEAST_ONE` validation to consider three channels, add logic to disable push switches when master push toggle is off or push is unavailable
- [x] T019 [US1] Create `TripleSwitchSettingsGroup` component in `src/core/ui/forms/SettingsGroups/TripleSwitchSettingsGroup.tsx` — extends `DualSwitchSettingsGroup` pattern with a third "Push" column header, conditionally rendered based on `isPushAvailable` prop; uses `NotificationValidationService` for three-channel validation; `onChange` callback includes `ChannelType` parameter
- [x] T020 [US1] Integrate push master toggle into `UserAdminNotificationsPage` in `src/domain/community/userAdmin/tabs/UserAdminNotificationsPage.tsx` — import `usePushNotifications` context, add master push toggle at top of page (above category settings), toggle calls `subscribe()`/`unsubscribe()` from context, show loading state during subscription, show permission denied guidance when `Notification.permission === 'denied'`
- [x] T021 [US1] Update `handleUpdateSettings` in `UserAdminNotificationsPage.tsx` to handle `push` channel type — extend the mutation payload builder to include `push` field for each notification setting when the type is `'push'`
- [x] T022 [US1] Switch notification category groups to `TripleSwitchSettingsGroup` — update all 5 notification settings components in `src/domain/community/userAdmin/tabs/components/`: (1) `CombinedUserNotificationsSettings.tsx`, (2) `CombinedPlatformNotificationsSettings.tsx`, (3) `CombinedSpaceNotificationsSettings.tsx`, (4) `OrganizationNotificationsSettings.tsx`, (5) `VCNotificationsSettings.tsx` — to use `TripleSwitchSettingsGroup` instead of `DualSwitchSettingsGroup`, passing `isPushEnabled` and `isPushAvailable` props, and including `pushChecked` in each notification option

**Checkpoint**: User Story 1 complete — users can enable push via master toggle, receive push notifications, and click to navigate. Per-category push toggles visible alongside email/inApp.

---

## Phase 4: User Story 2 — Manage Push Preferences per Notification Category (Priority: P1)

**Goal**: Users with push enabled can control which notification categories send push notifications, with per-category toggles disabled when master push is off.

**Independent Test**: Enable push → toggle individual category push switches on/off → verify only enabled categories trigger push notifications.

### Implementation for User Story 2

- [x] T023 [US2] Ensure per-category push toggles are disabled when master push toggle is off — in `TripleSwitchSettingsGroup` (already created in T019), verify push column switches are disabled/greyed out when `isPushEnabled` is `false`; update `NotificationValidationService` to return `disabled: true` for push switches when master push is off
- [x] T024 [US2] Verify per-category push preference persistence — in `UserAdminNotificationsPage.tsx`, confirm that toggling a per-category push switch calls `updateUserSettings` mutation with the correct `push` field for that specific category, preserving other channel values

**Checkpoint**: User Story 2 complete — per-category push controls work independently; disabled when master push is off.

---

## Phase 5: User Story 3 — Unsubscribe from Push Notifications (Priority: P1)

**Goal**: Users can disable push notifications with a single action (master toggle off), removing the subscription from both browser and server.

**Independent Test**: Have push enabled → toggle master push off → verify subscription removed → verify no further push notifications received.

### Implementation for User Story 3

- [x] T025 [US3] Implement master push toggle-off flow — in `UserAdminNotificationsPage.tsx`, when master toggle is switched off, call `unsubscribe()` from `usePushNotifications` context (which removes browser + server subscription), reset all per-category push toggles to disabled, update UI to reflect unsubscribed state
- [x] T026 [US3] Add logout push cleanup to `src/core/auth/authentication/pages/LogoutPage.tsx` — before `window.location.replace(logoutUrl)`, get current SW registration, get current push subscription via `getSubscription()`, if subscription exists call `unsubscribeFromPushNotifications` mutation using subscription ID from `sessionStorage` (`alkemio_push_subscription_id`), then call `pushSubscription.unsubscribe()` on browser side; use fire-and-forget pattern (don't block logout on failure)

**Checkpoint**: User Story 3 complete — users can fully unsubscribe; logout cleans up push subscriptions.

---

## Phase 6: User Story 4 — Manage Active Push Subscriptions / Devices (Priority: P2)

**Goal**: Users subscribed on multiple devices can view and manage their active push subscriptions, removing devices they no longer use.

**Independent Test**: Subscribe on two browsers → view device list in Settings → remove one subscription → verify notifications stop on that device.

### Implementation for User Story 4

- [x] T027 [US4] Create `PushSubscriptionsList` component in `src/domain/community/userAdmin/tabs/components/PushSubscriptionsList.tsx` — query `useMyPushSubscriptionsQuery` to fetch active subscriptions, display list with device label (parsed from `userAgent` field — browser name + OS), creation date (formatted), and a "Remove" button per subscription; highlight current device; call `useUnsubscribeFromPushNotificationsMutation` on remove, update Apollo cache to remove deleted item; show empty state when no subscriptions
- [x] T028 [US4] Integrate `PushSubscriptionsList` into notification settings page — in `UserAdminNotificationsPage.tsx`, render `PushSubscriptionsList` below the master push toggle when push is available (independent of current browser's subscription state, so users can manage other devices); conditionally hide only when push is not available

**Checkpoint**: User Story 4 complete — users see all their subscribed devices and can remove individual ones.

---

## Phase 7: User Story 5 — Silent Subscription Refresh on Return (Priority: P2)

**Goal**: Returning users with previously granted push permission have their subscriptions automatically validated and refreshed without manual intervention.

**Independent Test**: Simulate subscription expiry → load app → verify subscription is silently re-registered without user action.

### Implementation for User Story 5

- [x] T029 [US5] Add silent refresh logic to `PushNotificationProvider` in `src/main/pushNotifications/PushNotificationProvider.tsx` — on mount, if `Notification.permission === 'granted'` and `isSupported` and `isServerEnabled`: get SW registration → `registration.pushManager.getSubscription()` → if no subscription, silently create new one and register with server via `subscribeToPushNotifications` mutation → if subscription exists, verify it matches a server subscription (compare against `myPushSubscriptions` query) → if not found on server, re-register; store new subscription ID in `sessionStorage`
- [x] T030 [US5] Handle `postMessage` from service worker — in `PushNotificationProvider.tsx`, add `navigator.serviceWorker.addEventListener('message', ...)` listener handling both `PUSH_SUBSCRIPTION_CHANGED` messages (triggering a re-subscribe flow with new subscription details) and `PUSH_NOTIFICATION_CLICK` messages (using React Router's `navigate()` to route to the received `url`)

**Checkpoint**: User Story 5 complete — expired or rotated subscriptions are silently refreshed on app load and during SW lifetime.

---

## Phase 8: User Story 6 — Graceful Degradation on Unsupported Browsers (Priority: P2)

**Goal**: Users on unsupported browsers (no Push API) or when the server has push disabled see no push-related UI.

**Independent Test**: Access app in a browser without Push API support → verify no push toggles visible. Access with server push disabled (no VAPID key) → verify no push UI.

### Implementation for User Story 6

- [x] T031 [US6] Conditionally hide push UI based on support — in `UserAdminNotificationsPage.tsx`, read `isSupported` and `isServerEnabled` from push context; when either is `false`, hide master push toggle, hide per-category push column (pass `isPushAvailable={false}` to `TripleSwitchSettingsGroup`), hide `PushSubscriptionsList`
- [x] T032 [US6] Show permission denied guidance — in `UserAdminNotificationsPage.tsx`, when `Notification.permission === 'denied'`, display an informational message (using i18n key) explaining how to re-enable notifications via browser settings; do not show the push toggle in this state
- [x] T033 [US6] Handle iOS Safari PWA requirement and incognito detection — in `usePushNotifications.ts`: (a) detect iOS Safari not in standalone mode by checking for iOS platform (via `navigator.userAgent` or `navigator.platform`) AND `navigator.standalone !== true`, set a `requiresPWAMode` flag; (b) detect incognito/private browsing by attempting `navigator.storage.estimate()` or checking `PushManager.subscribe()` failure patterns — if detected, set `isPrivateBrowsing` flag; in `UserAdminNotificationsPage.tsx`, when `requiresPWAMode` is `true`, show i18n guidance about adding to Home Screen; when `isPrivateBrowsing` is `true`, hide push UI (push subscriptions don't persist in private mode)

**Checkpoint**: User Story 6 complete — graceful degradation across all unsupported scenarios with clear user guidance.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Edge cases, accessibility, bundle verification

- [x] T034 [P] Verify `PUSH_NOTIFICATION_CLICK` navigation — confirm that the `postMessage` listener added in T030 (`PushNotificationProvider.tsx`) correctly navigates to the deep-link URL when a push notification is clicked
- [x] T035 [P] Ensure WCAG 2.1 AA compliance for all new push UI — verify keyboard navigation for master toggle, per-category push switches, and device removal buttons; add proper `aria-label` attributes; ensure focus management after subscription/unsubscription actions
- [x] T036 [P] Verify FR-014 rollback behavior — confirm that `subscribe()` in `usePushNotifications.ts` (implemented in T012) correctly rolls back the browser subscription on server mutation failure and displays an error message to the user
- [x] T037 Run `pnpm lint` and `pnpm vitest run` to verify no regressions
- [x] T038 Run `pnpm analyze` to verify bundle size impact is under 20 KB gzipped

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion (T005 codegen) — BLOCKS all user stories
- **User Stories (Phases 3–8)**: All depend on Foundational phase completion
  - US1 (Phase 3): No dependencies on other stories — **MVP**
  - US2 (Phase 4): Depends on US1 (uses `TripleSwitchSettingsGroup` and master toggle from US1)
  - US3 (Phase 5): Depends on US1 (requires `unsubscribe()` flow from hook established in US1)
  - US4 (Phase 6): Depends on US1 (requires push enabled state)
  - US5 (Phase 7): Independent of other stories after Foundational (uses provider directly)
  - US6 (Phase 8): Depends on US1 (hides UI elements created in US1)
- **Polish (Phase 9)**: Depends on all user stories being complete

### Within Each User Story

- Models/types before services
- Services before UI components
- GraphQL fragment updates before page integration
- Core implementation before integration

### Parallel Opportunities

- T001–T004: All GraphQL documents can be created in parallel
- T006–T007: Manifest and i18n updates can run in parallel with GraphQL docs
- T008–T010: Service worker handlers can be written in parallel (different event listeners)
- T011–T012: Utility function and hook can be started in parallel (hook depends on utility for VAPID conversion)
- T015–T017: Type/model updates across different files can run in parallel
- T027–T028: Device management component and integration are sequential
- T031–T033: Graceful degradation tasks touch different concerns and can partially parallelize
- T034–T036: Polish tasks operate on different files and can run in parallel
- US4 and US5 can be implemented in parallel (independent stories)

---

## Parallel Example: User Story 1

```bash
# Launch type/model updates in parallel (different files):
Task T015: "Add push to NotificationSettings.model.ts"
Task T017: "Add pushChecked to NotificationTypes.ts"

# After types are ready, launch in parallel:
Task T018: "Extend NotificationValidationService"
Task T019: "Create TripleSwitchSettingsGroup"

# After component ready, sequential integration:
Task T020: "Integrate master toggle into UserAdminNotificationsPage"
Task T021: "Update handleUpdateSettings for push channel"
Task T022: "Switch Combined* components to TripleSwitchSettingsGroup"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (GraphQL docs, codegen, i18n, manifest)
2. Complete Phase 2: Foundational (SW handlers, hook, provider, root.tsx wiring)
3. Complete Phase 3: User Story 1 (types, UI, integration)
4. **STOP and VALIDATE**: Test US1 independently — enable push, receive notification, click to navigate
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Infrastructure ready
2. Add US1 → Enable/receive push → Deploy (MVP!)
3. Add US2 → Per-category control → Deploy
4. Add US3 → Unsubscribe + logout cleanup → Deploy
5. Add US4 → Device management → Deploy
6. Add US5 → Silent refresh → Deploy
7. Add US6 → Graceful degradation → Deploy
8. Polish → Accessibility, edge cases, verification → Final deploy

### Parallel Team Strategy

With multiple developers after Foundational is complete:
- Developer A: US1 (master toggle + per-category integration)
- Developer B: US4 + US5 (device management + silent refresh — independent)
- Developer C: US6 (graceful degradation — independent after US1 UI exists)
- US2 and US3 follow US1 completion

---

## Post-Implementation: Rebase Integration (2026-03-23)

During rebase onto `develop`, the poll notifications feature (PR #9391) was merged. The following additional work was required:

- Added `push` field to 4 new poll notification types in GraphQL fragments (`userSettingsFragment.graphql`, `updateUserSettings.graphql`)
- Added `push` field to poll notification types in generated `apollo-hooks.ts` inline GQL documents
- Added `push` field to poll notification types in generated `graphql-schema.ts`
- Added `pushChecked` to poll notification options in `CombinedSpaceNotificationsSettings.tsx`
- Added poll fields to `buildSpaceSettings()`, `preserveChannel()` calls, and `applyOverrides()` in `UserAdminNotificationsPage.tsx`

The 4 poll notification types integrated:
- `collaborationPollVoteCastOnOwnPoll`
- `collaborationPollVoteCastOnPollIVotedOn`
- `collaborationPollModifiedOnPollIVotedOn`
- `collaborationPollVoteAffectedByOptionChange`

> **Note**: Push delivery for poll events depends on server-side handler implementation. The client correctly saves push preferences for poll categories, but the server may not yet dispatch push notifications for poll events.

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- No new npm dependencies — native Push API + Service Worker API only
- `pnpm codegen` requires backend with push feature (server Feature 038) running at `localhost:3000/graphql`
- Service worker is plain JS (not bundled) — changes to `public/service-worker.js` are immediate on reload
- All user-facing strings via `react-i18next` `t()` function — only edit `translation.en.json`
- The project uses Biome 2.4.6 for linting and formatting (not ESLint/Prettier)
