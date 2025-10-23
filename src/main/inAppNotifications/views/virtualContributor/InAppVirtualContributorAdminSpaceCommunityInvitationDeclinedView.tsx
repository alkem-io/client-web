import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';
import { getInvitationsDialogUrl } from '@/main/routing/urlBuilders';

// Notification for when a Virtual Contributor invitation to a Space community is declined by the contributor admin
export const InAppVirtualContributorAdminSpaceCommunityInvitationDeclinedView = (
  notification: InAppNotificationModel
) => {
  const { payload, triggeredBy } = notification;

  // required fields check
  if (!triggeredBy?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    spaceName: payload.space?.about?.profile?.displayName ?? '',
    contributorName: payload.contributor?.profile?.displayName ?? '',
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={getInvitationsDialogUrl()}
    />
  );
};
