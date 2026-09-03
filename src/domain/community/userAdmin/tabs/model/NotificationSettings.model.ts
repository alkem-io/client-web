// The two independent sound preferences. Declared here rather than imported from
// the CRD view type: `src/domain` must not depend on `src/crd`. Structurally
// identical, so the two line up at the boundary without a cast.
export type SoundSettingKey = 'chatMessage' | 'inAppNotification';

// Notification channel settings
export interface NotificationChannels {
  email: boolean;
  inApp: boolean;
  push: boolean;
}

// Space notification settings
export interface SpaceNotificationSettings {
  communicationUpdates?: NotificationChannels;
  collaborationCalloutPublished?: NotificationChannels;
  collaborationCalloutReaction?: NotificationChannels;
  collaborationCalloutPostContributionComment?: NotificationChannels;
  collaborationCalloutContributionCreated?: NotificationChannels;
  collaborationCalloutComment?: NotificationChannels;
  communityCalendarEvents?: NotificationChannels;
  collaborationPollVoteCastOnOwnPoll?: NotificationChannels;
  collaborationPollVoteCastOnPollIVotedOn?: NotificationChannels;
  collaborationPollModifiedOnPollIVotedOn?: NotificationChannels;
  collaborationPollVoteAffectedByOptionChange?: NotificationChannels;
}

// Space admin notification settings
export interface SpaceAdminNotificationSettings {
  communityApplicationReceived?: NotificationChannels;
  communityNewMember?: NotificationChannels;
  collaborationCalloutContributionCreated?: NotificationChannels;
  communicationMessageReceived?: NotificationChannels;
  userEmailChanged?: NotificationChannels;
}

// User notification settings
export interface UserNotificationSettings {
  commentReply?: NotificationChannels;
  mentioned?: NotificationChannels;
  messageReceived?: NotificationChannels;
  // The inApp channel is permanently OFF for these two (enforced server-side,
  // contract C-5) — chat messages already surface live in the chat panel.
  conversationMessageDirect?: NotificationChannels;
  conversationMessageGroup?: NotificationChannels;
  membership?: {
    spaceCommunityInvitationReceived?: NotificationChannels;
    spaceCommunityJoined?: NotificationChannels;
  };
}

// Organization notification settings
export interface OrganizationNotificationSettings {
  adminMentioned?: NotificationChannels;
  adminMessageReceived?: NotificationChannels;
  adminSpaceCommunityInvitation?: NotificationChannels;
}

// Platform notification settings (Forum)
export interface PlatformNotificationSettings {
  forumDiscussionComment?: NotificationChannels;
  forumDiscussionCreated?: NotificationChannels;
}

// Platform admin notification settings
export interface PlatformAdminNotificationSettings {
  userProfileCreated?: NotificationChannels;
  userProfileRemoved?: NotificationChannels;
  userGlobalRoleChanged?: NotificationChannels;
  userEmailChanged?: NotificationChannels;
  spaceCreated?: NotificationChannels;
}

// Virtual Contributor notification settings
export interface VCNotificationSettings {
  adminSpaceCommunityInvitation?: NotificationChannels;
}

// Sound playback settings — a flat boolean pair, NOT a per-channel matrix.
export interface SoundNotificationSettings {
  chatMessage?: boolean;
  inAppNotification?: boolean;
}

// A single on/off switch row (e.g. a sound toggle), distinct from the
// 3-channel `NotificationRow` used by the per-event notification matrices.
export interface NotificationSwitchRow {
  /** Stable key used by the mutation builder (the sound key). Narrowed to the two
   * valid keys so an invalid one cannot reach the mutation payload. */
  property: SoundSettingKey;
  /** Pre-localized human label. */
  label: string;
  /** Resolved on/off state (server value + optimistic override applied). */
  enabled: boolean;
}

// A group of single-switch rows (the "Sounds" group).
export interface NotificationSwitchGroup {
  groupId: string;
  title: string;
  description: string;
  rows: NotificationSwitchRow[];
}

// Complete notification settings
export interface NotificationSettings {
  space?: SpaceNotificationSettings;
  spaceAdmin?: SpaceAdminNotificationSettings;
  user?: UserNotificationSettings;
  organization?: OrganizationNotificationSettings;
  platform?: PlatformNotificationSettings;
  platformAdmin?: PlatformAdminNotificationSettings;
  virtualContributor?: VCNotificationSettings;
  sound?: SoundNotificationSettings;
}
