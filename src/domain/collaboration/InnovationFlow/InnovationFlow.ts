export interface InnovationFlowDetails {
  id: string;
  states: InnovationFlowState[];
  currentState: string | undefined;
}

export type InnovationFlowState = {
  displayName: string;
  description: string;
};