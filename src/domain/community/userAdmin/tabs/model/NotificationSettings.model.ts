// Notification channel settings
export interface NotificationChannels {
  email: boolean;
  inApp: boolean;
}

// Space notification settings
export interface SpaceNotificationSettings {
  communicationUpdates?: NotificationChannels;
  collaborationCalloutPublished?: NotificationChannels;
  collaborationCalloutPostContributionComment?: NotificationChannels;
  collaborationCalloutContributionCreated?: NotificationChannels;
  collaborationCalloutComment?: NotificationChannels;
}

// Space admin notification settings
export interface SpaceAdminNotificationSettings {
  communityApplicationReceived?: NotificationChannels;
  communityNewMember?: NotificationChannels;
  collaborationCalloutContributionCreated?: NotificationChannels;
  communicationMessageReceived?: NotificationChannels;
}

// User notification settings
export interface UserNotificationSettings {
  commentReply?: NotificationChannels;
  mentioned?: NotificationChannels;
  messageReceived?: NotificationChannels;
  copyOfMessageSent?: NotificationChannels;
  membership?: {
    spaceCommunityInvitationReceived?: NotificationChannels;
    spaceCommunityJoined?: NotificationChannels;
    spaceCommunityApplicationSubmitted?: NotificationChannels;
  };
}

// Organization notification settings
export interface OrganizationNotificationSettings {
  adminMentioned?: NotificationChannels;
  adminMessageReceived?: NotificationChannels;
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
  spaceCreated?: NotificationChannels;
}

// Complete notification settings
export interface NotificationSettings {
  space?: SpaceNotificationSettings;
  spaceAdmin?: SpaceAdminNotificationSettings;
  user?: UserNotificationSettings;
  organization?: OrganizationNotificationSettings;
  platform?: PlatformNotificationSettings;
  platformAdmin?: PlatformAdminNotificationSettings;
}
