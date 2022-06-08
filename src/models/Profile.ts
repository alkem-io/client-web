export interface Tagset {
  id?: string;
  name: string;
  tags: string[];
}
export interface UpdateTagset {
  id: string;
  name: string;
  tags: string[];
}

export interface Reference {
  id?: string;
  name: string;
  uri: string;
  description?: string;
}
