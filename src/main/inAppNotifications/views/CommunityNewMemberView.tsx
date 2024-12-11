import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberView = ({ id, type, state, space, triggeredAt }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      spaceName: space?.profile?.displayName,
    };

    return {
      id,
      type,
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
  }, [id, state, space, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
