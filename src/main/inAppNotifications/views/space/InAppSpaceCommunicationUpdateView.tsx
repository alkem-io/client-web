import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';
import { buildUpdatesUrl } from '@/main/routing/urlBuilders';

export const InAppSpaceCommunicationUpdateView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.space) {
    return null;
  }
  const space = payload.space;
  const spaceUrl = space?.about?.profile?.url;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: space?.about?.profile?.displayName,
    comment: payload.update || '',
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={spaceUrl ? buildUpdatesUrl(spaceUrl) : undefined}
    />
  );
};
