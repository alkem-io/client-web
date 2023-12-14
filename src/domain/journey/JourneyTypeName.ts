import { JourneyLocation } from '../../main/routing/urlBuilders';
import { ProfileType } from '../../core/apollo/generated/graphql-schema';

export type JourneyTypeName = 'space' | 'challenge' | 'opportunity';

export const getJourneyTypeName = (
  journeyLocation: Partial<JourneyLocation> | ProfileType | undefined
): JourneyTypeName | undefined => {
  if (typeof journeyLocation === 'undefined') {
    return undefined;
  }
  if (typeof journeyLocation === 'string') {
    switch (journeyLocation) {
      case 'SPACE':
        return 'space';
      case 'CHALLENGE':
        return 'challenge';
      case 'OPPORTUNITY':
        return 'opportunity';
    }
  } else {
    if (journeyLocation.opportunityNameId) {
      return 'opportunity';
    }
    if (journeyLocation.challengeNameId) {
      return 'challenge';
    }
    if (journeyLocation.spaceNameId) {
      return 'space';
    }
  }
};
