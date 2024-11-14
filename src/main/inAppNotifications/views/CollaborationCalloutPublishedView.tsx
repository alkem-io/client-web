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
    return {
      state: state,
      space: {
        avatarUrl: space?.profile.visual?.uri ?? '',
      },
      subject: {
        url: callout?.profile.url ?? '',
      },
      contributor: {
        avatarUrl: triggeredBy?.profile?.visual?.uri ?? '',
      },
      triggeredAt: triggeredAt,
      description: {
        key: `components.inAppNotifications.description.${type}`,
        values: {
          defaultValue: '',
          spaceName: space?.profile?.displayName,
          spaceType: space?.level,
          calloutName: callout?.profile.displayName,
          calloutType: callout?.type,
          contributorName: triggeredBy?.profile?.displayName,
        },
      },
    };
  }, [state, space, callout, triggeredBy, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
