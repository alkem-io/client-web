import { useTranslation } from 'react-i18next';
import { useInAppNotifications } from './useInAppNotifications';
import { InAppNotificationItem } from './InAppNotificationItem';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import Gutters from '@/core/ui/grid/Gutters';

export const InAppNotificationsList = () => {
  const { t } = useTranslation();
  const { notificationsInApp, isLoading } = useInAppNotifications();

  if (notificationsInApp.length === 0) {
    if (isLoading) {
      return (
        <Gutters alignItems={'center'}>
          <Loading />
        </Gutters>
      );
    }

    return (
      <Gutters alignItems={'center'}>
        <Caption>{t('components.inAppNotifications.emptyInbox')}</Caption>
      </Gutters>
    );
  }

  return (
    <>
      {notificationsInApp.map(item => (
        <InAppNotificationItem key={`${item.id}-notification`} {...item} />
      ))}
    </>
  );
};
