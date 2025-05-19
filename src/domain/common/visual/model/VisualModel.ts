// VisualModel.ts
// Model for Visual based on Visual type from graphql-schema

import { Visual, VisualType } from '@/core/apollo/generated/graphql-schema';

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

// Utility to convert a Visual (from GraphQL) to VisualModel
export function toVisualModel(visual: Visual): VisualModel {
  return {
    id: visual.id,
    name: visual.name,
    allowedTypes: visual.allowedTypes,
    uri: visual.uri,
    alternativeText: visual.alternativeText,
    aspectRatio: visual.aspectRatio,
    maxHeight: visual.maxHeight,
    maxWidth: visual.maxWidth,
    minHeight: visual.minHeight,
    minWidth: visual.minWidth,
  };
}
