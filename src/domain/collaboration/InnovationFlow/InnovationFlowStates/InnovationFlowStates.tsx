import { useState } from 'react';
import PageContentBlockSeamless from '../../../../core/ui/content/PageContentBlockSeamless';
import InnovationFlowSettingsDialog from '../InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { InnovationFlowState } from '../InnovationFlow';
import InnovationFlowChips from '../InnovationFlowChips/InnovationFlowChips';

interface Props {
  states: InnovationFlowState[] | undefined;
  currentState?: string;
  selectedState: string | undefined;
  onSelectState?: (state: InnovationFlowState) => void;
}

type InnovationFlowStatesProps = Props &
  (
    | {
        showSettings?: false;
        collaborationId?: undefined;
      }
    | {
        showSettings: true;
        collaborationId: string;
      }
  );

const InnovationFlowStates = ({
  collaborationId,
  states = [],
  currentState,
  selectedState,
  showSettings = false,
  onSelectState,
}: InnovationFlowStatesProps) => {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  return (
    <PageContentBlockSeamless disablePadding>
      <InnovationFlowChips
        states={states}
        currentState={currentState}
        selectedState={selectedState}
        showSettings={showSettings}
        onSettingsOpen={() => setShowSettingsDialog(true)}
        onSelectState={onSelectState}
      />
      <InnovationFlowSettingsDialog
        collaborationId={collaborationId}
        open={showSettingsDialog}
        onClose={() => setShowSettingsDialog(false)}
      />
    </PageContentBlockSeamless>
  );
};

export default InnovationFlowStates;
