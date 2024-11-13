import { SpaceLevel } from '@core/apollo/generated/graphql-schema';
import { JourneyTypeName } from '../../journey/JourneyTypeName';

export const getChildJourneyTypeName = ({ level }: { level: SpaceLevel }): JourneyTypeName => {
  switch (level) {
    case SpaceLevel.Challenge:
      return 'subspace' as JourneyTypeName;
    case SpaceLevel.Opportunity:
      return 'subsubspace' as JourneyTypeName;
    case SpaceLevel.Space:
    default:
      return 'space' as JourneyTypeName;
  }
};
