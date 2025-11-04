import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

/**
 * Determines if a space is a subspace (not top-level L0).
 */
export const isSubspace = (level: SpaceLevel): boolean => level !== SpaceLevel.L0;

/**
 * Determines if a space is not the last level (L2).
 * Useful for features that only apply to spaces that can have children.
 */
export const isNotLastLevel = (level: SpaceLevel): boolean => level !== SpaceLevel.L2;
