export type PromptGraphDataStruct = {
  title: string;
  type: string;
  properties: DataPoint[];
};

export type DataPoint = {
  description: string;
  name: string;
  type: string;
  optional: boolean;
  items?: PromptGraphDataStruct;
};

export type FormNodeValue = {
  input_variables: string[];
  prompt: string;
  output?: { properties: DataPoint[] };
  system: boolean;
};

export type PromptGraphNode = {
  name: string;
  system: boolean;
  input_variables?: string[];
  prompt?: string;
  output?: PromptGraphDataStruct;
};

export type PromptGraphState = {
  title: string;
  type: string;
  properties: DataPoint[];
};

export type FormValueType = {
  nodes: Record<string, FormNodeValue>;
  state: PromptGraphState;
};
