import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberAdminView = ({ id, state, space, triggeredAt, contributor }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      spaceName: space?.about.profile?.displayName,
      memberType: contributor?.type,
      memberName: contributor?.profile?.displayName,
    };

    return {
      id,
      type: 'COMMUNITY_NEW_MEMBER_ADMIN',
      state,
      space: {
        id: space?.id,
        avatarUrl: space?.about.profile?.visual?.uri ?? '',
      },
      resource: {
        url: space?.about.profile?.url ?? '',
      },
      triggeredAt: triggeredAt,
      values: notificationTextValues,
    };
  }, [id, state, space, triggeredAt, contributor]);

  // do not display notification if these are missing
  if (!contributor?.profile?.displayName || !space?.about.profile?.displayName) {
    return null;
  }

  return <InAppNotificationBaseView {...notification} />;
};
