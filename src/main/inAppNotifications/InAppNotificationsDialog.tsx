import { DialogContent } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '@/core/ui/dialog/DialogWithGrid';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useInAppNotificationsContext } from './InAppNotificationsContext';
import { InAppNotificationsList } from './InAppNotificationsList';

export const InAppNotificationsDialog = () => {
  const { t } = useTranslation();
  const { isOpen, setIsOpen } = useInAppNotificationsContext();

  return (
    <DialogWithGrid open={isOpen} columns={8} onClose={() => setIsOpen(false)}>
      <DialogHeader icon={<NotificationsNoneOutlinedIcon />} onClose={() => setIsOpen(false)}>
        {t('common.notifications')}
      </DialogHeader>
      <DialogContent sx={{ padding: 0 }}>{isOpen && <InAppNotificationsList />}</DialogContent>
    </DialogWithGrid>
  );
};
