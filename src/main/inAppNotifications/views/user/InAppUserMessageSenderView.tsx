import { useTranslation } from 'react-i18next';
import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppUserMessageSenderView = (notification: InAppNotificationModel) => {
  const { t } = useTranslation();
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName || !payload.userMessage) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    comment: payload.userMessage,
    receiverName: payload.user?.profile?.displayName ?? t('components.inAppNotifications.unknownUser'),
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.user?.profile?.url}
    />
  );
};
