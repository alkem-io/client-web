import { DialogContent } from '@mui/material';
import { FC } from 'react';
import { useTranslation } from 'react-i18next';
import DialogHeader from '../../../../core/ui/dialog/DialogHeader';
import DialogWithGrid from '../../../../core/ui/dialog/DialogWithGrid';
import { InnovationFlowIcon } from '../InnovationFlowIcon/InnovationFlowIcon';
import InnovationFlowProfileBlock from './InnovationFlowProfileBlock';
import useInnovationFlowSettings from './useInnovationFlowSettings';
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';

interface InnovationFlowSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
  collaborationId: string | undefined;
}

const InnovationFlowSettingsDialog: FC<InnovationFlowSettingsDialogProps> = ({
  open = false,
  onClose,
  collaborationId,
}) => {
  const { t } = useTranslation();

  const { data, actions, authorization, state } = useInnovationFlowSettings({
    collaborationId,
    skip: !open,
  });
  const { innovationFlow, callouts } = data;

  return (
    <>
      <DialogWithGrid open={open} columns={12} onClose={onClose}>
        <DialogHeader
          icon={<InnovationFlowIcon />}
          title={t('components.innovationFlowSettings.title')}
          onClose={onClose}
        />
        <DialogContent>
          <InnovationFlowProfileBlock
            innovationFlow={innovationFlow}
            loading={state.loading}
            onUpdate={actions.updateInnovationFlowProfile}
            canEdit={authorization.canEditInnovationFlow}
          >
            <InnovationFlowCollaborationToolsBlock
              callouts={callouts}
              innovationFlowStates={innovationFlow?.states}
              currentState={innovationFlow?.currentState.displayName}
              onUpdateCurrentState={actions.updateInnovationFlowCurrentState}
              onUpdateFlowStateOrder={actions.updateInnovationFlowStateOrder}
              onUpdateCalloutFlowState={actions.updateCalloutFlowState}
              onCreateFlowState={(state, options) => actions.createState(state, options.after)}
              onEditFlowState={actions.editState}
              onDeleteFlowState={actions.deleteState}
            />
          </InnovationFlowProfileBlock>
        </DialogContent>
      </DialogWithGrid>
    </>
  );
};

export default InnovationFlowSettingsDialog;
