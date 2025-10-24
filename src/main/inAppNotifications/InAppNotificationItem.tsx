import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { InAppNotificationModel } from './model/InAppNotificationModel';
import { InAppSpaceCollaborationCalloutPublishedView } from './views/space/InAppSpaceCollaborationCalloutPublishedView';
import { InAppUserMentionView } from './views/user/InAppUserMentionView';
import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import { InAppUserSpaceCommunityJoinedView } from './views/user/InAppUserSpaceCommunityJoinedView';
import { InAppSpaceCollaborationCalloutContributionView } from './views/space/InAppSpaceCollaborationCalloutContributionView';
import { InAppSpaceAdminCommunityNewMemberView } from './views/space/InAppSpaceAdminCommunityNewMemberView';
import { InAppOrganizationAdminMentionedView } from './views/organization/InAppOrganizationAdminMentionedView';
import { InAppOrganizationAdminMessageView } from './views/organization/InAppOrganizationAdminMessageView';
import { InAppOrganizationMessageSenderView } from './views/organization/InAppOrganizationMessageSenderView';
import { InAppPlatformForumDiscussionCommentView } from './views/platform/InAppPlatformForumDiscussionCommentView';
import { InAppPlatformForumDiscussionCreatedView } from './views/platform/InAppPlatformForumDiscussionCreatedView';
import { InAppPlatformAdminGlobalRoleChangedView } from './views/platform/InAppPlatformAdminGlobalRoleChangedView';
import { InAppPlatformAdminSpaceCreatedView } from './views/platform/InAppPlatformAdminSpaceCreatedView';
import { InAppPlatformAdminUserProfileCreatedView } from './views/platform/InAppPlatformAdminUserProfileCreatedView';
import { InAppPlatformAdminUserProfileRemovedView } from './views/platform/InAppPlatformAdminUserProfileRemovedView';
import { InAppSpaceCollaborationCalloutCommentView } from './views/space/InAppSpaceCollaborationCalloutCommentView';
import { InAppSpaceAdminCommunityApplicationView } from './views/space/InAppSpaceAdminCommunityApplicationView';
import { InAppSpaceAdminCollaborationCalloutContributionView } from './views/space/InAppSpaceAdminCollaborationCalloutContributionView';
import { InAppSpaceCollaborationCalloutPostContributionCommentView } from './views/space/InAppSpaceCollaborationCalloutPostContributionCommentView';
import { InAppSpaceCommunicationUpdateView } from './views/space/InAppSpaceCommunicationUpdateView';
import { InAppSpaceCommunityInvitationUserPlatformView } from './views/space/InAppSpaceCommunityInvitationUserPlatformView';
import { InAppSpaceLeadCommunicationMessageView } from './views/space/InAppSpaceLeadCommunicationMessageView';
import { InAppUserCommentReplyView } from './views/user/InAppUserCommentReplyView';
import { InAppUserMessageView } from './views/user/InAppUserMessageView';
import { InAppUserMessageSenderView } from './views/user/InAppUserMessageSenderView';
import { InAppUserSignUpWelcomeView } from './views/user/InAppUserSignUpWelcomeView';
import { InAppUserSpaceCommunityInvitationView } from './views/user/InAppUserSpaceCommunityInvitationView';
import { InAppVirtualContributorAdminSpaceCommunityInvitationView } from './views/virtualContributor/InAppVirtualContributorAdminSpaceCommunityInvitationView';
import { InAppUserSpaceCommunityApplicationDeclined } from '@/main/inAppNotifications/views/user/InAppUserSpaceCommunityApplicationDeclined';
import { InAppSpaceAdminVirtualContributorCommunityInvitationDeclinedView } from './views/virtualContributor/InAppVirtualContributorAdminSpaceCommunityInvitationDeclinedView';

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
    case NotificationEvent.UserMessageSender:
      return <InAppUserMessageSenderView {...item} />;
    case NotificationEvent.UserSignUpWelcome:
      return <InAppUserSignUpWelcomeView {...item} />;
    case NotificationEvent.UserSpaceCommunityInvitation:
      return <InAppUserSpaceCommunityInvitationView {...item} />;
    case NotificationEvent.UserSpaceCommunityApplicationDeclined:
      return <InAppUserSpaceCommunityApplicationDeclined {...item} />;
    case NotificationEvent.VirtualContributorAdminSpaceCommunityInvitation:
      return <InAppVirtualContributorAdminSpaceCommunityInvitationView {...item} />;
    case NotificationEvent.SpaceAdminVirtualContributorCommunityInvitationDeclined:
      return <InAppSpaceAdminVirtualContributorCommunityInvitationDeclinedView {...item} />;

    default:
      logWarn(`Unsupported Notification type: ${item.type}`, {
        category: TagCategoryValues.NOTIFICATIONS,
        label: item.type,
      });
      return null;
  }
};
