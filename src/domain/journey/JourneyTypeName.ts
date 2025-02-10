import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';

export const getSpaceLabel = (spaceLevel: SpaceLevel) => {
  if (spaceLevel === SpaceLevel.L0) {
    return 'space' as const;
  }
  return 'subspace' as const;
};
