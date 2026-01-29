# Quickstart: Enhanced Error Handling with Server Error Extensions

**Feature**: 013-error-handling-extensions
**Date**: 2026-01-28

## Overview

This feature enhances the existing error handling system to:

1. Display localized error messages using server-provided i18n keys
2. Show error notifications for 15 seconds (instead of 6)
3. Add "Contact Support" mailto link with pre-filled error code

## Prerequisites

- Alkemio backend running with updated error extensions
- Node.js 20.19+ and pnpm 10.17+

## Quick Setup

```bash
# Install dependencies
pnpm install

# Start development server
pnpm start
```

## Testing the Feature

### 1. Trigger an Error with New Extensions

The server now returns errors with `numericCode` and `userMessage` in extensions:

```json
{
  "errors": [
    {
      "message": "Entity not found",
      "extensions": {
        "code": "ENTITY_NOT_FOUND",
        "numericCode": 10101,
        "userMessage": "apollo.errors.userMessages.notFound.entity"
      }
    }
  ]
}
```

### 2. Verify Notification Behavior

- Error notification should display for **15 seconds**
- Message should be the translated text from `userMessage` key
- "Contact Support" link should appear below the message
- Clicking the link should open email with:
  - Subject: "Support Request - Error 10101"
  - Body: Pre-filled support request template

### 3. Verify Fallback Behavior

Test with errors missing new extensions:

- Without `userMessage`: Should fall back to existing `code`-based translation
- Without `numericCode`: Support link should still work with generic subject/body

## File Locations

| Component               | Location                                                     |
| ----------------------- | ------------------------------------------------------------ |
| Notification constant   | `src/core/ui/notifications/constants.ts`                     |
| Notification machine    | `src/core/state/global/notifications/notificationMachine.ts` |
| Error handler           | `src/core/apollo/hooks/useApolloErrorHandler.ts`             |
| Notification UI         | `src/core/ui/notifications/NotificationHandler.tsx`          |
| Error content component | `src/core/ui/notifications/ErrorNotificationContent.tsx`     |
| Error page              | `src/core/pages/Errors/ErrorPage.tsx`                        |
| Translations            | `src/core/i18n/en/translation.en.json`                       |

## Translation Keys Added

```
apollo.errors.userMessages.notFound.*
apollo.errors.userMessages.authorization.*
apollo.errors.userMessages.validation.*
apollo.errors.userMessages.operations.*
apollo.errors.userMessages.system.*
apollo.errors.support.linkText
apollo.errors.support.emailSubject
apollo.errors.support.emailSubjectGeneric
apollo.errors.support.emailBody
apollo.errors.support.emailBodyGeneric
```

## Common Issues

### Support link doesn't open email

- Check if default email client is configured
- Verify mailto URL encoding is correct

### Translation not showing

- Ensure the i18n key from server matches client translation
- Check for typos in key path
- Verify translation JSON is valid

### Notification closes too quickly

- Confirm `NOTIFICATION_AUTO_HIDE_DURATION` is set to 15000
- Check if something is calling `CLEAR_NOTIFICATION` prematurely
