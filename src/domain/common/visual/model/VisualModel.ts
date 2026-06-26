import type { VisualType } from '@/core/apollo/generated/graphql-schema';

export interface VisualModel {
  id: string;
  uri: string;
  name: VisualType;
  alternativeText?: string;
}

/**
 * Upload constraints for a visual (avatar / banner / cardBanner): the allowed mime
 * types plus the min/max dimensions and aspect ratio an image must satisfy. Sourced
 * from `platform.configuration.defaultVisualTypeConstraints`.
 */
export type VisualConstraints = {
  maxWidth: number;
  maxHeight: number;
  minWidth: number;
  minHeight: number;
  aspectRatio: number;
  allowedTypes: string[];
};
