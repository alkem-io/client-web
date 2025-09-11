import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';
import { getInvitationsDialogUrl } from '@/main/routing/urlBuilders';

export const InAppVirtualContributorAdminSpaceCommunityInvitationView = (notification: InAppNotificationModel) => {
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: payload.space?.about?.profile?.displayName,
    contributorName: payload.contributor?.profile?.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={getInvitationsDialogUrl()}
    />
  );
};
