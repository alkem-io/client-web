import { warn as logWarn, TagCategoryValues } from '@/core/logging/sentry/log';
import { InAppNotificationProps } from './useInAppNotifications';

// TODO:NotificationEventType fix
export const InAppNotificationItem = ({ ...item }: InAppNotificationProps) => {
  switch (item.type) {
    // case NotificationEventType.CollaborationCalloutPublished:
    //   return <CollaborationCalloutPublishedView {...item} />;
    // case NotificationEventType.CommunicationUserMention:
    //   return <CommunicationUserMentionView {...item} />;
    // case NotificationEventType.CommunityNewMember:
    //   if (item.category === InAppNotificationCategory.Admin) {
    //     return <CommunityNewMemberAdminView {...item} />;
    //   }
    //   return <CommunityNewMemberView {...item} />;
    default:
      logWarn(`Unsupported Notification type: ${item.type}`, {
        category: TagCategoryValues.NOTIFICATIONS,
        label: item.type,
      });
      return null;
  }
};
