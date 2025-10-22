import { useTranslation } from 'react-i18next';
import { InAppNotificationModel } from '../../model/InAppNotificationModel';
import { InAppNotificationBaseView } from '../InAppNotificationBaseView';

export const InAppOrganizationMessageSenderView = (notification: InAppNotificationModel) => {
  const { t } = useTranslation();
  const { payload, triggeredBy } = notification;

  // do not display notification if these are missing
  if (!triggeredBy?.profile?.displayName) {
    return null;
  }

  const notificationTextValues = {
    triggeredByName: triggeredBy.profile.displayName,
    organizationName:
      payload.organization?.profile?.displayName ?? t('components.inAppNotifications.unknownOrganization'),
    comment: payload.organizationMessage,
  };

  return (
    <InAppNotificationBaseView
      notification={notification}
      values={notificationTextValues}
      url={payload.organization?.profile?.url}
    />
  );
};
