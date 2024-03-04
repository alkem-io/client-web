import { DialogContent } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../../../platform/admin/templates/InnovationTemplates/InnovationFlow/InnovationFlowIcon';
import InnovationFlowProfileBlock from './InnovationFlowProfileBlock';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import LifecycleStateSelector from '../LifecycleState/LifecycleStateSelector';
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';
import Gutters from '../../../../core/ui/grid/Gutters';

interface InnovationFlowSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  collaborationId: string;
}

const InnovationFlowSettingsDialog: FC<InnovationFlowSettingsDialogProps> = ({ open = false, onClose, collaborationId }) => {
  const { t } = useTranslation();

  const { data, actions, state } = useInnovationFlowSettings({
    collaborationId
  });

  const { innovationFlow, callouts, flowStateAllowedValues } = data;

  return (
    <DialogWithGrid open={open} columns={12} onClose={onClose}>
      <DialogHeader icon={<InnovationFlowIcon />} title={t('common.innovation-flow')} onClose={onClose} />
      <DialogContent sx={{ paddingTop: 0 }}>
        <Gutters disablePadding>
          <InnovationFlowProfileBlock
            innovationFlow={innovationFlow}
            loading={state.loading}
            onUpdate={actions.updateInnovationFlowProfile}
            editable
          >
            <LifecycleStateSelector
              currentState={innovationFlow?.currentState.displayName}
              states={innovationFlow?.states}
              onStateChange={nextState => actions.changeCurrentState(nextState)}
            />
          </InnovationFlowProfileBlock>
          <InnovationFlowCollaborationToolsBlock
            flowStateAllowedValues={flowStateAllowedValues}
            callouts={callouts}
            onUpdateCalloutFlowState={actions.updateCalloutFlowState}
          />
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default InnovationFlowSettingsDialog;
