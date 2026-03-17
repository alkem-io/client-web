import { Dialog, DialogContent } from '@mui/material';
import { useTranslation } from 'react-i18next';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';
import useCalloutsSet from '../../calloutsSet/useCalloutsSet/useCalloutsSet';
import CalloutsList from './CalloutsList';

export interface CalloutsListDialogProps {
  open?: boolean;
  onClose?: () => void;
}

const CalloutsListDialog = ({ open = false, onClose }: CalloutsListDialogProps) => {
  const { calloutsSetId } = useUrlResolver();
  const { t } = useTranslation();
  const { callouts } = useCalloutsSet({
    calloutsSetId: calloutsSetId,
    classificationTagsets: [],
    includeClassification: true,
    skip: !open,
  });

  return (
    <Dialog open={open} fullWidth={true}>
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
