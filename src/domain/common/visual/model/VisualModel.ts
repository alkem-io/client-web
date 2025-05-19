// Model for Visual based on Visual type from graphql-schema
import { VisualType } from '@/core/apollo/generated/graphql-schema';

export interface VisualModel {
  id: string;
  name: string;
  allowedTypes: string[];
  uri: string;
  alternativeText?: string;
  type?: VisualType;
  aspectRatio: number;
  maxHeight: number;
  maxWidth: number;
  minHeight: number;
  minWidth: number;
}
