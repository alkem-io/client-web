# Implementation Plan: Community Polls & Voting — Client UI

**Branch**: `018-community-polls` | **Date**: 2026-03-03 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/018-community-polls/spec.md`

## Summary

Add client-side support for community polls as a new callout framing type. Users can create polls (via the existing create callout flow), cast votes (single or multi-select), view results (with configurable visibility and detail levels), change votes, and manage poll options. Four new notification preferences are added. The implementation follows the established framing type pattern (Whiteboard/Memo/Link/MediaGallery) with a new `src/domain/collaboration/poll/` domain directory.

## Technical Context

**Language/Version**: TypeScript 5.x, React 19
**Primary Dependencies**: MUI (theming + components), Apollo Client (GraphQL), Formik (forms), react-i18next (i18n)
**Storage**: Apollo Client normalized cache (no local persistence)
**Testing**: Vitest with jsdom environment
**Target Platform**: Web (SPA served by Vite)
**Project Type**: Web application (React SPA)
**Performance Goals**: Poll renders in < 100ms; vote submission feels instant via Apollo Client `optimisticResponse` (immediate cache update before server confirms)
**Constraints**: Must follow existing callout framing type pattern; no new dependencies
**Scale/Scope**: Polls with up to 20 options and 500 voters (matches server design target)

## Constitution Check

_GATE: Must pass before Phase 0 research. Re-check after Phase 1 design._

### Pre-Research Check

| #   | Principle                         | Status | Notes                                                                                                                                                           |
| --- | --------------------------------- | ------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| I   | Domain-Driven Frontend Boundaries | PASS   | Poll domain code lives in `src/domain/collaboration/poll/`. Business logic (visibility, constraints) stays in domain hooks, not in components.                  |
| II  | React 19 Concurrent UX Discipline | PASS   | Vote submission uses `useTransition`. Rendering is pure and concurrency-safe. No legacy lifecycle patterns.                                                     |
| III | GraphQL Contract Fidelity         | PASS   | All data access via generated hooks from codegen. No raw `useQuery`. Poll fragment added to existing CalloutContent query. Cache updates via mutation response. |
| IV  | State & Side-Effect Isolation     | PASS   | Poll state lives in Apollo cache. No component-local side effects beyond React hooks.                                                                           |
| V   | Experience Quality & Safeguards   | PASS   | WCAG 2.1 AA for all poll controls (radio, checkbox, buttons). Keyboard navigation. ARIA labels.                                                                 |

### Architecture Standards

| #   | Standard                  | Status | Notes                                                                                                                                                                            |
| --- | ------------------------- | ------ | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Feature directory mapping | PASS   | `src/domain/collaboration/poll/` for domain logic, `CalloutFramings/CalloutFramingPoll.tsx` for framing display.                                                                 |
| 2   | MUI theming               | PASS   | All UI uses MUI components (RadioGroup, Checkbox, LinearProgress, Button, Typography).                                                                                           |
| 3   | Internationalization      | PASS   | All user-visible strings via `t()`. New keys in `translation.en.json`.                                                                                                           |
| 4   | Build determinism         | N/A    | No Vite config changes.                                                                                                                                                          |
| 5   | Import transparency       | PASS   | No barrel exports. All imports use explicit file paths.                                                                                                                          |
| 6   | SOLID & DRY               | PASS   | SRP: separate components for voting, results, option management, form. OCP: poll form settings configurable via props. DIP: components consume domain hooks, not direct queries. |

### Post-Design Re-Check

All checks remain PASS after Phase 1 design. No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/018-community-polls/
├── spec.md
├── plan.md                    # This file
├── research.md
├── data-model.md
├── quickstart.md
├── checklists/
│   └── requirements.md
└── contracts/
    ├── graphql-operations.graphql
    └── notification-preferences.md
```

### Source Code (repository root)

```text
src/domain/collaboration/
├── poll/                                    # NEW: Poll domain directory
│   ├── PollView.tsx                         # Main poll display (voting + results, read-only — no edit controls)
│   ├── PollVotingControls.tsx               # Radio/checkbox vote selection
│   ├── PollResultsDisplay.tsx               # Results with progress bars
│   ├── PollOptionResultRow.tsx              # Single option result row
│   ├── PollVoterAvatars.tsx                 # Voter avatar group (FULL detail)
│   ├── PollEmptyState.tsx                   # "No votes yet" empty state
│   ├── PollFormFields.tsx                   # Creation & edit form fields (title, options with drag-and-drop reorder, settings button)
│   ├── PollFormSettingsSection.tsx          # Advanced settings dialog (readonly when editing)
│   ├── models/
│   │   └── PollModels.ts                   # Client view model types
│   ├── hooks/
│   │   ├── usePollVote.ts                  # Vote submission hook (castPollVote)
│   │   └── usePollOptionManagement.ts      # Option CRUD hooks (used by edit dialog save)
│   └── graphql/
│       └── pollFragments.graphql           # PollDetails, PollOptionFields, PollVoteFields fragments
│
├── callout/
│   ├── CalloutFramings/
│   │   └── CalloutFramingPoll.tsx          # NEW: Framing component for POLL type
│   ├── CalloutForm/
│   │   └── CalloutFormFramingSettings.tsx  # MODIFY: Add POLL type to radio buttons + switch
│   ├── CalloutView/
│   │   └── CalloutView.tsx                 # MODIFY: Add POLL conditional rendering
│   ├── icons/
│   │   └── calloutIcons.ts                # MODIFY: Add poll icon mapping
│   ├── models/
│   │   ├── CalloutDetailsModel.ts         # MODIFY: Add poll to framing type
│   │   ├── CalloutFormModel.ts            # MODIFY: Add poll form values
│   │   └── mappings.ts                    # MODIFY: Add poll mapping
│   ├── CalloutRestrictionsTypes.ts        # MODIFY: Add disablePolls
│   └── graphql/
│       └── CalloutContent.graphql         # MODIFY: Add poll fragment to framing
│
└── calloutsSet/
    └── useCalloutCreation/
        ├── useCalloutCreation.ts          # MODIFY: Handle poll in creation input
        └── useCalloutCreationWithPreviewImages.ts  # MODIFY: Pass through poll data

src/domain/community/
└── userAdmin/
    ├── tabs/
    │   ├── UserAdminNotificationsPage.tsx                        # MODIFY: Add poll settings handler
    │   ├── model/
    │   │   └── NotificationSettings.model.ts                    # MODIFY: Add poll notification types
    │   └── components/
    │       └── CombinedSpaceNotificationsSettings.tsx            # MODIFY: Add poll preference toggles
    └── graphql/
        ├── userSettingsFragment.graphql                          # MODIFY: Add poll notification fields
        └── updateUserSettings.graphql                            # MODIFY: Add poll notification input

src/core/
├── apollo/generated/                       # REGENERATE: pnpm codegen
└── i18n/en/
    └── translation.en.json                 # MODIFY: Add poll i18n keys
```

**Structure Decision**: Poll domain code follows the peer-directory pattern established by `whiteboard/`, `memo/`, and `post/`. The framing display component lives in `CalloutFramings/` consistent with other framing types. No new top-level directories.

## Complexity Tracking

No constitution violations to justify. All design decisions follow established patterns.
