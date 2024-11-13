import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunityNewMemberView = ({ type, state, space, triggeredBy, triggeredAt }: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
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
        key: `components.inAppNotifications.description.${type}`,
        values: {
          defaultValue: '',
          spaceName: space?.profile?.displayName,
        },
      },
    };
  }, [state, space, triggeredBy, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
