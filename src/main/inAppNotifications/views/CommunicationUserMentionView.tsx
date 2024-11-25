import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CommunicationUserMentionView = ({
  id,
  type,
  state,
  space,
  callout,
  triggeredBy,
  triggeredAt,
  comment,
}: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    const notificationTextValues = {
      defaultValue: '',
      commenterName: triggeredBy?.profile?.displayName,
      colloutName: callout?.framing?.profile?.displayName,
      comment,
    };

    return {
      id,
      type,
      state: state,
      space: {
        avatarUrl: space?.profile?.visual?.uri ?? '',
      },
      resource: {
        url: callout?.framing?.profile?.url ?? '',
      },
      contributor: {
        avatarUrl: triggeredBy?.profile?.visual?.uri ?? '',
      },
      triggeredAt: triggeredAt,
      values: notificationTextValues,
    };
  }, [id, state]);

  return <InAppNotificationBaseView {...notification} />;
};
