# Notification Preferences Contract

**Branch**: `018-community-polls` | **Date**: 2026-03-03

## New Notification Preference Fields

Four new fields are added to the space notification settings, following the existing pattern in `IUserSettingsNotificationSpaceBase`.

### Server-Side Fields

| Preference Field                              | Server Event                                              | Recipient                                  | Trigger                                                                                                 |
| --------------------------------------------- | --------------------------------------------------------- | ------------------------------------------ | ------------------------------------------------------------------------------------------------------- |
| `collaborationPollVoteCastOnOwnPoll`          | `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_OWN_POLL`          | Callout creator (excluding voter)          | `castPollVote`                                                                                          |
| `collaborationPollVoteCastOnPollIVotedOn`     | `SPACE_COLLABORATION_POLL_VOTE_CAST_ON_POLL_I_VOTED_ON`   | All prior voters (excluding current voter) | `castPollVote`                                                                                          |
| `collaborationPollModifiedOnPollIVotedOn`     | `SPACE_COLLABORATION_POLL_MODIFIED_ON_POLL_I_VOTED_ON`    | Voters not affected by the change          | `addPollOption`, `reorderPollOptions`, `updatePollOption` (unaffected), `removePollOption` (unaffected) |
| `collaborationPollVoteAffectedByOptionChange` | `SPACE_COLLABORATION_POLL_VOTE_AFFECTED_BY_OPTION_CHANGE` | Voters whose vote was deleted              | `removePollOption`, `updatePollOption` (when votes deleted)                                             |

### Client Integration Points

#### GraphQL Fragment Extension

Add to `userSettingsFragment.graphql` inside the space notification settings:

```graphql
collaborationPollVoteCastOnOwnPoll {
  email
  inApp
}
collaborationPollVoteCastOnPollIVotedOn {
  email
  inApp
}
collaborationPollModifiedOnPollIVotedOn {
  email
  inApp
}
collaborationPollVoteAffectedByOptionChange {
  email
  inApp
}
```

#### Model Extension

Add to `SpaceNotificationSettings` in `NotificationSettings.model.ts`:

```typescript
collaborationPollVoteCastOnOwnPoll?: NotificationChannels;
collaborationPollVoteCastOnPollIVotedOn?: NotificationChannels;
collaborationPollModifiedOnPollIVotedOn?: NotificationChannels;
collaborationPollVoteAffectedByOptionChange?: NotificationChannels;
```

#### i18n Keys

Add to `pages.userNotificationsSettings.space.settings`:

| Key                                           | English Text                                  |
| --------------------------------------------- | --------------------------------------------- |
| `collaborationPollVoteCastOnOwnPoll`          | "Someone votes on a poll I created"           |
| `collaborationPollVoteCastOnPollIVotedOn`     | "Someone votes on a poll I also voted on"     |
| `collaborationPollModifiedOnPollIVotedOn`     | "A poll I voted on is modified"               |
| `collaborationPollVoteAffectedByOptionChange` | "My vote is affected by a poll option change" |

#### Component Integration

Add 4 new entries to the `options` object in `CombinedSpaceNotificationsSettings.tsx`, following the existing pattern with `DualSwitchSettingsGroup`.
