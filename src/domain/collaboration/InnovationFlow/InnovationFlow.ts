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

export interface InnovationFlowTemplate {
  states: InnovationFlowState[];
  id: string;
  profile: InnovationFlowTemplateProfile;
}

export interface InnovationFlowTemplateProfile {
  id: string;
  displayName: string;
  tagset?: {
    tags: string[];
  };
}
