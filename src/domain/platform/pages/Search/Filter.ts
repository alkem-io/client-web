export interface FilterDefinition {
  title: string;
  value: string[];
  typename: string;
}

export interface FilterConfig {
  [key: string]: FilterDefinition;
}
