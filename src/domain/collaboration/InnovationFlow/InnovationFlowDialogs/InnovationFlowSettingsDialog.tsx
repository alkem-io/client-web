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
import InnovationFlowCollaborationToolsBlock from './InnovationFlowCollaborationToolsBlock';
import Gutters from '../../../../core/ui/grid/Gutters';

interface InnovationFlowSettingsDialogProps extends CoreEntityIdTypes {
  open?: boolean;
  onClose: () => void;
}

const InnovationFlowSettingsDialog: FC<InnovationFlowSettingsDialogProps> = ({ open, onClose, ...location }) => {
  const { t } = useTranslation();
  const { data, actions, state } = useInnovationFlowSettings(location);
  const { innovationFlow, callouts, flowStateAllowedValues } = data;

  return (
    <DialogWithGrid open={!!open} columns={12} onClose={onClose}>
      <DialogHeader onClose={onClose}>
        <BlockTitle>
          <InnovationFlowIcon /> {t('common.innovation-flow')}
        </BlockTitle>
      </DialogHeader>
      <DialogContent sx={{ paddingTop: 0 }}>
        <Gutters disablePadding>
          <InnovationFlowProfileBlock innovationFlow={innovationFlow} loading={state.loading} editable>
            <LifecycleStateSelector
              currentState={innovationFlow?.lifecycle?.state}
              nextEvents={innovationFlow?.lifecycle?.nextEvents}
              onNextEventClick={nextEvent => actions.nextEvent(nextEvent)}
            />
          </InnovationFlowProfileBlock>
          <InnovationFlowCollaborationToolsBlock flowStateAllowedValues={flowStateAllowedValues} callouts={callouts} />
        </Gutters>
      </DialogContent>
    </DialogWithGrid>
  );
};

export default InnovationFlowSettingsDialog;
