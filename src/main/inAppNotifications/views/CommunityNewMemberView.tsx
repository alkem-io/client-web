import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberView = ({ id, type, state, space, triggeredAt }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      spaceName: space?.about.profile?.displayName,
    };

    return {
      id,
      type,
      state,
      space: {
        avatarUrl: space?.about.profile?.visual?.uri ?? '',
      },
      resource: {
        url: space?.about.profile?.url ?? '',
      },
      triggeredAt: triggeredAt,
      values: notificationTextValues,
    };
  }, [id, state, space, triggeredAt]);

  // do not display notification if these are missing
  if (!space?.about.profile?.displayName) {
    return null;
  }

  return <InAppNotificationBaseView {...notification} />;
};
