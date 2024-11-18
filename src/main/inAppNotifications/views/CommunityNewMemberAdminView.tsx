import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberAdminView = ({ id, state, space, triggeredAt, contributor }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      spaceName: space?.profile?.displayName,
      memberType: contributor?.type,
      memberName: contributor?.profile?.displayName,
    };

    return {
      id,
      type: 'communityNewMemberAdmin',
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
  }, [id, state]);

  return <InAppNotificationBaseView {...notification} />;
};