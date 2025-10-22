export type FormNodeValue = {
  input_variables: string[];
  prompt: string;
  output?: { properties: any[] };
};

export type PromptGraphNode = {
  name: string;
  system: boolean;
  input_variables: string[];
  prompt: string;
  output?: {
    title: string;
    type: string;
    properties: any[];
  };
};

export type FormValueType = {
  prompt: string;
  nodes: Record<string, FormNodeValue>;
};
