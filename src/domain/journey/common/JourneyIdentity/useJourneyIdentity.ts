import { useMemo } from 'react';
import { JourneyLocation } from '../../../../main/routing/urlBuilders';
import { getJourneyTypeName, JourneyTypeName } from '../../JourneyTypeName';
import { useJourneyIdentityQuery } from '../../../../core/apollo/generated/apollo-hooks';

export interface JourneyIdentity {
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

const useJourneyIdentity = (journeyLocation: JourneyLocation): JourneyIdentity => {
  const journeyTypeName = getJourneyTypeName(journeyLocation)!;

  const { data: journeyIdentityData } = useJourneyIdentityQuery({
    variables: {
      ...journeyLocation,
      isChallenge: journeyTypeName === 'challenge',
      isOpportunity: journeyTypeName === 'opportunity',
    },
  });

  const journeyId =
    journeyIdentityData?.space.opportunity?.id ??
    journeyIdentityData?.space.challenge?.id ??
    journeyIdentityData?.space.id;

  return useMemo(
    () => ({
      journeyId,
      journeyTypeName,
    }),
    [journeyTypeName, journeyId]
  );
};

export default useJourneyIdentity;
