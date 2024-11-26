### In-App Notifications Documentation

##### Add new Notification

1. add the new type in the notifications query - `src\main\inAppNotifications\graphql\InAppNotifications.graphql`;
2. update the types in `InAppNotificationProps`;
3. Add translations in the `translation.en.json` under `inAppNotifications.type`;
4. Create new view in `src\main\inAppNotifications\views`;
5. Add a case for the new type in `src\main\inAppNotifications\InAppNotificationItem.tsx`;

##### End-to-end local setup

1. build the notifications service;
2. in notifications/lib run `npm link`
3. in notifications/service run `npm link @alkemio/notifications-lib`
4. in the server root run again `npm link @alkemio/notifications-lib`
