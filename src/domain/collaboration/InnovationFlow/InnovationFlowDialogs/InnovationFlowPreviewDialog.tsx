import { DialogContent } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { BlockTitle } from '../../../../core/ui/typography';
import { InnovationFlowIcon } from '../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import { CoreEntityIdTypes } from '../../../shared/types/CoreEntityIds';
import InnovationFlowProfileBlock from './InnovationFlowProfileBlock';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import LifecycleStateSelector from '../LifecycleState/LifecycleStateSelector';

interface InnovationFlowPreviewDialogProps extends CoreEntityIdTypes {
  open?: boolean;
  onClose: () => void;
}

const InnovationFlowPreviewDialog: FC<InnovationFlowPreviewDialogProps> = ({ open = false, onClose, ...location }) => {
  const { t } = useTranslation();
  const { data, state } = useInnovationFlowSettings(location);
  const { innovationFlow } = data;
  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          <InnovationFlowIcon style={{ verticalAlign: 'bottom' }} /> {t('common.innovation-flow')}
        </BlockTitle>
      </DialogHeader>
      <DialogContent sx={{ paddingTop: 0 }}>
        <InnovationFlowProfileBlock innovationFlow={innovationFlow} loading={state.loading} editable={false}>
          <LifecycleStateSelector currentState={innovationFlow?.lifecycle?.state} />
        </InnovationFlowProfileBlock>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default InnovationFlowPreviewDialog;
