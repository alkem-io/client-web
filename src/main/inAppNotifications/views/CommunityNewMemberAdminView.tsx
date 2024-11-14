import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberAdminView = ({ state, space, triggeredAt, contributor }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    // This notifictaion is variation of the COMMUNITY_NEW_MEMBER
    // The type is hardcoded due to a TS error when concatenating _ADMIN to the COMMUNITY_NEW_MEMBER
    const descKey = 'components.inAppNotifications.description.COMMUNITY_NEW_MEMBER_ADMIN';

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
          memberType: contributor?.type,
          memberName: contributor?.profile?.displayName,
        },
      },
    };
  }, [state, space, contributor, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
