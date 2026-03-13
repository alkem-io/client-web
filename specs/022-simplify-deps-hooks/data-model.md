# Data Model: Simplify Codebase

**Date**: 2026-03-13
**Branch**: `022-simplify-deps-hooks`

This is a refactoring initiative — no new entities are introduced. The only data model change is the notification state shape moving from XState to useReducer.

## Notification State (Modified)

### Before (XState Machine Context)

```
NotificationMachine
├── context.notifications: Notification[]
├── event PUSH: { message, severity?, numericCode? } → append to list
└── event CLEAR: { id } → remove from list
```

### After (useReducer)

```
NotificationState
├── notifications: Notification[]
├── action PUSH: { message, severity?, numericCode? } → append to list
└── action CLEAR: { id } → remove from list
```

### Notification Entity (Unchanged)

| Field | Type | Description |
|-------|------|-------------|
| id | string (UUID) | Unique identifier, generated on PUSH |
| message | string | Display text |
| severity | 'success' \| 'error' \| 'info' \| 'warning' | Visual variant |
| numericCode | number? | Optional HTTP status code for error notifications |

## Hook Interfaces (New, replacing Container render-prop signatures)

Each render-prop Container's `Provided` type becomes the return type of a hook. No structural changes to the data shapes — only the delivery mechanism changes (render-prop → hook return).

| Container | Hook | Return Type |
|-----------|------|-------------|
| ApplicationButtonContainer | useApplicationButton() | `ApplicationButtonProps & { shouldShow }` |
| CalloutSettingsContainer | useCalloutSettings() | `{ menuAnchor, menuOpen, activeDialog, openMenu, closeMenu, openDialog, closeDialog }` |
| CommunityGuidelinesContainer | useCommunityGuidelines() | `CommunityGuidelinesContainerProvided` |
| WhiteboardActionsContainer | useWhiteboardActions() | `WhiteboardChildProps` |
| CalloutsInViewWrapper | useCalloutDetails() | `CalloutDetailsContainerProvided` |
| InvitationActionsContainer | useInvitationActions() | `InvitationActionsContainerProvided` |
| CalendarEventsContainer | useCalendarEvents() | `CalendarEventsContainerProvided` (events list, loading, refetch) |
| CalendarEventDetailContainer | useCalendarEventDetail() | `CalendarEventDetailContainerProvided` (event detail, loading) |
| CommunityUpdatesContainer | useCommunityUpdates() | `CommunityUpdatesContainerProvided` (updates list, loading, postUpdate) |
| AssociatedOrganizationContainer | useAssociatedOrganization() | `AssociatedOrganizationContainerProvided` (organization data, loading) |
