import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';

export enum NotificationFilterType {
  All = 'ALL',
  MessagesAndReplies = 'MESSAGES_AND_REPLIES',
  Space = 'SPACE',
  Platform = 'PLATFORM',
}

// User notifications - messages, mentions, and replies
const USER_NOTIFICATION_TYPES: NotificationEvent[] = [
  NotificationEvent.UserCommentReply,
  NotificationEvent.UserMentioned,
  NotificationEvent.UserMessage,
  NotificationEvent.UserMessageSender,
  NotificationEvent.UserSignUpWelcome,
  NotificationEvent.UserSpaceCommunityInvitation,
  NotificationEvent.UserSpaceCommunityApplicationDeclined,
  NotificationEvent.UserSpaceCommunityJoined,
];

// Organization notifications - messages and mentions for organization admins
const ORGANIZATION_NOTIFICATION_TYPES: NotificationEvent[] = [
  NotificationEvent.OrganizationAdminMentioned,
  NotificationEvent.OrganizationAdminMessage,
  NotificationEvent.OrganizationMessageSender,
];

// Space notifications - both member and admin space-related notifications
const SPACE_NOTIFICATION_TYPES: NotificationEvent[] = [
  NotificationEvent.SpaceAdminCollaborationCalloutContribution,
  NotificationEvent.SpaceAdminCommunityApplication,
  NotificationEvent.SpaceAdminCommunityNewMember,
  NotificationEvent.SpaceAdminVirtualContributorCommunityInvitationDeclined,
  NotificationEvent.SpaceCollaborationCalloutComment,
  NotificationEvent.SpaceCollaborationCalloutContribution,
  NotificationEvent.SpaceCollaborationCalloutPostContributionComment,
  NotificationEvent.SpaceCollaborationCalloutPublished,
  NotificationEvent.SpaceCommunicationUpdate,
  NotificationEvent.SpaceCommunityInvitationUserPlatform,
  NotificationEvent.SpaceLeadCommunicationMessage,
  NotificationEvent.SpaceCommunityCalendarEventCreated,
  NotificationEvent.SpaceCommunityCalendarEventComment,
];

// Platform notifications - platform admin and forum notifications
const PLATFORM_NOTIFICATION_TYPES: NotificationEvent[] = [
  NotificationEvent.PlatformAdminGlobalRoleChanged,
  NotificationEvent.PlatformAdminSpaceCreated,
  NotificationEvent.PlatformAdminUserProfileCreated,
  NotificationEvent.PlatformAdminUserProfileRemoved,
  NotificationEvent.PlatformForumDiscussionComment,
  NotificationEvent.PlatformForumDiscussionCreated,
];

// Virtual Contributor notifications
const VIRTUAL_CONTRIBUTOR_NOTIFICATION_TYPES: NotificationEvent[] = [
  NotificationEvent.VirtualContributorAdminSpaceCommunityInvitation,
];

// Messages & Replies filter combines User and Organization notifications
const MESSAGES_AND_REPLIES_TYPES: NotificationEvent[] = [
  ...USER_NOTIFICATION_TYPES,
  ...ORGANIZATION_NOTIFICATION_TYPES,
];

// All notification types
const ALL_NOTIFICATION_TYPES: NotificationEvent[] = [
  ...USER_NOTIFICATION_TYPES,
  ...ORGANIZATION_NOTIFICATION_TYPES,
  ...SPACE_NOTIFICATION_TYPES,
  ...PLATFORM_NOTIFICATION_TYPES,
  ...VIRTUAL_CONTRIBUTOR_NOTIFICATION_TYPES,
];

export const getNotificationTypesForFilter = (filter: NotificationFilterType): NotificationEvent[] => {
  switch (filter) {
    case NotificationFilterType.All:
      return ALL_NOTIFICATION_TYPES;
    case NotificationFilterType.MessagesAndReplies:
      return MESSAGES_AND_REPLIES_TYPES;
    case NotificationFilterType.Space:
      return SPACE_NOTIFICATION_TYPES;
    case NotificationFilterType.Platform:
      return PLATFORM_NOTIFICATION_TYPES;
    default:
      return ALL_NOTIFICATION_TYPES;
  }
};
