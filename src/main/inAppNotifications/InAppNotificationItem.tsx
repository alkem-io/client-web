import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { InAppUserSpaceCommunityApplicationDeclined } from '@/main/inAppNotifications/views/user/InAppUserSpaceCommunityApplicationDeclined';
import type { InAppNotificationModel } from './model/InAppNotificationModel';
import { InAppOrganizationAdminMentionedView } from './views/organization/InAppOrganizationAdminMentionedView';
import { InAppOrganizationAdminMessageView } from './views/organization/InAppOrganizationAdminMessageView';
import { InAppOrganizationMessageSenderView } from './views/organization/InAppOrganizationMessageSenderView';
import { InAppPlatformAdminGlobalRoleChangedView } from './views/platform/InAppPlatformAdminGlobalRoleChangedView';
import { InAppPlatformAdminSpaceCreatedView } from './views/platform/InAppPlatformAdminSpaceCreatedView';
import { InAppPlatformAdminUserProfileCreatedView } from './views/platform/InAppPlatformAdminUserProfileCreatedView';
import { InAppPlatformAdminUserProfileRemovedView } from './views/platform/InAppPlatformAdminUserProfileRemovedView';
import { InAppPlatformForumDiscussionCommentView } from './views/platform/InAppPlatformForumDiscussionCommentView';
import { InAppPlatformForumDiscussionCreatedView } from './views/platform/InAppPlatformForumDiscussionCreatedView';
import { InAppSpaceAdminCollaborationCalloutContributionView } from './views/space/InAppSpaceAdminCollaborationCalloutContributionView';
import { InAppSpaceAdminCommunityApplicationView } from './views/space/InAppSpaceAdminCommunityApplicationView';
import { InAppSpaceAdminCommunityNewMemberView } from './views/space/InAppSpaceAdminCommunityNewMemberView';
import { InAppSpaceCollaborationCalloutCommentView } from './views/space/InAppSpaceCollaborationCalloutCommentView';
import { InAppSpaceCollaborationCalloutContributionView } from './views/space/InAppSpaceCollaborationCalloutContributionView';
import { InAppSpaceCollaborationCalloutPostContributionCommentView } from './views/space/InAppSpaceCollaborationCalloutPostContributionCommentView';
import { InAppSpaceCollaborationCalloutPublishedView } from './views/space/InAppSpaceCollaborationCalloutPublishedView';
import { InAppSpaceCommunicationUpdateView } from './views/space/InAppSpaceCommunicationUpdateView';
import { InAppSpaceCommunityCalendarEventCommentView } from './views/space/InAppSpaceCommunityCalendarEventCommentView';
import { InAppSpaceCommunityCalendarEventCreatedView } from './views/space/InAppSpaceCommunityCalendarEventCreatedView';
import { InAppSpaceCommunityInvitationUserPlatformView } from './views/space/InAppSpaceCommunityInvitationUserPlatformView';
import { InAppSpaceLeadCommunicationMessageView } from './views/space/InAppSpaceLeadCommunicationMessageView';
import { InAppUserCommentReplyView } from './views/user/InAppUserCommentReplyView';
import { InAppUserMentionView } from './views/user/InAppUserMentionView';
import { InAppUserMessageView } from './views/user/InAppUserMessageView';
import { InAppUserSignUpWelcomeView } from './views/user/InAppUserSignUpWelcomeView';
import { InAppUserSpaceCommunityInvitationView } from './views/user/InAppUserSpaceCommunityInvitationView';
import { InAppUserSpaceCommunityJoinedView } from './views/user/InAppUserSpaceCommunityJoinedView';
import { InAppSpaceAdminVirtualContributorCommunityInvitationDeclinedView } from './views/virtualContributor/InAppVirtualContributorAdminSpaceCommunityInvitationDeclinedView';
import { InAppVirtualContributorAdminSpaceCommunityInvitationView } from './views/virtualContributor/InAppVirtualContributorAdminSpaceCommunityInvitationView';
import { InAppSpaceCollaborationPollView } from './views/space/InAppSpaceCollaborationPollView';

export const InAppNotificationItem = ({ ...item }: InAppNotificationModel) => {
  switch (item.type) {
    case NotificationEvent.SpaceAdminCommunityNewMember:
      return <InAppSpaceAdminCommunityNewMemberView {...item} />;
    case NotificationEvent.SpaceCollaborationCalloutPublished:
      return <InAppSpaceCollaborationCalloutPublishedView {...item} />;
    case NotificationEvent.SpaceCollaborationCalloutContribution:
      return <InAppSpaceCollaborationCalloutContributionView {...item} />;
    case NotificationEvent.SpaceCollaborationCalloutPostContributionComment:
      return <InAppSpaceCollaborationCalloutPostContributionCommentView {...item} />;
    case NotificationEvent.UserMentioned:
      return <InAppUserMentionView {...item} />;
    case NotificationEvent.UserSpaceCommunityJoined:
      return <InAppUserSpaceCommunityJoinedView {...item} />;
    case NotificationEvent.OrganizationAdminMentioned:
      return <InAppOrganizationAdminMentionedView {...item} />;
    case NotificationEvent.OrganizationAdminMessage:
      return <InAppOrganizationAdminMessageView {...item} />;
    case NotificationEvent.OrganizationMessageSender:
      return <InAppOrganizationMessageSenderView {...item} />;
    case NotificationEvent.PlatformAdminGlobalRoleChanged:
      return <InAppPlatformAdminGlobalRoleChangedView {...item} />;
    case NotificationEvent.PlatformAdminSpaceCreated:
      return <InAppPlatformAdminSpaceCreatedView {...item} />;
    case NotificationEvent.PlatformAdminUserProfileCreated:
      return <InAppPlatformAdminUserProfileCreatedView {...item} />;
    case NotificationEvent.PlatformAdminUserProfileRemoved:
      return <InAppPlatformAdminUserProfileRemovedView {...item} />;
    case NotificationEvent.PlatformForumDiscussionComment:
      return <InAppPlatformForumDiscussionCommentView {...item} />;
    case NotificationEvent.PlatformForumDiscussionCreated:
      return <InAppPlatformForumDiscussionCreatedView {...item} />;
    case NotificationEvent.SpaceAdminCollaborationCalloutContribution:
      return <InAppSpaceAdminCollaborationCalloutContributionView {...item} />;
    case NotificationEvent.SpaceAdminCommunityApplication:
      return <InAppSpaceAdminCommunityApplicationView {...item} />;
    case NotificationEvent.SpaceCollaborationCalloutComment:
      return <InAppSpaceCollaborationCalloutCommentView {...item} />;
    case NotificationEvent.SpaceCommunicationUpdate:
      return <InAppSpaceCommunicationUpdateView {...item} />;
    case NotificationEvent.SpaceCommunityInvitationUserPlatform:
      return <InAppSpaceCommunityInvitationUserPlatformView {...item} />;
    case NotificationEvent.SpaceLeadCommunicationMessage:
      return <InAppSpaceLeadCommunicationMessageView {...item} />;
    case NotificationEvent.UserCommentReply:
      return <InAppUserCommentReplyView {...item} />;
    case NotificationEvent.UserMessage:
      return <InAppUserMessageView {...item} />;
    case NotificationEvent.UserSignUpWelcome:
      return <InAppUserSignUpWelcomeView {...item} />;
    case NotificationEvent.UserSpaceCommunityInvitation:
      return <InAppUserSpaceCommunityInvitationView {...item} />;
    case NotificationEvent.UserSpaceCommunityApplicationDeclined:
      return <InAppUserSpaceCommunityApplicationDeclined {...item} />;
    case NotificationEvent.VirtualAdminSpaceCommunityInvitation:
      return <InAppVirtualContributorAdminSpaceCommunityInvitationView {...item} />;
    case NotificationEvent.SpaceAdminVirtualCommunityInvitationDeclined:
      return <InAppSpaceAdminVirtualContributorCommunityInvitationDeclinedView {...item} />;
    case NotificationEvent.SpaceCommunityCalendarEventCreated:
      return <InAppSpaceCommunityCalendarEventCreatedView {...item} />;
    case NotificationEvent.SpaceCommunityCalendarEventComment:
      return <InAppSpaceCommunityCalendarEventCommentView {...item} />;
    case NotificationEvent.SpaceCollaborationPollVoteCastOnOwnPoll:
    case NotificationEvent.SpaceCollaborationPollVoteCastOnPollIVotedOn:
    case NotificationEvent.SpaceCollaborationPollModifiedOnPollIVotedOn:
    case NotificationEvent.SpaceCollaborationPollVoteAffectedByOptionChange:
      return <InAppSpaceCollaborationPollView {...item} />;

    default:
      logWarn(`Unsupported Notification type: ${item.type}`, {
        category: TagCategoryValues.NOTIFICATIONS,
        label: item.type,
      });
      return null;
  }
};
