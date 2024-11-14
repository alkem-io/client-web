import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunicationUserMentionView = ({
  type,
  state,
  space,
  callout,
  triggeredBy,
  triggeredAt,
}: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      commenterName: triggeredBy?.profile?.displayName,
      colloutName: callout?.profile.displayName,
    };

    return {
      type,
      state: state,
      space: {
        avatarUrl: space?.profile.visual?.uri ?? '',
      },
      resource: {
        url: callout?.profile.url ?? '',
      },
      contributor: {
        avatarUrl: triggeredBy?.profile?.visual?.uri ?? '',
      },
      triggeredAt: triggeredAt,
      values: notificationTextValues,
    };
  }, [state, space, callout, triggeredBy, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
