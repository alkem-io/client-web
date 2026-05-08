import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';

export enum NotificationFilterType {
  All = 'ALL',
  MessagesAndReplies = 'MESSAGES_AND_REPLIES',
  Space = 'SPACE',
  Platform = 'PLATFORM',
}

// Messages & Replies — only person-to-person conversation events. Direct
// messages, replies to my comments, and @mentions of me (as user OR as org
// admin). Anything *about* a space or the platform belongs on its own tab.
const MESSAGES_AND_REPLIES_TYPES: NotificationEvent[] = [
  NotificationEvent.UserCommentReply,
  NotificationEvent.UserMentioned,
  NotificationEvent.UserMessage,
  NotificationEvent.OrganizationAdminMentioned,
  NotificationEvent.OrganizationAdminMessage,
  NotificationEvent.OrganizationMessageSender,
];

// Space notifications - any event tied to a Space (admin OR member view), and
// space-membership lifecycle events on the user side (invitation, joined,
// application declined) which previously leaked into Messages & Replies.
const SPACE_NOTIFICATION_TYPES: NotificationEvent[] = [
  NotificationEvent.SpaceAdminCollaborationCalloutContribution,
  NotificationEvent.SpaceAdminCommunityApplication,
  NotificationEvent.SpaceAdminCommunityNewMember,
  NotificationEvent.SpaceAdminVirtualCommunityInvitationDeclined,
  NotificationEvent.SpaceCollaborationCalloutComment,
  NotificationEvent.SpaceCollaborationCalloutContribution,
  NotificationEvent.SpaceCollaborationCalloutPostContributionComment,
  NotificationEvent.SpaceCollaborationCalloutPublished,
  NotificationEvent.SpaceCommunicationUpdate,
  NotificationEvent.SpaceCommunityInvitationUserPlatform,
  NotificationEvent.SpaceLeadCommunicationMessage,
  NotificationEvent.SpaceCommunityCalendarEventCreated,
  NotificationEvent.SpaceCommunityCalendarEventComment,
  NotificationEvent.SpaceCollaborationPollVoteCastOnOwnPoll,
  NotificationEvent.SpaceCollaborationPollVoteCastOnPollIVotedOn,
  NotificationEvent.SpaceCollaborationPollModifiedOnPollIVotedOn,
  NotificationEvent.SpaceCollaborationPollVoteAffectedByOptionChange,
  NotificationEvent.UserSpaceCommunityInvitation,
  NotificationEvent.UserSpaceCommunityApplicationDeclined,
  NotificationEvent.UserSpaceCommunityJoined,
  // VC-admin notification about the VC being invited to a space community —
  // still a space-membership event from the recipient's perspective.
  NotificationEvent.VirtualAdminSpaceCommunityInvitation,
];

// Platform notifications - platform admin, forum, and the Alkemio sign-up
// welcome (a platform-wide event, not a per-space message).
const PLATFORM_NOTIFICATION_TYPES: NotificationEvent[] = [
  NotificationEvent.PlatformAdminGlobalRoleChanged,
  NotificationEvent.PlatformAdminSpaceCreated,
  NotificationEvent.PlatformAdminUserProfileCreated,
  NotificationEvent.PlatformAdminUserProfileRemoved,
  NotificationEvent.PlatformForumDiscussionComment,
  NotificationEvent.PlatformForumDiscussionCreated,
  NotificationEvent.UserSignUpWelcome,
];

// All notification types
const ALL_NOTIFICATION_TYPES: NotificationEvent[] = [
  ...MESSAGES_AND_REPLIES_TYPES,
  ...SPACE_NOTIFICATION_TYPES,
  ...PLATFORM_NOTIFICATION_TYPES,
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
