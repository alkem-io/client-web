import { Dialog, DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import CalloutsList from './CalloutsList';
import useCalloutsSet from '../../calloutsSet/useCalloutsSet/useCalloutsSet';

export interface CalloutsListDialogProps {
  open?: boolean;
  onClose?: () => void;
  calloutsSetId: string;
}

const CalloutsListDialog = ({ open = false, onClose, calloutsSetId }: CalloutsListDialogProps) => {
  const { t } = useTranslation();
  const { callouts } = useCalloutsSet({
    calloutsSetId: calloutsSetId,
    classificationTagsets: [],
    canSaveAsTemplate: false,
    entitledToSaveAsTemplate: false,
    skip: !open,
  });

  return (
    <Dialog open={open} fullWidth>
      <DialogHeader onClose={onClose} title={t('callout.calloutsList.title')} />
      <DialogContent>
        <CalloutsList
          callouts={callouts}
          emptyListCaption={t('pages.generic.sections.subEntities.empty', {
            entities: t('common.collaborationTools'),
          })}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CalloutsListDialog;
