export type FormValueType = {
  prompt: string;
  nodes: Record<string, { input_variables: string[]; prompt: string; output?: { properties: any[] } }>;
};
