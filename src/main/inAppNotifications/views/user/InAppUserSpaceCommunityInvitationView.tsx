import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppUserSpaceCommunityInvitationView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.space?.about?.profile) {
    return null;
  }
  const { profile } = payload.space?.about;

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: profile.displayName,
    comment: `${profile.displayName} - ${profile.description}`,
  };

  return <InAppNotificationBaseView notification={notification} values={notificationTextValues} url={profile.url} />;
};
