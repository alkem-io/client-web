import { InAppNotificationModel } from '../model/InAppNotificationModel';
import { InAppNotificationBaseView } from './InAppNotificationBaseView';

export const InAppSpaceCommunityNewMemberAdminView = (notification: InAppNotificationModel) => {
  const { payload } = notification;

  // do not display notification if these are missing
  if (!payload.contributor?.profile?.displayName || !payload.space?.about?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    defaultValue: '',
    spaceName: payload.space?.about?.profile?.displayName,
    memberType: payload.contributor?.type,
    memberName: payload.contributor?.profile?.displayName,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.space?.about?.profile?.url}
    />
  );
};
