export type JourneyTypeName = 'space' | 'challenge' | 'opportunity';

export const getJourneyTypeName = (
  challengeId: string | undefined,
  opportunityId: string | undefined
): JourneyTypeName => {
  if (opportunityId) {
    return 'opportunity';
  }
  if (challengeId) {
    return 'challenge';
  }
  return 'space';
};
