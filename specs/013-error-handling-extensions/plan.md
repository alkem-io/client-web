# Implementation Plan: Enhanced Error Handling with Server Error Extensions

**Branch**: `013-error-handling-extensions` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/013-error-handling-extensions/spec.md`

## Summary

Enhance the existing error handling system to leverage new server error extensions (`numericCode` and `userMessage`). Changes include: using `userMessage` as i18n translation keys for localized error messages, extending notification display time to 15 seconds, adding a "Contact Support" mailto link with pre-filled error code to notifications, and propagating these enhancements to the error boundary page.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: Apollo Client, MUI, XState, react-i18next
**Storage**: N/A (stateless error display)
**Testing**: Vitest with jsdom
**Target Platform**: Web (modern browsers)
**Project Type**: Web SPA (frontend only)
**Performance Goals**: No perceptible latency impact on error display
**Constraints**: Must not break existing error handling; backward compatible with errors lacking new extensions
**Scale/Scope**: All GraphQL errors and error boundary scenarios

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

| Principle                             | Status  | Notes                                                                                                          |
| ------------------------------------- | ------- | -------------------------------------------------------------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries  | ✅ PASS | Error handling logic stays in `src/core/apollo` and `src/core/ui/notifications`; no domain boundary violations |
| II. React 19 Concurrent UX Discipline | ✅ PASS | No rendering changes; notification system already concurrency-safe via XState                                  |
| III. GraphQL Contract Fidelity        | ✅ PASS | Using existing `error.extensions` structure; no schema changes needed                                          |
| IV. State & Side-Effect Isolation     | ✅ PASS | Notification state isolated in XState machine; no new side effects                                             |
| V. Experience Quality & Safeguards    | ✅ PASS | Accessibility maintained (links keyboard-accessible); i18n used for all strings                                |
| Architecture 3 (i18n)                 | ✅ PASS | All new strings added to `translation.en.json`; no hardcoded copy                                              |
| Architecture 5 (Import transparency)  | ✅ PASS | No barrel exports; explicit file paths used                                                                    |
| Engineering 5 (Root Cause)            | ✅ PASS | Clear requirements; no workarounds needed                                                                      |

**All gates pass. Proceeding to Phase 0.**

## Project Structure

### Documentation (this feature)

```text
specs/013-error-handling-extensions/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── core/
│   ├── apollo/
│   │   └── hooks/
│   │       └── useApolloErrorHandler.ts    # MODIFY: Extract numericCode/userMessage, use for translation
│   ├── i18n/
│   │   └── en/
│   │       └── translation.en.json         # MODIFY: Add error translations + support mailto strings
│   ├── pages/
│   │   └── Errors/
│   │       └── ErrorPage.tsx               # MODIFY: Add numericCode display and enhanced mailto
│   ├── state/
│   │   └── global/
│   │       └── notifications/
│   │           └── notificationMachine.ts  # MODIFY: Extend Notification type with numericCode
│   └── ui/
│       └── notifications/
│           ├── constants.ts                # MODIFY: Change auto-hide to 15000ms
│           ├── NotificationHandler.tsx     # MODIFY: Add support link component
│           └── ErrorNotificationContent.tsx # CREATE: New component for error notification with support link
└── main/
    └── constants/
        └── errors.ts                       # MODIFY: Add new error codes enum values (optional)
```

**Structure Decision**: Single frontend project following existing `src/core` organization. Error handling enhancements stay within `src/core/apollo`, `src/core/ui/notifications`, and `src/core/pages/Errors`.

## Complexity Tracking

> No Constitution Check violations requiring justification.

| Aspect       | Assessment                                                                     |
| ------------ | ------------------------------------------------------------------------------ |
| Scope        | Small - ~6 files modified, 1 new component                                     |
| Risk         | Low - Backward compatible; existing behavior preserved when extensions missing |
| Dependencies | None - Server already provides new extensions                                  |

## Implementation Approach

### Phase 1: Core Infrastructure Changes

1. **Update notification auto-hide duration** (`constants.ts`)
   - Change `NOTIFICATION_AUTO_HIDE_DURATION` from 6000 to 15000

2. **Extend notification data model** (`notificationMachine.ts`)
   - Add optional `numericCode?: number` to `Notification` type
   - Update `PUSH_NOTIFICATION` payload to include `numericCode`

3. **Add i18n translation keys** (`translation.en.json`)
   - Add all error message translations under `apollo.errors.userMessages.*`
   - Add support mailto strings: subject template, body template

### Phase 2: Error Handler Enhancement

4. **Update error handler** (`useApolloErrorHandler.ts`)
   - Extract `numericCode` from `error.extensions.numericCode`
   - Extract `userMessage` from `error.extensions.userMessage`
   - Use `userMessage` as i18n key (with fallback to existing logic)
   - Pass `numericCode` to notification

### Phase 3: UI Components

5. **Create error notification content component** (`ErrorNotificationContent.tsx`)
   - Display error message
   - Render "Contact Support" text link below message
   - Generate mailto URL with pre-filled subject and body

6. **Update notification handler** (`NotificationHandler.tsx`)
   - Use new `ErrorNotificationContent` for error-severity notifications
   - Pass `numericCode` to support link generation

### Phase 4: Error Boundary Enhancement

7. **Update ErrorPage** (`ErrorPage.tsx`)
   - Accept optional `numericCode` prop
   - Include error code in display when available
   - Enhance mailto link with numericCode in subject/body

### Key Design Decisions

1. **userMessage as i18n key**: The server sends translation keys (e.g., `errors.notFound.entity`), client looks them up via i18n. Fallback to existing `code`-based translation if key missing.

2. **Notification data flow**: `numericCode` flows through XState machine context so it's available when rendering the notification component.

3. **Mailto URL generation**: Centralized helper function generates properly encoded mailto URLs with subject and body.

4. **Backward compatibility**: All new fields are optional. Existing errors without extensions continue to work unchanged.

## Translation Keys Structure

Based on the server's error mapping, translations will be organized as:

```json
{
  "apollo": {
    "errors": {
      "userMessages": {
        "notFound": {
          "entity": "Couldn't find what you were looking for.",
          "resource": "Resource not found.",
          "account": "Account not found.",
          ...
        },
        "authorization": {
          "unauthenticated": "You might not be logged in.",
          "unauthorized": "Access denied.",
          ...
        },
        "validation": { ... },
        "operations": { ... },
        "system": { ... }
      },
      "support": {
        "linkText": "Contact Support",
        "emailSubject": "Support Request - Error {{code}}",
        "emailSubjectGeneric": "Support Request",
        "emailBody": "Hello,\n\nI encountered an error while using Alkemio.\n\nError Code: {{code}}\n\nPlease help me resolve this issue.\n\nThank you."
      }
    }
  }
}
```

## Files Changed Summary

| File                                                         | Change Type | Description                                    |
| ------------------------------------------------------------ | ----------- | ---------------------------------------------- |
| `src/core/ui/notifications/constants.ts`                     | Modify      | Update auto-hide duration to 15000ms           |
| `src/core/state/global/notifications/notificationMachine.ts` | Modify      | Add `numericCode` to notification type         |
| `src/core/apollo/hooks/useApolloErrorHandler.ts`             | Modify      | Extract and use new error extensions           |
| `src/core/ui/notifications/ErrorNotificationContent.tsx`     | Create      | New component with message + support link      |
| `src/core/ui/notifications/NotificationHandler.tsx`          | Modify      | Use new component for error notifications      |
| `src/core/pages/Errors/ErrorPage.tsx`                        | Modify      | Add error code display and enhanced mailto     |
| `src/core/i18n/en/translation.en.json`                       | Modify      | Add all error translations and support strings |

## Testing Strategy

1. **Unit tests** for:
   - Mailto URL generation helper
   - `userMessage` translation lookup with fallback
   - Notification machine with `numericCode`

2. **Integration verification**:
   - Trigger errors with various `numericCode`/`userMessage` combinations
   - Verify 15-second display duration
   - Test mailto link opens with correct pre-filled content
   - Verify fallback behavior when extensions missing

## Post-Design Constitution Re-Check

| Principle                            | Status  | Notes                                                    |
| ------------------------------------ | ------- | -------------------------------------------------------- |
| I. Domain-Driven Frontend Boundaries | ✅ PASS | All changes in `src/core`; no domain layer modifications |
| II. React 19 Concurrent UX           | ✅ PASS | No blocking operations; notification rendering unchanged |
| III. GraphQL Contract Fidelity       | ✅ PASS | Using existing extensions structure                      |
| IV. State & Side-Effect Isolation    | ✅ PASS | State changes isolated to notification machine           |
| V. Experience Quality                | ✅ PASS | Accessible link, i18n strings, clear UX                  |

**All gates pass post-design.**
