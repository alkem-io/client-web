import { JourneyTypeName } from '../../../../domain/journey/JourneyTypeName';
import { ComponentType } from 'react';
import { Visual } from '../../../../domain/common/visual/Visual';
import { useRecentJourneyQuery } from '../../../../core/apollo/generated/apollo-hooks';

interface RecentJourneyHydratorProps {
  journey: {
    id: string;
    __typename: string;
  };
  // journeyId: string;
  // journeyTypeName: JourneyTypeName;
  component: ComponentType<{
    journey:
      | {
          profile: {
            url: string;
            avatar?: Visual;
          };
        }
      | undefined;
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

  return <Component journey={hydratedJourney} />;
};

export default RecentJourneyHydrator;
