export type DataPoint = {
  description: string;
  name: string;
  type: string;
  optional: boolean;
};
export type FormNodeValue = {
  input_variables: string[];
  prompt: string;
  output?: { properties: DataPoint[] };
};

export type PromptGraphNode = {
  name: string;
  system: boolean;
  input_variables: string[];
  prompt: string;
  output?: {
    title: string;
    type: string;
    properties: DataPoint[];
  };
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
