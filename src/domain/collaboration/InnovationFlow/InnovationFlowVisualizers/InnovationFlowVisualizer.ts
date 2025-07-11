import { ReactNode } from 'react';
import { InnovationFlowStateModel } from '../models/InnovationFlowStateModel';

export interface InnovationFlowVisualizerProps {
  states: InnovationFlowStateModel[];
  currentState?: string;
  selectedState: string | undefined;
  onSelectState?: (state: InnovationFlowStateModel) => void;
  createButton?: ReactNode;
  settingsButton?: ReactNode;
}
