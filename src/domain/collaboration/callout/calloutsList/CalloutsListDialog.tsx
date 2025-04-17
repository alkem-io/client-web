import { Dialog, DialogContent } from '@mui/material';
import DialogHeader from '@/core/ui/dialog/DialogHeader';
import { useTranslation } from 'react-i18next';
import CalloutsList from './CalloutsList';
import useCalloutsSet from '../../calloutsSet/useCalloutsSet/useCalloutsSet';
import { useSubSpace } from '@/domain/space/hooks/useSubSpace';
import useUrlResolver from '@/main/routing/urlResolver/useUrlResolver';

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
