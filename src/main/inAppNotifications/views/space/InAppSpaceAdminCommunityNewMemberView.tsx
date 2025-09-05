import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppSpaceAdminCommunityNewMemberView = (notification: InAppNotificationModel) => {
  const { payload } = notification;

  // do not display notification if these are missing
  if (!payload.contributor?.profile?.displayName || !payload.space?.about?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    defaultValue: '',
    spaceName: payload.space?.about?.profile?.displayName,
    memberName: payload.contributor?.profile?.displayName,
    memberType: '', // todo: missing memberType (Admin, member, lead)
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.space?.about?.profile?.url}
    />
  );
};
