import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { InAppNotificationModel } from './model/InAppNotificationModel';
import { InAppSpaceCollaborationCalloutPublishedView } from './views/space/InAppSpaceCollaborationCalloutPublishedView';
import { InAppUserMentionView } from './views/user/InAppUserMentionView';
import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import { InAppUserSpaceCommunityJoinedView } from './views/user/InAppUserSpaceCommunityJoinedView';
import { InAppSpaceCollaborationCalloutContributionView } from './views/space/InAppSpaceCollaborationCalloutContributionView';
import { InAppSpaceAdminCommunityNewMemberView } from './views/space/InAppSpaceAdminCommunityNewMemberView';

export const InAppNotificationItem = ({ ...item }: InAppNotificationModel) => {
  switch (item.type) {
    case NotificationEvent.SpaceAdminCommunityNewMember:
      return <InAppSpaceAdminCommunityNewMemberView {...item} />;
    case NotificationEvent.SpaceCollaborationCalloutPublished:
      return <InAppSpaceCollaborationCalloutPublishedView {...item} />;
    case NotificationEvent.SpaceCollaborationCalloutContribution:
      return <InAppSpaceCollaborationCalloutContributionView {...item} />;
    case NotificationEvent.UserMentioned:
      return <InAppUserMentionView {...item} />;
    case NotificationEvent.UserSpaceCommunityJoined:
      return <InAppUserSpaceCommunityJoinedView {...item} />;

    default:
      logWarn(`Unsupported Notification type: ${item.type}`, {
        category: TagCategoryValues.NOTIFICATIONS,
        label: item.type,
      });
      return null;
  }
};
