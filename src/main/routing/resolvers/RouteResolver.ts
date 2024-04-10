import { useUrlParams } from '../../../core/routing/useUrlParams';
import { useCalloutIdQuery, useJourneyRouteResolverQuery } from '../../../core/apollo/generated/apollo-hooks';
import { getJourneyTypeName, JourneyTypeName } from '../../../domain/journey/JourneyTypeName';

enum RouteType {
  Journey = 'Journey',
}

interface JourneyRouteParams {
  spaceId?: string;
  subSpaceId?: string;
  subSubSpaceId?: string;
  type: RouteType.Journey;
  journeyId: string | undefined;
  journeyTypeName: JourneyTypeName;
}

interface JourneyCalloutRouteParams extends JourneyRouteParams {
  calloutId: string | undefined;
}

interface RouteResolverState {
  loading: boolean;
}

type AllParams = JourneyRouteParams & JourneyCalloutRouteParams;

type LazyParams<Params extends {}> = {
  [K in keyof AllParams]: K extends keyof Params ? Params[K] : undefined;
};

type RouteParams = RouteResolverState & (LazyParams<JourneyRouteParams> | LazyParams<JourneyCalloutRouteParams>);

// type JourneyLevel = 0 | 1 | 2;

// const JOURNEY_PARAM_NESTING: (keyof JourneyLocation)[] = ['spaceNameId', 'challengeNameId', 'opportunityNameId'];

// const getJourneyLevel = (urlParams: Partial<JourneyLocation>): JourneyLevel | -1 => {
//   const journeyTypeName = getJourneyTypeName(urlParams);
//   return takeWhile(JOURNEY_PARAM_NESTING, (param) => urlParams[param]).length - 1 as JourneyLevel | -1;
// };

export const useRouteResolver = (): RouteParams => {
  const { spaceNameId, challengeNameId, opportunityNameId, calloutNameId } = useUrlParams();

  const { data, loading: loadingJourney } = useJourneyRouteResolverQuery({
    variables: {
      spaceNameId: spaceNameId!,
      challengeNameId,
      opportunityNameId,
      includeChallenge: !!challengeNameId,
      includeOpportunity: !!opportunityNameId,
    },
    skip: !spaceNameId,
  });

  const resolvedJourney: JourneyRouteParams = {
    spaceId: data?.space.id,
    subSpaceId: data?.space.subspace?.id,
    subSubSpaceId: data?.space.subspace?.subspace?.id,
    type: RouteType.Journey,
    journeyId: data?.space.subspace?.subspace?.id ?? data?.space.subspace?.id ?? data?.space.id,
    journeyTypeName: getJourneyTypeName({ spaceNameId, challengeNameId, opportunityNameId })!,
  };

  const { data: calloutData, loading: loadingCallout } = useCalloutIdQuery({
    variables: {
      calloutNameId: calloutNameId!,
      spaceId: resolvedJourney.subSubSpaceId ?? resolvedJourney.subSpaceId ?? resolvedJourney.spaceId!,
    },
    skip: !resolvedJourney.journeyId || !calloutNameId,
  });

  const collaboration =
    calloutData?.space?.collaboration ?? calloutData?.space?.collaboration ?? calloutData?.space?.collaboration;

  const calloutId = collaboration?.callouts?.[0]?.id;

  const loading = loadingJourney || loadingCallout;

  return {
    loading,
    ...resolvedJourney,
    calloutId,
  };
};
