import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CollaborationCalloutPublishedView = ({
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
      spaceName: space?.profile?.displayName,
      spaceType: space?.level,
      calloutName: callout?.framing?.profile?.displayName,
      calloutType: callout?.type,
      contributorName: triggeredBy?.profile?.displayName,
    };

    return {
      type,
      state,
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
  }, [state, space, callout, triggeredBy, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
