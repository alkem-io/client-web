import { DialogContent } from '@mui/material';
import NotificationsNoneOutlinedIcon from '@mui/icons-material/NotificationsNoneOutlined';
import { useTranslation } from 'react-i18next';
import DialogWithGrid from '../../core/ui/dialog/DialogWithGrid';
import DialogHeader from '../../core/ui/dialog/DialogHeader';
// import { useInAppNotifications } from './useInAppNotifications';
import { useInAppNotificationsContext } from './InAppNotificationsContext';

export const InAppNotificationsDialog = () => {
  const { t } = useTranslation();
  const { isOpen, setIsOpen } = useInAppNotificationsContext();
  // const { items } = useInAppNotifications(); // skip if !isOpen

  return (
    <DialogWithGrid open={isOpen} columns={10}>
      <DialogHeader icon={<NotificationsNoneOutlinedIcon />} onClose={() => setIsOpen(false)}>
        {t('common.notifications')}
      </DialogHeader>
      <DialogContent>coming soon</DialogContent>
    </DialogWithGrid>
  );
};
