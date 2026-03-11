import { Box } from '@mui/material';
import { useTranslation } from 'react-i18next';
import Gutters from '@/core/ui/grid/Gutters';
import Loading from '@/core/ui/loading/Loading';
import { Caption } from '@/core/ui/typography';
import useLazyLoading from '@/domain/shared/pagination/useLazyLoading';
import { InAppNotificationItem } from './InAppNotificationItem';
import { useInAppNotifications } from './useInAppNotifications';

const Loader = ({ ref }) => (
  <Box ref={ref} display="flex" justifyContent="center" padding={2}>
    <Loading />
  </Box>
);

export const InAppNotificationsList = () => {
  const { t } = useTranslation();
  const { notificationsInApp, isLoading, fetchMore, hasMore } = useInAppNotifications();

  const loader = useLazyLoading(Loader, {
    fetchMore,
    loading: isLoading,
    hasMore,
  });

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
      {loader}
    </>
  );
};
