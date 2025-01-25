import { SpaceLevel } from '@/core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '@/domain/journey/JourneyTypeName';

export const getChildJourneyTypeName = ({ level }: { level: SpaceLevel }): JourneyTypeName => {
  switch (level) {
    case SpaceLevel.L1:
      return 'subspace' as JourneyTypeName;
    case SpaceLevel.L2:
      return 'subsubspace' as JourneyTypeName;
    case SpaceLevel.L0:
    default:
      return 'space' as JourneyTypeName;
  }
};
