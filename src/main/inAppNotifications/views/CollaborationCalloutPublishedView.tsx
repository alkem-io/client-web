import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CollaborationCalloutPublishedView = ({
  type,
  state,
  parentSpace,
  callout,
  triggeredBy,
  triggeredAt,
}: InAppNotificationProps) => {
  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    return {
      state: state,
      space: {
        avatarUrl: parentSpace?.profile.visual?.uri ?? '',
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
          spaceName: parentSpace?.profile?.displayName,
          spaceType: parentSpace?.level,
          calloutName: callout?.profile.displayName,
          calloutType: callout?.type,
          contributorName: triggeredBy?.profile?.displayName,
        },
      },
    };
  }, [state, parentSpace, callout, triggeredBy, triggeredAt]);

  return <InAppNotificationBaseView {...notification} />;
};
