import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { InAppNotificationModel } from './model/InAppNotificationModel';
import { CollaborationCalloutPublishedView } from './views/CollaborationCalloutPublishedView';
import { CommunicationUserMentionView } from './views/CommunicationUserMentionView';
import { NotificationEvent } from '@/core/apollo/generated/graphql-schema';
import { CommunityNewMemberAdminView } from './views/CommunityNewMemberAdminView';
import { CommunityNewMemberView } from './views/CommunityNewMemberView';

// TODO:NotificationEventType fix
export const InAppNotificationItem = ({ ...item }: InAppNotificationModel) => {
  switch (item.type) {
    case NotificationEvent.SpaceCollaborationCalloutPublished:
      return <CollaborationCalloutPublishedView {...item} />;
    case NotificationEvent.UserMention:
      return <CommunicationUserMentionView {...item} />;
    case NotificationEvent.SpaceCommunityNewMember:
      return <CommunityNewMemberView {...item} />;
    case NotificationEvent.SpaceCommunityNewMemberAdmin:
      return <CommunityNewMemberAdminView {...item} />;

    default:
      logWarn(`Unsupported Notification type: ${item.type}`, {
        category: TagCategoryValues.NOTIFICATIONS,
        label: item.type,
      });
      return null;
  }
};
