import { JourneyLocation } from '../../main/routing/urlBuilders';

export type JourneyTypeName = 'space' | 'challenge' | 'opportunity';

type ChildJourneyLocation = Pick<JourneyLocation, 'challengeNameId' | 'opportunityNameId'>;

export const getJourneyTypeName = (journeyLocation: ChildJourneyLocation): JourneyTypeName => {
  if (journeyLocation.opportunityNameId) {
    return 'opportunity';
  }
  if (journeyLocation.challengeNameId) {
    return 'challenge';
  }
  return 'space';
};

export const getRawJourneyTypeName = (journeyLocation: Partial<JourneyLocation>): JourneyTypeName | undefined => {
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
