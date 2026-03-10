import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceAdminCommunityNewMemberView = (notification: InAppNotificationModel) => {
  const { payload } = notification;

  // do not display notification if these are missing
  if (!payload.actor?.profile?.displayName || !payload.space?.about?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    spaceName: payload.space?.about?.profile?.displayName,
    memberName: payload.actor?.profile?.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.actor?.profile?.url}
    />
  );
};
