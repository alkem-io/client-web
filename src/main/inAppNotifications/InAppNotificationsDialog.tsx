import { DialogContent, IconButton, Tooltip } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { InAppNotificationsList } from './InAppNotificationsList';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import { InAppNotificationSubscriber } from '@/main/inAppNotifications/inAppNotificationSubscriber';
import { InAppNotificationsFilterChips } from './InAppNotificationsFilterChips';

export const InAppNotificationsDialog = () => {
  const { t } = useTranslation();
  const { isOpen, setIsOpen, selectedFilter, setSelectedFilter } = useInAppNotificationsContext();
  const { markNotificationsAsRead } = useInAppNotifications();

  return (
    <DialogWithGrid
      open={isOpen}
      columns={8}
      onClose={() => setIsOpen(false)}
      aria-labelledby="in-app-notifications-dialog"
    >
      <DialogHeader
        id="in-app-notifications-dialog"
        icon={<NotificationsNoneOutlinedIcon />}
        onClose={() => setIsOpen(false)}
        actions={
          <Tooltip title={t('components.inAppNotifications.markAllAsRead')} placement="top">
            <IconButton onClick={() => markNotificationsAsRead()}>
              <DraftsOutlinedIcon />
            </IconButton>
          </Tooltip>
        }
      >
        {t('common.Notifications')}
      </DialogHeader>
      <DialogContent sx={{ padding: 0 }}>
        <InAppNotificationsFilterChips selectedFilter={selectedFilter} onFilterChange={setSelectedFilter} />
        {isOpen && <InAppNotificationsList />}
        <InAppNotificationSubscriber />
      </DialogContent>
    </DialogWithGrid>
  );
};
