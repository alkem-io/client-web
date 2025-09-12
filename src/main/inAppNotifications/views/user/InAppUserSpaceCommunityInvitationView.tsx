import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppUserSpaceCommunityInvitationView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.space) {
    return null;
  }
  const space = payload.space;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: space.about?.profile?.displayName,
    spaceDescription: space.about?.profile?.description || '',
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.space.about?.profile?.url}
    />
  );
};
