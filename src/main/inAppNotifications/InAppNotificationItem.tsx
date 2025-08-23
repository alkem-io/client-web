import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { InAppNotificationModel } from './model/InAppNotificationModel';
import { InAppSpaceCollaborationCalloutPublishedView } from './views/InAppSpaceCollaborationCalloutPublishedView';
import { InAppUserMentionView } from './views/InAppUserMentionView';
import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import { InAppSpaceCommunityNewMemberAdminView } from './views/InAppSpaceCommunityNewMemberAdminView';
import { InAppSpaceCommunityNewMemberView } from './views/InAppSpaceCommunityNewMemberView';

export const InAppNotificationItem = ({ ...item }: InAppNotificationModel) => {
  switch (item.type) {
    case NotificationEvent.SpaceCollaborationCalloutPublished:
      return <InAppSpaceCollaborationCalloutPublishedView {...item} />;
    case NotificationEvent.UserMentioned:
      return <InAppUserMentionView {...item} />;
    case NotificationEvent.SpaceAdminCommunityNewMember:
      return <InAppSpaceCommunityNewMemberView {...item} />;
    case NotificationEvent.UserSpaceCommunityJoined:
      return <InAppSpaceCommunityNewMemberAdminView {...item} />;

    default:
      logWarn(`Unsupported Notification type: ${item.type}`, {
        category: TagCategoryValues.NOTIFICATIONS,
        label: item.type,
      });
      return null;
  }
};
