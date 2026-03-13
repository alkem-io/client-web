import { useTranslation } from 'react-i18next';
import type { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { mapInAppNotificationPayloadSpaceCollaborationCalloutToModel } from '../../util/mapInAppNotificationPayloadSpaceCollaborationCalloutToModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceCollaborationCalloutPublishedView = (notification: InAppNotificationModel) => {
  const { t } = useTranslation();

  const { payload, triggeredBy } = notification;
  const inAppPayloadSpaceCollaborationCallout = mapInAppNotificationPayloadSpaceCollaborationCalloutToModel(payload);

  if (!inAppPayloadSpaceCollaborationCallout) {
    return null;
  }

  const notificationTextValues = {
    spaceName: inAppPayloadSpaceCollaborationCallout.space.about.profile.displayName,
    spaceLevel: t(`common.space-level.${inAppPayloadSpaceCollaborationCallout.space.level}`),
    calloutName: inAppPayloadSpaceCollaborationCallout.callout.framing.profile.displayName,
    triggeredByName: triggeredBy.profile.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={inAppPayloadSpaceCollaborationCallout.callout.framing.profile.url}
    />
  );
};
