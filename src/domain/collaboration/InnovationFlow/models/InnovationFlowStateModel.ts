export type InnovationFlowStateModel = {
  displayName: string;
  description?: string;
  settings: {
    allowNewCallouts: boolean;
  };
  sortOrder: number;
};
