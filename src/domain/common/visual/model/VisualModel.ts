export interface VisualModel {
  id: string;
  allowedTypes: string[];
  uri: string;
  alternativeText?: string;
  name: string; // VisualType
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
}
