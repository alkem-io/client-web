import type { ComponentType, ReactNode } from 'react';
import InnovationFlowChips from '../InnovationFlowVisualizers/InnovationFlowChips';
import type { InnovationFlowVisualizerProps } from '../InnovationFlowVisualizers/InnovationFlowVisualizer';
import type { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';

type InnovationFlowStatesProps = {
  states: InnovationFlowStateModel[] | undefined;
  currentState?: string;
  selectedState: string | undefined;
  onSelectState?: (state: InnovationFlowStateModel) => void;
  visualizer?: ComponentType<InnovationFlowVisualizerProps>;
  createButton?: ReactNode;
  settingsButton?: ReactNode;
};

const InnovationFlowStates = ({
  states = [],
  currentState,
  selectedState,
  createButton,
  settingsButton,
  onSelectState,
  visualizer: Visualizer = InnovationFlowChips,
}: InnovationFlowStatesProps) => {
  return (
    <Visualizer
      states={states}
      currentState={currentState}
      selectedState={selectedState}
      createButton={createButton}
      settingsButton={settingsButton}
      onSelectState={onSelectState}
    />
  );
};

export default InnovationFlowStates;
