import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberAdminView = ({ state, space, triggeredBy, triggeredAt }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    // This notifictaion is variation of the COMMUNITY_NEW_MEMBER
    // The type is hardcoded due to a TS error
    const descKey = 'components.inAppNotifications.description.COMMUNITY_NEW_MEMBER_ADMIN';
    //The {{memberType}} <b>{{memberName}}</b> has joined {{spaceName}}, of which you are an admin.",
    return {
      state: state,
      space: {
        avatarUrl: space?.profile.visual?.uri ?? '',
      },
      subject: {
        url: space?.profile.url ?? '',
      },
      triggeredAt: triggeredAt,
      description: {
        key: descKey,
        values: {
          defaultValue: '',
          spaceName: space?.profile?.displayName,
          memberType: space?.communityRole,
          memberName: triggeredBy?.profile?.displayName,
        },
      },
    };
  }, [state, space, triggeredBy, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
