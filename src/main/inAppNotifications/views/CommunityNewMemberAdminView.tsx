import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberAdminView = ({ id, state, space, triggeredAt, actor }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      spaceName: space?.profile?.displayName,
      memberType: actor?.__typename,
      memberName: actor?.profile?.displayName,
    };

    return {
      id,
      type: 'COMMUNITY_NEW_MEMBER_ADMIN',
      state,
      space: {
        avatarUrl: space?.profile?.visual?.uri ?? '',
      },
      resource: {
        url: space?.profile?.url ?? '',
      },
      triggeredAt: triggeredAt,
      values: notificationTextValues,
    };
  }, [id, state, space, triggeredAt, actor]);

  // do not display notification if these are missing
  if (!actor?.profile?.displayName || !space?.profile?.displayName) {
    return null;
  }

  return <InAppNotificationBaseView {...notification} />;
};
