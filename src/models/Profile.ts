export interface Tagset {
  name: string;
  tags: Array<string>;
}

export interface Reference {
  id: string;
  name: string;
  uri: string;
  description?: string;
}
