// Notification setting item structure
export interface NotificationSetting {
  email: boolean;
  // inApp: boolean;
}

export interface SpaceNotificationSettings {
  communicationUpdates: NotificationSetting;
  collaborationCalloutPublished: NotificationSetting;
  collaborationCalloutPostContributionComment: NotificationSetting;
  collaborationCalloutContributionCreated: NotificationSetting;
  collaborationCalloutComment: NotificationSetting;
}

export interface SpaceAdminNotificationSettings {
  communityApplicationReceived: NotificationSetting;
  communityNewMember: NotificationSetting;
  collaborationCalloutContributionCreated: NotificationSetting;
  communicationMessageReceived: NotificationSetting;
}

export interface UserMembershipNotificationSettings {
  spaceCommunityInvitationReceived: NotificationSetting;
  spaceCommunityJoined: NotificationSetting;
  spaceCommunityApplicationSubmitted: NotificationSetting;
}

export interface UserNotificationSettings {
  commentReply: NotificationSetting;
  mentioned: NotificationSetting;
  messageReceived: NotificationSetting;
  copyOfMessageSent: NotificationSetting;
  membership: UserMembershipNotificationSettings;
}

export interface OrganizationNotificationSettings {
  adminMentioned: NotificationSetting;
  adminMessageReceived: NotificationSetting;
}

export interface PlatformNotificationSettings {
  forumDiscussionComment: NotificationSetting;
  forumDiscussionCreated: NotificationSetting;
}

export interface PlatformAdminNotificationSettings {
  userProfileCreated: NotificationSetting;
  userProfileRemoved: NotificationSetting;
  userGlobalRoleChanged: NotificationSetting;
  spaceCreated: NotificationSetting;
}

// Full notification settings structure
export interface NotificationSettings {
  space?: SpaceNotificationSettings;
  spaceAdmin?: SpaceAdminNotificationSettings;
  user?: UserNotificationSettings;
  organization?: OrganizationNotificationSettings;
  platform?: PlatformNotificationSettings;
  platformAdmin?: PlatformAdminNotificationSettings;
}
