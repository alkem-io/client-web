### In-App Notifications Documentation

##### Current Architecture

The in-app notifications system uses a modular approach with:

- **Base View Component**: `InAppNotificationBaseView.tsx` - Common notification layout and functionality
- **Specific View Components**: Individual components for each notification type
- **Model Interfaces**: TypeScript interfaces for type safety
- **GraphQL Integration**: Query, mutations, and fragments for data handling

##### Add New Notification Type

1. **Update GraphQL Schema** - Add the new notification type to `src\main\inAppNotifications\graphql\InAppNotifications.graphql`:
   - Add the new payload fragment (e.g., `InAppNotificationPayloadNewType`)
   - Include it in the main query's payload union

2. **Update Type Definitions**:
   - Update `InAppNotificationPayloadModel.tsx` with new payload fields
   - Ensure `InAppNotificationModel.tsx` includes the new notification type

3. **Add Translations** - Add entries in `translation.en.json` under `inAppNotifications.type.YOUR_NEW_TYPE`:

   ```json
   "YOUR_NEW_TYPE": {
     "subject": "Subject with {{placeholders}}",
     "description": "Description with {{placeholders}}"
   }
   ```

4. **Create View Component** - Create new view in `src\main\inAppNotifications\views\`:
   - Import and use `InAppNotificationBaseView` for consistent layout
   - Extract relevant data from the notification payload
   - Create `notificationTextValues` object with placeholder values
   - Pass appropriate URL for navigation

5. **Register the Component** - Add case in `src\main\inAppNotifications\InAppNotificationItem.tsx`:
   ```typescript
   case NotificationEvent.YOUR_NEW_TYPE:
     return <YourNewNotificationView {...item} />;
   ```

##### Example Implementation

```typescript
// In your new view component
export const InAppYourNewNotificationView = (notification: InAppNotificationModel) => {
  const { payload } = notification;

  if (!payload.requiredField) {
    return null;
  }

  const notificationTextValues = {
    placeholderName: payload.someField?.displayName,
    anotherPlaceholder: payload.anotherField,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.navigationUrl}
    />
  );
};
```

##### Current Notification Types

- `SPACE_COLLABORATION_CALLOUT_PUBLISHED` - New post published in space
- `USER_MENTIONED` - User mentioned in comment
- `SPACE_ADMIN_COMMUNITY_NEW_MEMBER` - New member joined (admin view)
- `USER_SPACE_COMMUNITY_JOINED` - Welcome message for new members

##### Key Components

- **InAppNotificationBaseView**: Handles common UI, actions (mark as read/unread, delete), and translation rendering
- **InAppNotificationItem**: Router component that renders appropriate view based on notification type
- **useInAppNotifications**: Hook for notification state management and mutations

##### End-to-end Local Setup

1. Start the notifications service
2. In notifications/lib run `pnpm link`
3. In notifications/service run `pnpm link @alkemio/notifications-lib`
4. In the server root run `pnpm link @alkemio/notifications-lib`

##### Best Practices

- Always use `InAppNotificationBaseView` for consistent UI/UX
- Include proper null checks for required payload fields
- Use meaningful placeholder names in translations
- Test both subject and description rendering
- Ensure proper navigation URLs are provided
