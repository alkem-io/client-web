export interface InnovationFlowDetails {
  id: string;
  states: InnovationFlowState[] | undefined;
  currentState: string | undefined;
}

export type InnovationFlowState = {
  displayName: string;
  description: string;
};