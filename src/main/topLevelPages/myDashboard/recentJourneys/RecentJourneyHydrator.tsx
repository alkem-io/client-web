import { JourneyTypeName } from '../../../../domain/journey/JourneyTypeName';
import { ComponentType } from 'react';
import { Visual } from '../../../../domain/common/visual/Visual';
import { useRecentJourneyQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface RecentJourneyHydratorProps {
  journey: {
    id: string;
    __typename: string;
  };
  component: ComponentType<{
    journey:
      | {
          profile: {
            displayName: string;
            url: string;
            cardBanner?: Visual;
          };
        }
      | undefined;
    journeyTypeName: JourneyTypeName;
  }>;
}

const getJourneyTypeName = (typename: string): JourneyTypeName | undefined => {
  switch (typename) {
    case 'Space':
      return 'space';
    case 'Challenge':
      return 'challenge';
    case 'Opportunity':
      return 'opportunity';
  }
};

const RecentJourneyHydrator = ({ journey, component: Component }: RecentJourneyHydratorProps) => {
  const journeyTypeName = getJourneyTypeName(journey.__typename);

  const { data } = useRecentJourneyQuery({
    variables: {
      spaceId: journey.id,
      challengeId: journey.id,
      opportunityId: journey.id,
      includeSpace: journeyTypeName === 'space',
      includeChallenge: journeyTypeName === 'challenge',
      includeOpportunity: journeyTypeName === 'opportunity',
    },
    skip: !journeyTypeName,
  });

  const hydratedJourney = data?.space ?? data?.lookup.challenge ?? data?.lookup.opportunity;

  if (!journeyTypeName) {
    return null;
  }

  return <Component journey={hydratedJourney} journeyTypeName={journeyTypeName} />;
};

export default RecentJourneyHydrator;
