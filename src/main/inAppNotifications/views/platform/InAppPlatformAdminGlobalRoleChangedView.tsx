import { useTranslation } from 'react-i18next';
import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppPlatformAdminGlobalRoleChangedView = (notification: InAppNotificationModel) => {
  const { t } = useTranslation();
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    userName: payload.user?.profile?.displayName ?? t('components.inAppNotifications.unknownUser'),
    role: payload.role,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.user?.profile?.url}
    />
  );
};
