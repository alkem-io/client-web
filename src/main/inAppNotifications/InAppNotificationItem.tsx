import { InAppNotificationCategory, InAppNotificationProps, InAppNotificationType } from './useInAppNotifications';
import { CollaborationCalloutPublishedView } from './views/CollaborationCalloutPublishedView';
import { CommunicationUserMentionView } from './views/CommunicationUserMentionView';
import { CommunityNewMemberAdminView } from './views/CommunityNewMemberAdminView';
import { CommunityNewMemberView } from './views/CommunityNewMemberView';

export const InAppNotificationItem = ({ ...item }: InAppNotificationProps) => {
  switch (item.type) {
    case InAppNotificationType.COLLABORATION_CALLOUT_PUBLISHED:
      return <CollaborationCalloutPublishedView {...item} />;
    case InAppNotificationType.COMMUNICATION_USER_MENTION:
      return <CommunicationUserMentionView {...item} />;
    case InAppNotificationType.COMMUNITY_NEW_MEMBER:
      if (item.category === InAppNotificationCategory.ADMIN) {
        return <CommunityNewMemberAdminView {...item} />;
      }
      return <CommunityNewMemberView {...item} />;
    default:
      // todo: sent warning to Sentry
      return null;
  }
};
