import { cloneElement, ComponentType, MouseEventHandler, ReactElement, ReactNode, useState } from 'react';
import InnovationFlowSettingsDialog from '../InnovationFlowDialogs/InnovationFlowSettingsDialog';
import { InnovationFlowState } from '../InnovationFlow';
import InnovationFlowChips from '../InnovationFlowChips/InnovationFlowChips';

interface InnovationFlowStatesBaseProps {
  states: InnovationFlowState[] | undefined;
  currentState?: string;
  selectedState: string | undefined;
  onSelectState?: (state: InnovationFlowState) => void;
  visualizer?: ComponentType<InnovationFlowVisualizerProps>;
  settings?: ReactElement<{ onClick: MouseEventHandler }>;
  createButton?: ReactNode;
}

interface InnovationFlowVisualizerProps {
  states: InnovationFlowState[];
  currentState?: string;
  selectedState: string | undefined;
  showSettings?: boolean;
  onSettingsOpen?: () => void;
  onSelectState?: (state: InnovationFlowState) => void;
  settings?: ReactNode;
  createButton?: ReactNode;
}

type InnovationFlowStatesProps = InnovationFlowStatesBaseProps &
  (
    | {
        settings?: never;
        collaborationId?: undefined;
      }
    | {
        settings: ReactElement<{ onClick: MouseEventHandler }>;
        collaborationId: string;
      }
  );

const InnovationFlowStates = ({
  collaborationId,
  states = [],
  currentState,
  selectedState,
  settings,
  createButton,
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
        settings={settings && cloneElement(settings, { onClick: () => setShowSettingsDialog(true) })}
        createButton={createButton}
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
