import DraftsOutlinedIcon from '@mui/icons-material/DraftsOutlined';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import { DialogContent, IconButton, Tooltip } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import RouterLink from '@/core/ui/link/RouterLink';
import { useCurrentUserContext } from '@/domain/community/userCurrent/useCurrentUserContext';
import { InAppNotificationSubscriber } from '@/main/inAppNotifications/inAppNotificationSubscriber';
import { useInAppNotifications } from '@/main/inAppNotifications/useInAppNotifications';
import { buildNotificationSettingsUrl } from '../routing/urlBuilders';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { InAppNotificationsFilterChips } from './InAppNotificationsFilterChips';
import { InAppNotificationsList } from './InAppNotificationsList';

const InAppNotificationsDialog = () => {
  const { t } = useTranslation();
  const { isOpen, setIsOpen, selectedFilter, setSelectedFilter } = useInAppNotificationsContext();
  const { markNotificationsAsRead } = useInAppNotifications();
  const { userModel } = useCurrentUserContext();

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
          <>
            <Tooltip title={t('components.inAppNotifications.markAllAsRead')} placement="top">
              <IconButton onClick={() => markNotificationsAsRead()}>
                <DraftsOutlinedIcon />
              </IconButton>
            </Tooltip>
            {userModel?.profile?.url && (
              <Tooltip title={t('common.settings')} placement="top">
                <IconButton component={RouterLink} to={buildNotificationSettingsUrl(userModel.profile.url)}>
                  <SettingsOutlinedIcon />
                </IconButton>
              </Tooltip>
            )}
          </>
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

export default InAppNotificationsDialog;
