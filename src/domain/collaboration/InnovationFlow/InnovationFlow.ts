export interface InnovationFlowDetails {
  id: string;
  states: InnovationFlowState[] | undefined;
  currentState: {
    displayName: string | undefined;
  };
}

export type InnovationFlowState = {
  displayName: string;
  description: string;
};
