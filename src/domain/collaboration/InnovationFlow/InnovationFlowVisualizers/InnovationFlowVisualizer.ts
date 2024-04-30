import { ReactNode } from 'react';
import { InnovationFlowState } from '../InnovationFlow';

export interface InnovationFlowVisualizerProps {
  states: InnovationFlowState[];
  currentState?: string;
  selectedState: string | undefined;
  onSelectState?: (state: InnovationFlowState) => void;
  createButton?: ReactNode;
  settingsButton?: ReactNode;
}
