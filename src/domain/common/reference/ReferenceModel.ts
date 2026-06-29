export interface ReferenceModel {
  id: string;
  ID?: string; // For backward compatibility
  name: string;
  uri: string;
  description?: string;
}
