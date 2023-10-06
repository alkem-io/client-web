import { JourneyLocation } from '../../main/routing/urlBuilders';

export type JourneyTypeName = 'space' | 'challenge' | 'opportunity';

export const getJourneyTypeName = (journeyLocation: Partial<JourneyLocation>): JourneyTypeName | undefined => {
  if (journeyLocation.opportunityNameId) {
    return 'opportunity';
  }
  if (journeyLocation.challengeNameId) {
    return 'challenge';
  }
  if (journeyLocation.spaceNameId) {
    return 'space';
  }
};
