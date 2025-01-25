import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export const getSpaceLabel = (spaceLevel: SpaceLevel) => {
  if (spaceLevel === SpaceLevel.Space) {
    return 'space' as const;
  }
  return 'subspace' as const;
};
