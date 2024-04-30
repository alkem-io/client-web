import { ProfileType } from '../../core/apollo/generated/graphql-schema';

export type JourneyTypeName = 'space' | 'subspace' | 'subsubspace';

interface JourneyLocation {
  spaceNameId: string;
  challengeNameId: string;
  opportunityNameId: string;
}

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
        return 'subspace';
      case 'OPPORTUNITY':
        return 'subsubspace';
    }
  } else {
    if (journeyLocation.opportunityNameId) {
      return 'subsubspace';
    }
    if (journeyLocation.challengeNameId) {
      return 'subspace';
    }
    if (journeyLocation.spaceNameId) {
      return 'space';
    }
  }
};
