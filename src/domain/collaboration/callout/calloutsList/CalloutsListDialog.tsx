import { Dialog, DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import CalloutsList, { CalloutInfo, CalloutsListProps } from './CalloutsList';
import { useTranslation } from 'react-i18next';

export interface CalloutsListDialogProps<Callout extends CalloutInfo> extends CalloutsListProps<Callout> {
  open?: boolean;
  onClose?: () => void;
}

const CalloutsListDialog = <Callout extends CalloutInfo>({
  open = false,
  onClose,
  ...listProps
}: CalloutsListDialogProps<Callout>) => {
  const { t } = useTranslation();

  return (
    <Dialog open={open} fullWidth>
      <DialogHeader onClose={onClose} title={t('callout.calloutsList.title')} />
      <DialogContent>
        <CalloutsList {...listProps} />
      </DialogContent>
    </Dialog>
  );
};

export default CalloutsListDialog;
