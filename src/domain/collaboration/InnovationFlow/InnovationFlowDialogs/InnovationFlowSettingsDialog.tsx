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
import { useUrlParams } from '../../../../core/routing/useUrlParams';

interface InnovationFlowSettingsDialogProps {
  open?: boolean;
  onClose: () => void;
}

const InnovationFlowSettingsDialog: FC<InnovationFlowSettingsDialogProps> = ({ open = false, onClose }) => {
  const { t } = useTranslation();

  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();
  if (!spaceNameId) {
    throw new Error('Must be within a Space route.');
  }

  const { data, actions, state } = useInnovationFlowSettings({
    spaceNameId: spaceNameId!,
    challengeNameId,
    opportunityNameId,
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
              currentState={innovationFlow?.lifecycle?.state}
              nextEvents={innovationFlow?.lifecycle?.nextEvents}
              onNextEventClick={nextEvent => actions.nextEvent(nextEvent)}
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
