import { ComponentType, useState } from 'react';
import InnovationFlowSettingsDialog from '../InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { InnovationFlowState } from '../InnovationFlow';
import InnovationFlowChips from '../InnovationFlowChips/InnovationFlowChips';

interface Props {
  states: InnovationFlowState[] | undefined;
  currentState?: string;
  selectedState: string | undefined;
  onSelectState?: (state: InnovationFlowState) => void;
  visualizer?: ComponentType<InnovationFlowVisualizerProps>;
}

interface InnovationFlowVisualizerProps {
  states: InnovationFlowState[];
  currentState?: string;
  selectedState: string | undefined;
  showSettings?: boolean;
  onSettingsOpen?: () => void;
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
  visualizer: Visualizer = InnovationFlowChips,
}: InnovationFlowStatesProps) => {
  const [showSettingsDialog, setShowSettingsDialog] = useState(false);

  return (
    <>
      <Visualizer
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
    </>
  );
};

export default InnovationFlowStates;
