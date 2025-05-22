export interface VisualModel {
  id: string;
  uri: string;
  name: string; // VisualType
  alternativeText?: string;
}

export interface VisualModelFull extends VisualModel {
  allowedTypes: string[];
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
}
