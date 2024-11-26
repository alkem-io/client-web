import { useTranslation } from 'react-i18next';
import { InAppNotificationProps } from '../useInAppNotifications';
import { InAppNotificationBaseView, InAppNotificationBaseViewProps } from './InAppNotificationBaseView';
import { useMemo } from 'react';

export const CollaborationCalloutPublishedView = ({
  id,
  type,
  state,
  space,
  callout,
  triggeredBy,
  triggeredAt,
}: InAppNotificationProps) => {
  const { t } = useTranslation();

  const notification: InAppNotificationBaseViewProps = useMemo(() => {
    let calloutType = '';

    if (callout?.type) {
      calloutType = t(`components.calloutTypeSelect.label.${callout?.type}` as const);
    }

    const notificationTextValues = {
      defaultValue: '',
      spaceName: space?.profile?.displayName,
      spaceType: space?.level,
      calloutName: callout?.framing?.profile?.displayName,
      calloutType: calloutType,
      contributorName: triggeredBy?.profile?.displayName,
    };

    return {
      id,
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
  }, [id, state, space, callout, t]);

  return <InAppNotificationBaseView {...notification} />;
};
