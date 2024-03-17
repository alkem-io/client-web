import { useUrlParams } from '../../../core/routing/useUrlParams';
import { useJourneyRouteResolverQuery } from '../../../core/apollo/generated/apollo-hooks';
import { getJourneyTypeName, JourneyTypeName } from '../../../domain/journey/JourneyTypeName';
// import { JourneyLocation } from '../urlBuilders';
// import { takeWhile } from 'lodash';

enum RouteType {
  Journey = 'Journey',
}

interface JourneyRouteParams {
  spaceId?: string;
  challengeId?: string;
  opportunityId?: string;
  type: RouteType.Journey;
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

interface RouteResolverState {
  loading: boolean;
}

type RouteParams = RouteResolverState & JourneyRouteParams;

// type JourneyLevel = 0 | 1 | 2;

// const JOURNEY_PARAM_NESTING: (keyof JourneyLocation)[] = ['spaceNameId', 'challengeNameId', 'opportunityNameId'];

// const getJourneyLevel = (urlParams: Partial<JourneyLocation>): JourneyLevel | -1 => {
//   const journeyTypeName = getJourneyTypeName(urlParams);
//   return takeWhile(JOURNEY_PARAM_NESTING, (param) => urlParams[param]).length - 1 as JourneyLevel | -1;
// };

export const useRouteResolver = (): RouteParams => {
  const { spaceNameId, challengeNameId, opportunityNameId } = useUrlParams();

  const { data, loading } = useJourneyRouteResolverQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId,
      opportunityNameId,
      includeChallenge: !!challengeNameId,
      includeOpportunity: !!opportunityNameId,
    },
    skip: !spaceNameId,
  });

  return {
    loading,
    spaceId: data?.space.id,
    challengeId: data?.space.challenge?.id,
    opportunityId: data?.space.opportunity?.id,
    type: RouteType.Journey,
    journeyId: data?.space.opportunity?.id ?? data?.space.challenge?.id ?? data?.space.id,
    journeyTypeName: getJourneyTypeName({ spaceNameId, challengeNameId, opportunityNameId })!,
  };
};
